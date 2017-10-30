using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Diagnostics;
using System.Linq;
using System.Reflection;
using FastWpfGrid;
using WpfNodeDemo.Interfaces;

namespace WpfNodeDemo.Classes
{
    public class FastWindowGridModel<T> : FastGridModelBase, IServerFastGridModel
    {
        /// <summary>
        /// Creates instance of the <see cref="FastWindowGridModel&lt;T&gt;"/>
        /// </summary>
        public FastWindowGridModel(int rowCount)
        {
            RowCount = rowCount;

            //Store the column names via reflection
            ColumnPropertyInfoList = typeof(T).GetProperties().ToList();
            for (var i = 0; i < ColumnPropertyInfoList.Count; i++)
            {
                //Store the display and server column name
                var attribs = ColumnPropertyInfoList[i].GetCustomAttributes(typeof (ColumnNameAttribute)).ToList();
                if (attribs.Any())
                {
                    var attrib = (ColumnNameAttribute) attribs.First();
                    ColumnNameList.Add(attrib.DisplayName);
                    ServerNameList.Add(attrib.ServerName);
                }
                else
                {
                    var name = ColumnPropertyInfoList[i].Name;
                    ColumnNameList.Add(name);
                    ServerNameList.Add(name);
                }

                //See if there is a width override
                attribs = ColumnPropertyInfoList[i].GetCustomAttributes(typeof(ColumnWidthAttribute)).ToList();
                if (attribs.Any())
                {
                    var attrib = (ColumnWidthAttribute)attribs.First();
                    ColumnWidthOverrides[i] = attrib.Width;
                }
            }

            ColumnCount = ColumnPropertyInfoList.Count;

            //Fill the default filter strings
            for (var i = 0; i < ColumnCount; i++)
                ColumnFilters.Add(string.Empty);

            //Fill the grid with blank rows
            ClearGridRows(0, true);
        }

        #region Fields

        /// <summary>
        /// Row Objects to Cell mapping for the grid with O(1) lookup efficiency by INDEX
        /// </summary>
        protected readonly List<List<string>> CellValues = new List<List<string>>();

        /// <summary>
        /// Lookup for the column name to provide the Y coordinate with O(1) lookup efficiency by INDEX
        /// </summary>
        protected readonly List<string> ColumnNameList = new List<string>();

        /// <summary>
        /// Lookup for the column property info with O(1) lookup efficiency by INDEX
        /// </summary>
        protected readonly List<PropertyInfo> ColumnPropertyInfoList = new List<PropertyInfo>();

        /// <summary>
        /// Lookup for the column names on the server for a column with O(1) lookup efficiency by INDEX
        /// </summary>
        protected readonly List<string> ServerNameList = new List<string>();

        /// <summary>
        /// Lookup for the column filter strings with O(1) lookup efficiency by INDEX
        /// </summary>
        protected readonly List<string> ColumnFilters = new List<string>(); 

        /// <summary>
        /// Collection of default columns width to override calculated values.
        /// </summary>
        protected readonly Dictionary<int, int> ColumnWidthOverrides = new Dictionary<int, int>(); 

        #endregion

        #region Properties

        public override sealed int ColumnCount { get; }

        public override sealed int RowCount { get; }

        #endregion

        #region Methods

        /// <summary>
        /// Stores the collection of row data to the gird by parsing the object.
        /// </summary>
        /// <param name="rows">Collection of orders</param>
        public void LoadRowObjects(IEnumerable<T> rows)
        {
            var list = rows.ToList();

            for (var r = 0; r < list.Count; r++)
            {
                var order = list[r];
                for (var c = 0; c < ColumnNameList.Count; c++)
                {
                    CellValues[r][c] = ColumnPropertyInfoList[c].GetValue(order)?.ToString();
                }
            }


            //Clear any empty rows
            if (list.Count < RowCount)
                ClearGridRows(list.Count, true);

            //Rebuild the grid
            InvalidateAll();
        }

