namespace WpfNodeDemo.Classes
{
    /// <summary>
    /// Event arguments when a server sends a JSON string. 
    /// </summary>
    public class ServerJsonReceivedEventArgs
    {
        /// <summary>
        /// Creates arguments for data received from server event.
        /// </summary>
        /// <param name="rawJson">Raw JSON string received from the server.</param>
        /// <param name="rowsJson">Section of JSON in the Raw string that represents the collection of rows separated by commas.</param>
        /// <param name="rowCount">Number of rows received in this event.</param>
        public ServerJsonReceivedEventArgs(string rawJson, string rowsJson, int rowCount)
        {
            RawJson = rawJson;
            RowsJson = rowsJson;
            RowCount = rowCount;
        }

        /// <summary>
        /// Raw JSON string received from the server.
        /// </summary>
        public string RawJson { get; set; }

        /// <summary>
        /// Section of JSON in the Raw string that represents the collection of rows separated by commas.
        /// (does not include wrapping "[]")
        /// </summary>
        public string RowsJson { get; set; }

        /// <summary>
        /// Number of rows received in this event.
        /// </summary>
        public int RowCount { get; set; }
    }
}
