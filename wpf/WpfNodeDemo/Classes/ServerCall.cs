using System.Collections.Generic;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;

namespace WpfNodeDemo.Classes
{
    /// <summary>
    /// Parameters to send to the server as a JSON call.
    /// </summary>
    public class ServerCall
    {
        /// <summary>
        /// Creates new instance <see cref="ServerCall"/>.
        /// </summary>
        public ServerCall() { }

        /// <summary>
        /// Creates new instance <see cref="ServerCall"/>.
        /// </summary>
        /// <param name="id">Unique identifier that will be returned by the server in the response message.</param>
        /// <param name="call">Name of the server function to invoke.</param>
        /// <param name="args">Collection of arguments to include in the message.</param>
        public ServerCall(int id, string call, IEnumerable<object> args)
        {
            Id = id;
            Call = call;
            Args = args;
        }

        /// <summary>
        /// Unique identifier that will be returned by the server in the response message.
        /// </summary>
        public int Id { get; set; }

        /// <summary>
        /// Name of the server function to invoke.
        /// </summary>
        public string Call { get; set; }

        /// <summary>
        /// Collection of arguments to include in the message.
        /// </summary>
        public IEnumerable<object> Args { get; set; }

        /// <summary>
        /// Returns JSON string expected by the server.
        /// </summary>
        /// <returns>Well-formed JSON string</returns>
        public string ToJson()
        {
            var settings = new JsonSerializerSettings
            {
                ContractResolver = new CamelCasePropertyNamesContractResolver()
            };
            return JsonConvert.SerializeObject(this, Formatting.None, settings);
        }
    }
}