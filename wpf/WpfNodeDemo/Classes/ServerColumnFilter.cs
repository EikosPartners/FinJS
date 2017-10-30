using Newtonsoft.Json;
using WpfNodeDemo.Converters;

namespace WpfNodeDemo.Classes
{
    /// <summary>
    /// Filter information applied to a column at the server.
    /// </summary>
    public class ServerColumnFilter
    {
        /// <summary>
        /// Column Name on the Server.
        /// </summary>
        [JsonIgnore]
        public string ColumnName { get; set; }

        /// <summary>
        /// Filter to apply to the column.
        /// </summary>
        [JsonProperty("value")]
        public string FilterText { get; set; }

        /// <summary>
        /// How the filter is applied at the server
        /// </summary>
        [JsonProperty("op")]
        [JsonConverter(typeof(CamelCaseStringEnumConverter))]
        public FilterOperation Operation { get; set; }

        /// <summary>
        /// Filter Operations
        /// </summary>
        public enum FilterOperation {StartsWith, EndsWith, Contains }
    }
}
