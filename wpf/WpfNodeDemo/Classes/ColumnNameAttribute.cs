using System;

namespace WpfNodeDemo.Classes
{
    /// <summary>
    /// Specifies how a column should be addressed on the server and displayed in the grid.
    /// </summary>
    public class ColumnNameAttribute : Attribute
    {
        /// <summary>
        /// How the column should be displayed in the blotter.
        /// </summary>
        public string DisplayName { get; set; }

        /// <summary>
        /// Name of the column on the Server.
        /// </summary>
        public string ServerName { get; set; }

        /// <summary>
        /// Initializes a new instance of the class using the display name and server name.
        /// </summary>
        /// <param name="displayName">How the column should be displayed in the blotter.</param>
        /// <param name="serverName">Name of the column on the Server.</param>
        public ColumnNameAttribute(string displayName, string serverName)
        {
            DisplayName = displayName;
            ServerName = serverName;
        }
    }
}
