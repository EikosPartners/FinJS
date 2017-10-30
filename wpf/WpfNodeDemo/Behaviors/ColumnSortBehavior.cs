using System;
using System.Diagnostics;
using System.Windows;
using System.Windows.Interactivity;
using System.Windows.Media.Imaging;
using FastWpfGrid;
using WpfNodeDemo.Controls;
using WpfNodeDemo.Enumerators;
using WpfNodeDemo.Interfaces;

namespace WpfNodeDemo.Behaviors
{
    public class ColumnSortBehavior : Behavior<FastGridControl>
    {
        private FastGridControl grid;
        private IServerFastGridModel model;
        private int CurrentColumn;

        #region Properties

        /// <summary>
        /// Name of selected column to sort on.
        /// </summary>
        public string ColumnName
        {
            get { return (string)GetValue(ColumnNameProperty); }
            set { SetValue(ColumnNameProperty, value); }
        }
        public static readonly DependencyProperty ColumnNameProperty = DependencyProperty.Register(
            "ColumnName"
            , typeof (string)
            , typeof (ColumnSortBehavior)
            , new FrameworkPropertyMetadata(default(string), FrameworkPropertyMetadataOptions.BindsTwoWayByDefault));

        /// <summary>
        /// Sorting Direction on the selected Column.
        /// </summary>
        public SortingDirection ColumnSortingDirection
        {
            get { return (SortingDirection)GetValue(SortOrderProperty); }
            set { SetValue(SortOrderProperty, value); }
        }
        public static readonly DependencyProperty SortOrderProperty = DependencyProperty.Register(
            "ColumnSortingDirection"
            , typeof (SortingDirection)
            , typeof (ColumnSortBehavior)
            , new FrameworkPropertyMetadata(default(SortingDirection), FrameworkPropertyMetadataOptions.BindsTwoWayByDefault));

        /// <summary>
        /// Sort indicator to update when sorting changes.
        /// </summary>
        public GridSortIndicator GridSortIndicator
        {
            get { return (GridSortIndicator) GetValue(GridSortIndicatorProperty); }
            set { SetValue(GridSortIndicatorProperty, value); }
        }
        public static readonly DependencyProperty GridSortIndicatorProperty = DependencyProperty.Register(
            "GridSortIndicator"
            , typeof(GridSortIndicator)
            , typeof(ColumnSortBehavior)
            , new PropertyMetadata(default(GridSortIndicator)));

        /// <summary>
        /// Current row number of the attached grid.
        /// </summary>
        public int CurrentRowNumber
        {
            get { return (int) GetValue(CurrentRowNumberProperty); }
            set { SetValue(CurrentRowNumberProperty, value); }
        }
        public static readonly DependencyProperty CurrentRowNumberProperty = DependencyProperty.Register(
            "CurrentRowNumber"
            , typeof(int)
            , typeof(ColumnSortBehavior)
            , new FrameworkPropertyMetadata(default(int), FrameworkPropertyMetadataOptions.BindsTwoWayByDefault));
        #endregion

        /// <summary>
        /// Prep for post-loading.
        /// </summary>
        protected override void OnAttached()
        {
            base.OnAttached();
            grid = AssociatedObject;
            model = (IServerFastGridModel)grid.Model;
            AssociatedObject.Loaded += (sender, args) => Initialize();
        }

        /// <summary>
        /// Wire updating or the column sorting when the Grid header is clicked.
        /// </summary>
        private void Initialize()
        {
            grid.ScrolledModelColumns += OnScrolledModelColumns;
            grid.ColumnHeaderClick += OnColumnHeaderClick;

            grid.ColumnResized += OnColumnResized;

            //Position indicator if a column name is set
            if (!string.IsNullOrEmpty(ColumnName))
                PositionSortIndicator(model.GetServerColumnIndex(ColumnName));
        }

        /// <summary>
        /// Move the sort indicator when a grids column is resized.
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="columnResizedEventArgs"></param>
        private void OnColumnResized(object sender, ColumnResizedEventArgs columnResizedEventArgs)
        {
            PositionSortIndicator(CurrentColumn);
        }

        /// <summary>
        /// Move the sort indicator when the grid is scrolled horizontally.
        /// </summary>
        /// <param name="sender">Calling <see cref="grid"/> object.</param>
        /// <param name="e">Event args associated with the column scrolling.</param>
        private void OnScrolledModelColumns(object sender, EventArgs e)
        {
            PositionSortIndicator(CurrentColumn);
        }

        /// <summary>
        /// Fired when a column header is clicked on the <see cref="grid"/>.
        /// </summary>
        /// <param name="sender">Calling <see cref="grid"/> object.</param>
        /// <param name="e">Event args associated with the column clicked.</param>
        private void OnColumnHeaderClick(object sender, ColumnClickEventArgs e)
        {
            if (e.IsColumnFilter)
                return;

            SetSortDirection(e.Column);
            PositionSortIndicator(e.Column);
        }

        /// <summary>
        /// Set the sorting direction and column named based on the column index.
        /// </summary>
        /// <param name="column">0-Based index of the column.</param>
        private void SetSortDirection(int column)
        {
            //Get the column name the server is expecting and set the sort direction
            var col = model.GetServerColumnName(column);
            if (col == ColumnName)
            {
                ColumnSortingDirection = ColumnSortingDirection == SortingDirection.Asc
                    ? SortingDirection.Desc
                    : SortingDirection.Asc;
            }
            else
            {
                ColumnName = col;
                ColumnSortingDirection = SortingDirection.Asc;
            }
            CurrentRowNumber = 0;
        }

        /// <summary>
        /// Set the margin of the <see cref="GridSortIndicator"/> based on which column is sorted.
        /// </summary>
        /// <param name="column"></param>
        private void PositionSortIndicator(int column)
        {
            //See which columns of visible
            var firstcol = grid.FirstVisibleColumnScrollIndex;
            var lastcol = firstcol + grid.VisibleColumnCount;

            if (column >= firstcol && column <= lastcol)
            {
                //Determine the offset
                var offset = 0d;
                for (var i = firstcol; i < column; i++)
                    offset += grid.GetColumnHeaderRectangle(i).Width;

                offset += grid.GetColumnHeaderRectangle(column).Width/2;
                offset -= GridSortIndicator.ActualWidth;

                //Update the ui accounting for DPI
                GridSortIndicator.Margin = new Thickness(offset / DpiDetector.DpiXKoef, 2, 0, 0);
                GridSortIndicator.Visibility = Visibility.Visible;
            }
            else
            {
                GridSortIndicator.Visibility = Visibility.Hidden;
            }

            //Update the local state
            CurrentColumn = column;

        }
    }
}
