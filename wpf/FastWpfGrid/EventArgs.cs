using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FastWpfGrid
{
    public class RowClickEventArgs : EventArgs
    {
        public int Row;
        public FastGridControl Grid;
        public bool Handled;
    }

    public class ColumnClickEventArgs : EventArgs
    {
        public int Column;
        public bool IsColumnFilter;
        public FastGridControl Grid;
        public bool Handled;
    }

    public class ColumnFilterChangedEventArgs : EventArgs
    {
        public int Column;
        public string OldValue;
        public string NewValue;
        public FastGridControl Grid;
    }

    public class ColumnResizedEventArgs : EventArgs
    {
        public int Column;
        public int OldValue;
        public int NewValue;
        public FastGridControl Grid;
    }
}
