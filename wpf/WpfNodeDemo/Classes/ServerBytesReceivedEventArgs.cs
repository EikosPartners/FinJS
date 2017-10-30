using System.Collections.Generic;

namespace WpfNodeDemo.Classes
{
    /// <summary>
    /// Event arguments when a server sends a Byte array message. 
    /// </summary>
    public class ServerBytesReceivedEventArgs<T>
    {
        /// <summary>
        /// Creates arguments for data received from server event.
        /// </summary>
        /// <param name="rawData">Raw byte array received from the server.</param>
        /// <param name="rowData">Collection of object rows.</param>
        /// <param name="rowCount">Number of rows received in this event.</param>
        public ServerBytesReceivedEventArgs(byte[] rawData, IEnumerable<T> rowData, int rowCount)
        {
            RawData = rawData;
            RowData = rowData;
            RowCount = rowCount;
        }

        /// <summary>
        /// Raw byte array received from the server.
        /// </summary>
        public byte[] RawData { get; set; }

        /// <summary>
        /// Collection of object rows.
        /// </summary>
        public IEnumerable<T> RowData { get; set; }

        /// <summary>
        /// Number of rows received in this event.
        /// </summary>
        public int RowCount { get; set; }
    }
}