        /// <summary>
        /// Stores the collection of row data to the gird by parsing json string.
        /// </summary>
        /// <param name="json">Raw JSON of orders collection</param>
        public void LoadRowJson(string json)
        {
            //Break up the rows
            var rowstrings = json
                .Trim('{', '}', ' ')  //remove wrap
                .Split(new[] {"},{", "}, {", "} ,{"}, StringSplitOptions.RemoveEmptyEntries);  //Split the rows

            //Assume the columns are in order for speed
            for (var r = 0; r < rowstrings.Length; r++)
            {
                var pairs = rowstrings[r].Split(',');
                var vals = pairs
                    .Select(colval => colval
                        .Substring(colval.IndexOf(':') + 1) //Get the value half
                        .Trim(' ', '"') //Remove any wrapping quotes
                        .Replace("\\\"", "\"")) //Remove any embedded escaped parentheses
                    .ToList();

                //Update the cell value
                for (var c = 0; c < Math.Min(ColumnCount, vals.Count); c++)
                {
                    CellValues[r][c] = vals[c];
                }
            }

            //Clear any empty rows
            if (rowstrings.Length < RowCount)
                ClearGridRows(rowstrings.Length, true);

            //Rebuild the grid
            InvalidateAll();
        }

        /// <summary>
        /// Retrieves the Column name on the server by 0-based column index
        /// </summary>
        /// <param name="column">Index of column</param>
        /// <returns>Server column name as <see cref="string"/></returns>
        public string GetServerColumnName(int column)
        {
            return ServerNameList[column];
        }
        
        /// <summary>
        /// Retrieves the 0-based index of the column on the server by name.
        /// </summary>
        /// <param name="columnName">Name of column on the server.</param>
        /// <returns>Column index as <see cref="int"/>; -1 if not found.</returns>
        public int GetServerColumnIndex(string columnName)
        {
            return ServerNameList.IndexOf(columnName);
        }

        /// <summary>
        /// Clears all cells of the grid.
        /// </summary>
        /// <param name="startRow">0-Based Row Number to being with (default is first row)</param>
        public void ClearGridRows(int startRow = 0, bool suppressInvalidate = false)
        {
            var blankrow = new List<string>();
            for (var i = 0; i < ColumnCount; i++)
                blankrow.Add(string.Empty);

            for (var r = startRow; r < Math.Min(RowCount, CellValues.Count); r++)
                CellValues[r] = blankrow.Select(c => c).ToList();

            for (var r = CellValues.Count; r < RowCount; r++)
                CellValues.Add(blankrow.Select(c => c).ToList());

            if (!suppressInvalidate)
                InvalidateAll();
        }

        /// <summary>
        /// Removes all filters applied to the grid.
        /// </summary>
        public void ClearColumnFilters()
        {
            for (var i = 0; i < ColumnFilters.Count; i++)
            {
                ColumnFilters[i] = string.Empty;
                InvalidateColumnHeader(i);
            }
        }

        #endregion

        #region Method Overrides

        /// <summary>
        /// Retrieves the Cell Value by Row-Column
        /// </summary>
        /// <returns>Cell Value as <see cref="string"/>.</returns>
        public override string GetCellText(int row, int column)
        {
            return CellValues[row][column];
        }

        /// <summary>
        /// Store the updated cell text to the indicated row/column.
        /// </summary>
        /// <param name="row">Index of row</param>
        /// <param name="column">Index of column</param>
        /// <param name="value">New value</param>
        public override void SetCellText(int row, int column, string value)
        {
            base.SetCellText(row, column, value);
            CellValues[row][column] = value;
        }

        /// <summary>
        /// Retrieves the Column filter by 0-based column index
        /// </summary>
        /// <param name="column">Index of column</param>
        /// <returns>Column filter text as <see cref="string"/></returns>
        public override string GetColumnFilterText(int column)
        {
            return ColumnFilters[column];
        }

        /// <summary>
        /// Store the updated filter text to the indicated column.
        /// </summary>
        /// <param name="column">Index of column</param>
        /// <param name="value">New value</param>
        public override void SetColumnFilterText(int column, string value)
        {
            base.SetColumnFilterText(column, value);
            ColumnFilters[column] = value;
        }

        /// <summary>
        /// Retrieves the Column name by 0-based column index
        /// </summary>
        /// <param name="column">Index of column</param>
        /// <returns>Column name as <see cref="string"/></returns>
        public override string GetColumnHeaderText(int column)
        {
            return ColumnNameList[column];
        }

        /// <summary>
        /// Return the collection of default column width overrides.
        /// </summary>
        public override Dictionary<int, int> GetColumnWidthOverrides(IFastGridView view)
        {
            return ColumnWidthOverrides;
        }

        #endregion
    }
}
