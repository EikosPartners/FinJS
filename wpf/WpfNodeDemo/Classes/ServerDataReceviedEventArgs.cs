using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using KellermanSoftware.CompareNetObjects;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;
using ProtoBuf;

namespace WpfNodeDemo.Classes
{
    /// <summary>
    /// Event arguments when a server sends a collection T objects. 
    /// (Currently used for unit testing only)
    /// </summary>
    public class ServerDataReceivedEventArgs<T> : EventArgs where T : new()
    {
        /// <summary>
        /// Creates arguments for data received from server event.
        /// (Currently used for unit testing only)
        /// </summary>
        /// <param name="data">Collection of T Objects received from server.</param>
        /// <param name="priorComparisonResult">Results of comparison against the prior dataset.</param>
        /// <param name="rawJson">Raw JSON string received from the server.</param>
        public ServerDataReceivedEventArgs(IEnumerable<T> data, ComparisonResult priorComparisonResult, string rawJson)
        {
            Data = data;
            PriorComparisonResult = priorComparisonResult;
            RawJson = rawJson;
        }

        /// <summary>
        /// Creates arguments for data received from server event.
        /// (Currently used for unit testing only)
        /// </summary>
        /// <param name="data">Collection of T Objects received from server.</param>
        /// <param name="priorComparisonResult">Results of comparison against the prior dataset.</param>
        /// <param name="bytes">Raw JSON string received from the server.</param>
        public ServerDataReceivedEventArgs(IEnumerable<T> data, ComparisonResult priorComparisonResult, byte[] bytes)
        {
            Data = data;
            PriorComparisonResult = priorComparisonResult;
            RawBytes = bytes;
        }

        /// <summary>
        /// Collection of T Objects received from server.
        /// </summary>
        public IEnumerable<T> Data { get; set; }

        /// <summary>
        /// Results of comparison against the prior dataset.
        /// </summary>
        public ComparisonResult PriorComparisonResult { get; set; }

        /// <summary>
        /// Raw JSON string received from the server.
        /// </summary>
        public string RawJson { get; set; }

        /// <summary>
        /// Raw Byte array received from the server.
        /// </summary>
        public byte[] RawBytes { get; set; }


        #region static methods

        /// <summary>
        /// Converts JSON message from server to objects of type <see cref="T"/>.
        /// (Currently used for unit testing only)
        /// </summary>
        /// <param name="json">Well-formed JSON string from the server.</param>
        public static ServerDataReceivedEventArgs<T> DeserializeMessage(string json)
        {
            return DeserializeMessage(json, null);
        }

        /// <summary>
        /// Converts JSON message from server to objects of type <see cref="T"/>.
        /// (Currently used for unit testing only)
        /// </summary>
        /// <param name="json">Well-formed JSON string from the server.</param>
        /// <param name="currentData">Prior Data to compare against.</param>
        public static ServerDataReceivedEventArgs<T> DeserializeMessage(string json, IEnumerable<T> currentData)
        {
            //Prep the serializer
            var serializer = new JsonSerializer();
            serializer.Converters.Add(new IsoDateTimeConverter());
            serializer.NullValueHandling = NullValueHandling.Ignore;

            ServerDataReceivedEventArgs<T> resultArgs = null;
            try
            {
                //Convert the server message
                var message = JsonConvert.DeserializeObject<ServerMessage<T>>(json);
                if (!message.Args.Any())
                {
                    Console.WriteLine($"WS Message Received w/o Args: {json}");
                    return null;
                }

                //Go through each argument
                Console.WriteLine($"WS Data Received with {message.Args.Count()} arguments.");

                foreach (var messageArg in message.Args)
                {
                    var newdata = messageArg.Data;
                    ComparisonResult result = null;

                    //Compare with current data stored
                    if (currentData != null)
                    {
                        var comparer = new CompareLogic();
                        comparer.Config.MaxDifferences = int.MaxValue;

                        result = comparer.Compare(currentData, newdata);
                        Console.WriteLine($" - Data changes: {result.DifferencesString}");
                    }

                    resultArgs = new ServerDataReceivedEventArgs<T>(newdata, result, json);
                }

            }
            catch (Exception ex)
            {
                Console.WriteLine($"Data Processing Error: ({ex.GetType()}) {ex.Message}");
            }

            return resultArgs;
        }

        /// <summary>
        /// Converts Bytes message from server to objects of type <see cref="T"/>.
        /// (Currently used for unit testing only)
        /// </summary>
        /// <param name="bytes">Well-formed Byte array from the server.</param>
        public static ServerDataReceivedEventArgs<T> DeserializeMessage(byte[] bytes)
        {
            return DeserializeMessage(bytes, null);
        }

        /// <summary>
        /// Converts JSON message from server to objects of type <see cref="T"/>.
        /// (Currently used for unit testing only)
        /// </summary>
        /// <param name="bytes">Well-formed Byte array from the server.</param>
        /// <param name="currentData">Prior Data to compare against.</param>
        public static ServerDataReceivedEventArgs<T> DeserializeMessage(byte[] bytes, IEnumerable<T> currentData)
        {
            //Prep the serializer
            var serializer = new JsonSerializer();
            serializer.Converters.Add(new IsoDateTimeConverter());
            serializer.NullValueHandling = NullValueHandling.Ignore;

            ServerDataReceivedEventArgs<T> resultArgs = null;
            try
            {
                //Convert the server message
                using (var stream = new MemoryStream(bytes))
                {
                    var message = Serializer.Deserialize<ServerMessage<T>>(stream);


                    if (!message.Args.Any())
                    {
                        Console.WriteLine($"WS Message Received w/o Args: {bytes}");
                        return null;
                    }


                    //Go through each argument
                    Console.WriteLine($"WS Data Received with {message.Args.Count()} arguments.");

                    foreach (var messageArg in message.Args)
                    {
                        var newdata = messageArg.Data;
                        ComparisonResult result = null;

                        //Compare with current data stored
                        if (currentData != null)
                        {
                            var comparer = new CompareLogic();
                            comparer.Config.MaxDifferences = int.MaxValue;

                            result = comparer.Compare(currentData, newdata);
                            Console.WriteLine($" - Data changes: {result.DifferencesString}");
                        }

                        resultArgs = new ServerDataReceivedEventArgs<T>(newdata, result, bytes);
                    }
                }

            }
            catch (Exception ex)
            {
                Console.WriteLine($"Data Processing Error: ({ex.GetType()}) {ex.Message}");
            }

            return resultArgs;
        }


        #endregion
    }
}