using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Net.Sockets;
using System.Net.WebSockets;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Windows.Media;
using System.Windows.Threading;
using Newtonsoft.Json;
using ProtoBuf;
using static System.StringComparison;

namespace WpfNodeDemo.Classes
{
    /// <summary>
    /// Establish a web socket server connection to listen for <see cref="ServerMessage&lt;T&gt;"/>s which will 
    /// contain collections of objects of type <see cref="T"/>.  If the connection is broken it will automatically 
    /// try to reestablish it using the last server call made.
    /// </summary>
    /// <typeparam name="T">Object type to be returned from server.</typeparam>
    public class ServerConnection<T> where T: new()
    {
        #region Exposed Properties

        /// <summary>
        /// Current Connection state.
        /// </summary>
        public WebSocketState State => WebSocket.State;

        /// <summary>
        /// Current Connection Sub Protocol supported.
        /// </summary>
        public string SubProtocol => WebSocket.SubProtocol;

        /// <summary>
        /// Total number of records on the server.
        /// </summary>
        public int TotalCount { get; private set; }

        /// <summary>
        /// Number of filtered records on the server.
        /// </summary>
        public int FilteredCount { get; private set; }

        /// <summary>
        /// Current starting row number on the server.
        /// </summary>
        public int StartRow { get; private set; }

        /// <summary>
        /// Current ending row number on the server.
        /// </summary>
        public int EndRow { get; private set; }

        /// <summary>
        /// Indicates if the new orders from the server will be processed.
        /// </summary>
        public bool IsUpdatePaused { get; protected set; }

        #endregion

        #region Protected Properties

        /// <summary>
        /// Keep reference to the last sever call made in case the connection goes down.
        /// </summary>
        protected ServerCall LastServerCall { get; set; }

        /// <summary>
        /// Connection URL provided when the call to create the connection was made.
        /// </summary>
        protected string ConnectionUrl { get; set; }

        /// <summary>
        /// Encoding helper for converting messages from byte to strings.
        /// </summary>
        protected UTF8Encoding Utf8Encoding { get; } = new UTF8Encoding();

        /// <summary>
        /// Last Data Collection received from the server.
        /// </summary>
        protected IEnumerable<T> CurrentData { get; set; }

        /// <summary>
        /// Web Socket connection to the server
        /// </summary>
        protected ClientWebSocket WebSocket { get; set; } = new ClientWebSocket();

        /// <summary>
        /// Sets the size of the buffer * 1024 when receiving data from the server.
        /// </summary>
        protected int SocketBufferMultiplier { get; set; } = 10;

        /// <summary>
        /// Hail-Mary fall-back when calling <see cref="WebSocket"/>.<c>SendAsync</c> to make sure a 
        /// second call is not made to the server when one is outstanding.
        /// </summary>
        protected bool SendWaiting { get; set; }

        #endregion

        #region Connection Methods

        /// <summary>
        /// Create the connection to the server via the url provided and reconnection automatically if the 
        /// connection is lost.
        /// </summary>
        /// <param name="webSocketUrl">Well-formed URL include "ws" prefix and port number if needed.</param>
        public async Task CreateConnection(string webSocketUrl)
        {
            ConnectionUrl = webSocketUrl;
            var retry = true;

            while (retry)
            {
                try
                {
                    await Open();
                    retry = false;
    
                    #pragma warning disable 4014
                    //Set up receiver synchronously so control is yielded when the function awaits the first message
                    Receive();
                    #pragma warning restore 4014
                }
                catch (WebSocketException ex)
                {
                    Trace.WriteLine(ex);
                    await Task.Delay(1000);
                }
                catch (Exception ex)
                {
                    Trace.WriteLine(ex);
                    OnConnectionLog($"WS Error: ({ex.GetType()}) {ex.Message}");
                    retry = false;
                }

            }
        }

        /// <summary>
        /// Sets the buffer used when receiving messages from the server.
        /// </summary>
        /// <param name="multiplier">Multiplier * 1024 determines the number of <see cref="byte"/> count for the buffer.</param>
        public void SetBufferMultiplier(int multiplier)
        {
            if (multiplier > 0)
                SocketBufferMultiplier = multiplier;
        }

        /// <summary>
        /// Establishes a connection to a web socket server.
        /// </summary>
        protected async Task Open()
        {
            var uri = new Uri(ConnectionUrl);
            WebSocket = new ClientWebSocket();

            await WebSocket.ConnectAsync(uri, CancellationToken.None);
            OnConnectionLog($"WS connection established: {WebSocket.State == WebSocketState.Open}");

            OnConnected();
        }

        /// <summary>
        /// Closes the web socket connection to the server.
        /// </summary>
        public async Task Close(string message = "Client Requested Closure")
        {
            if (WebSocket.State == WebSocketState.Closed)
                return;

            await WebSocket.CloseAsync(WebSocketCloseStatus.NormalClosure, message, CancellationToken.None);
            OnConnectionLog("WS Connection closed.");

            OnDisconnected();
        }

