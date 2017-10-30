using System.Collections.Generic;
using ProtoBuf;

namespace WpfNodeDemo.Classes
{
    /// <summary>
    /// Argument object contained in a <see cref="ServerMessage&lt;T&gt;"/>.
    /// </summary>
    /// <typeparam name="T">The type of objects in the collection of data sent by the server.</typeparam>
    [ProtoContract]
    public class ServerMessageArgument<T> where T : new()
    {

        /// <summary>
        /// Row Pagination Start
        /// </summary>
        [ProtoMember(1)]
        public int Start { get; set; }

        /// <summary>
        /// Row Pagination End
        /// </summary>
        [ProtoMember(2)]
        public int End { get; set; }

        /// <summary>
        /// Total Rows Available
        /// </summary>
        [ProtoMember(3)]
        public int TotalCount { get; set; }

        /// <summary>
        /// Total Filtered Rows Available
        /// </summary>
        [ProtoMember(4)]
        public int FilteredCount { get; set; }

        /// <summary>
        /// Data Content contained in the Message
        /// </summary>
        [ProtoMember(5)]
        public IEnumerable<T> Data { get; set; }

        /// <summary>
        /// Key given when performance recordings are being done at the Server
        /// </summary>
        [ProtoMember(6)]
        public int PerformanceKey { get; set; }
    }
}