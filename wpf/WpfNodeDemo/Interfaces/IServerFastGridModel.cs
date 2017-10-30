using FastWpfGrid;

namespace WpfNodeDemo.Interfaces
{
    interface IServerFastGridModel : IFastGridModel
    {
        /// <summary>
        /// Retrieves the Column name on the server by 0-based column index
        /// </summary>
        /// <param name="column">Index of column</param>
        /// <returns>Server column name as <see cref="string"/></returns>
        string GetServerColumnName(int column);

        /// <summary>
        /// Retrieves the 0-based index of the column on the server by name.
        /// </summary>
        /// <param name="columnName">Name of column on the server.</param>
        /// <returns>Column index as <see cref="int"/>; -1 if not found.</returns>
        int GetServerColumnIndex(string columnName);
    }
}