        /// <summary>
        /// Send the message to the server.
        /// </summary>
        /// <param name="serverCall">Call to server with arguments.</param>
        public async Task Send(ServerCall serverCall)
        {
            LastServerCall = serverCall;

            //Make sure there is not already one sent
            if (SendWaiting)
                return;

            //Create the bugger and wait for confirmation
            var json = serverCall.ToJson();
            var buffer = Utf8Encoding.GetBytes(json);

            SendWaiting = true;
            await WebSocket.SendAsync(new ArraySegment<byte>(buffer), WebSocketMessageType.Text, true, CancellationToken.None);
            SendWaiting = false;

            OnConnectionLog($"WS message sent to server: {json}");
        }

        /// <summary>
        /// Setup to listen for messages from the server
        /// </summary>
        protected async Task Receive()
        {
            try
            {
                while (WebSocket.State == WebSocketState.Open)
                {
                    const int buffersize = 1024;
                    var buffer = new byte[buffersize * 100 * SocketBufferMultiplier];
                    var offset = 0;
                    var isBinary = false;

                    while (true)
                    {
                        //Start the listener
                        var temporaryBuffer = new byte[buffersize * SocketBufferMultiplier];
                        var result = await WebSocket.ReceiveAsync(new ArraySegment<byte>(temporaryBuffer), CancellationToken.None);

                        //If this is a call to close the break out
                        if (result.MessageType == WebSocketMessageType.Close)
                        {
                            await WebSocket.CloseAsync(WebSocketCloseStatus.NormalClosure, string.Empty, CancellationToken.None);
                            break;
                        }

                        //Make sure we are not in a paused state
                        if (IsUpdatePaused)
                            continue;

                        //Buffer to the current response data
                        temporaryBuffer.CopyTo(buffer, offset);
                        offset += result.Count;

                        //Watch for the end of the message
                        if (result.EndOfMessage)
                        {
                            isBinary = result.MessageType == WebSocketMessageType.Binary;
                            break;
                        }
                    }

                    var messageBuffer = buffer.Take(offset).ToArray();

                    if (isBinary)
                    {
                        //Encoded via protobuf
                        ParseByteArray(messageBuffer);
                    }
                    else
                    {
                        //Parse as JSON
                        var text = Encoding.UTF8.GetString(messageBuffer);

                        if (string.IsNullOrEmpty(text))
                            continue;

                        OnConnectionLog($"WS message received from server ({DateTime.Now}): {text.Substring(0, 50)}...");
                        if (text.Substring(0, 1) == "{")
                            ParseJsonMessage(text);
                    }
                }
            }
            catch (WebSocketException ex)
            {
                if (ex.InnerException is SocketException)
                {
                    OnConnectionLog($"WS Error: Connection was forcibly closed!");
                    OnDisconnected();

                    //Try to reestablish the connection on a dispatcher to make sure this thread closes
                    await Dispatcher.CurrentDispatcher.InvokeAsync(() => Reconnect());
                }
                else
                {
                    OnConnectionLog($"WS Error: ({ex.GetType()}) {ex.Message}");
                }
            }
            catch (Exception ex)
            {
                Trace.WriteLine(ex);
                OnConnectionLog($"WS Error: ({ex.GetType()}) {ex.Message}");
            }
        }

        /// <summary>
        /// Recreates the connection to the server and sends the last server call made.
        /// </summary>
        /// <returns></returns>
        protected async Task Reconnect()
        {
            await CreateConnection(ConnectionUrl);
            OnConnected();
            await Send(LastServerCall);
        }

        /// <summary>
        /// Pause event notification when new orders are received from the server.
        /// </summary>
        public void PauseUpdate()
        {
            IsUpdatePaused = true;
        }

        /// <summary>
        /// Resume event notification when new orders are received from the server.
        /// </summary>
        public void ResumeUpdate()
        {
            IsUpdatePaused = false;
        }

        #endregion

        #region Object Methods

        /// <summary>
        /// Stores a <see cref="ServerCall"/> as next to be used when the next <see cref="Send"/> event occurs (normal or after
        /// a reconnect), overwriting the last call made if any.
        /// </summary>
        /// <param name="serverCall">Call to be made with the next <see cref="Send"/> event.</param>
        public void StoreNextServerCall(ServerCall serverCall)
        {
            LastServerCall = serverCall;
        }

        /// <summary>
        /// Extracts the row collection data from the Byte Array message and invokes the data received event.
        /// </summary>
        /// <param name="bytes">Well-formed encoded Byte Array from the server.</param>
        protected void ParseByteArray(byte[] bytes)
        {
            using (var stream = new MemoryStream(bytes))
            {
                var message = Serializer.Deserialize<ServerMessage<T>>(stream);
                var arg = message.Args.First();

                //Update the count
                TotalCount = arg.TotalCount;
                FilteredCount = arg.FilteredCount;
                StartRow = arg.Start;
                EndRow = arg.End;

                //Trigger the event
                OnBytesReceived(bytes, arg.Data, arg.End - arg.Start);
            }
        }

