using System.Collections.Generic;
using ProtoBuf;

namespace WpfNodeDemo.Classes
{
    /// <summary>
    /// Message received via a Web Socket connection to backend database.
    /// </summary>
    /// <typeparam name="T">The type of objects in the collection of data sent by the server.</typeparam>
    [ProtoContract]
    public class ServerMessage<T> where T : new()
    {
        /// <summary>
        /// Unique Message ID
        /// </summary>
        [ProtoMember(1)]
        public int Id { get; set; }

        /// <summary>
        /// Collection of <see cref="ServerMessageArgument&lt;T&gt;"/> objects included in the message.
        /// </summary>
        [ProtoMember(2)]
        public IEnumerable<ServerMessageArgument<T>> Args { get; set; }
    }
}