        /// <summary>
        /// Extracts the row collection string from the JSON message and invokes the data received event.
        /// </summary>
        /// <param name="json">Well-formed JSON string from the server.</param>
        protected void ParseJsonMessage(string json)
        {
            var hollowjson = json;
            var rowsjson = string.Empty;

            //See if there are rows first
            var startIdx = json.IndexOf("{", json.IndexOf("\"data\"", Ordinal), Ordinal);
            if (startIdx >= 0)
            {
                //Update the counts by skipping deserializing the rows
                var endIdx = json.IndexOf("]", startIdx, Ordinal);
                hollowjson = $"{json.Substring(0, startIdx)}{json.Substring(endIdx)}";
                rowsjson = json.Substring(startIdx, endIdx - startIdx);
            }

            //Convert the json wo the rows for performance
            var message = JsonConvert.DeserializeObject<ServerMessage<T>>(hollowjson);
            var arg = message.Args.First();

            //Update the count
            TotalCount = arg.TotalCount;
            FilteredCount = arg.FilteredCount;
            StartRow = arg.Start;
            EndRow = arg.End;

            //Trigger the event
            OnJsonReceived(json, rowsjson, arg.End - arg.Start);
        }

        #endregion

        #region Logging Event

        /// <summary>
        /// Fired when a message is received from the server or data is processed.
        /// </summary>
        public event EventHandler<string> ConnectionLog;

        /// <summary>
        /// Call the invocation list of <see cref="ConnectionLog"/> Event
        /// </summary>
        /// <param name="message">Message String</param>
        protected void OnConnectionLog(string message)
        {
            var timestamp = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss.fff", CultureInfo.InvariantCulture);
            ConnectionLog?.Invoke(this, $"({timestamp}) {message}");
        }

        #endregion

        #region Byte Array Received Event

        /// <summary>
        /// Handler to process Byte array received over the web socket connection from the server
        /// </summary>
        /// <param name="sender"><see cref="ServerConnection&lt;T&gt;"/> object.</param>
        /// <param name="e"><see cref="ServerBytesReceivedEventArgs&lt;T&gt;"/> containing event data.</param>
        public delegate void ServerBytesReceivedEventHandler(object sender, ServerBytesReceivedEventArgs<T> e);

        /// <summary>
        /// Fired when a new bytes data collection is received and ready to load.
        /// </summary>
        public event ServerBytesReceivedEventHandler ServerBytesReceived;

        /// <summary>
        /// Call the invocation list of <see cref="ServerBytesReceived"/> Event.
        /// </summary>
        /// <param name="rawData">Raw byte array received from server.</param>
        /// <param name="rowData">Collection of rows.</param>
        /// <param name="rowCount">Number of rows received in this event.</param>
        protected void OnBytesReceived(byte[] rawData, IEnumerable<T> rowData, int rowCount)
        {
            ServerBytesReceived?.Invoke(this, new ServerBytesReceivedEventArgs<T>(rawData, rowData, rowCount));
        }

        #endregion

        #region JSON Received Event

        /// <summary>
        /// Handler to process JSON received over the web socket connection from the server
        /// </summary>
        /// <param name="sender"><see cref="ServerConnection&lt;T&gt;"/> object.</param>
        /// <param name="e"><see cref="ServerJsonReceivedEventArgs"/> containing event data.</param>
        public delegate void ServerJsonReceivedEventHandler(object sender, ServerJsonReceivedEventArgs e);

        /// <summary>
        /// Fired when a new data collection is received and ready to load.
        /// </summary>
        public event ServerJsonReceivedEventHandler ServerJsonReceived;

        /// <summary>
        /// Call the invocation list of <see cref="ServerJsonReceived"/> Event.
        /// </summary>
        /// <param name="rawJson">Raw JSON message received from server.</param>
        /// <param name="rowJson">Section of JSON in the Raw string that represents the collection of rows separated by commas.</param>
        /// <param name="rowCount">Number of rows received in this event.</param>
        protected void OnJsonReceived(string rawJson, string rowJson, int rowCount)
        {
            ServerJsonReceived?.Invoke(this, new ServerJsonReceivedEventArgs(rawJson, rowJson, rowCount));
        }

        #endregion

        #region Disconnected Event

        /// <summary>
        /// Fired when the connection to the server is closed or lost.
        /// </summary>
        public event EventHandler Disconnected;

        /// <summary>
        /// Call the invocation list of the <see cref="Disconnected"/> Event.
        /// </summary>
        protected void OnDisconnected()
        {
            Disconnected?.Invoke(this, EventArgs.Empty);
        }

        #endregion

        #region Connected Event

        /// <summary>
        /// Fired when the connection to the server is established or reestablished after a disconnect.
        /// </summary>
        public event EventHandler Connected;

        /// <summary>
        /// Call the invocation list of the <see cref="Connected"/> Event.
        /// </summary>
        protected void OnConnected()
        {
            Connected?.Invoke(this, EventArgs.Empty);
        }

        #endregion


    }
}
