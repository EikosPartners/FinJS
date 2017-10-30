using System;
using System.Diagnostics;
using System.Windows;
using System.Windows.Interactivity;
using System.Windows.Threading;
using FastWpfGrid;

namespace WpfNodeDemo.Behaviors
{
    /// <summary>
    /// Updates the number of visible rows available to the Grid.
    /// </summary>
    public class AvailableRowCountBehavior : Behavior<FastGridControl>
    {
        #region Fields

        private FastGridControl grid;

        #endregion

        #region Properties

        /// <summary>
        /// Number of rows visible by the grid
        /// </summary>
        public int VisibleRowCount
        {
            get { return (int)GetValue(VisibleRowCountProperty); }
            set { SetValue(VisibleRowCountProperty, value); }
        }

        public static readonly DependencyProperty VisibleRowCountProperty = DependencyProperty.Register(
            "VisibleRowCount"
            , typeof (int)
            , typeof (AvailableRowCountBehavior)
            , new FrameworkPropertyMetadata(default(int), FrameworkPropertyMetadataOptions.BindsTwoWayByDefault));

        #endregion

        /// <summary>
        /// Prep for post-loading.
        /// </summary>
        protected override void OnAttached()
        {
            base.OnAttached();
            grid = AssociatedObject;
            AssociatedObject.Loaded += (sender, args) => Initialize();
        }

        /// <summary>
        /// Wire updating of the <see cref="VisibleRowCount"/> when the Grid is resized.
        /// </summary>
        private void Initialize()
        {
            //Need this to fire AFTER the grid has been re-rendered and the visible column count is updated
            UpdateAvailableCount(null);

            grid.SizeChanged += (sender, args) => 
                grid.Dispatcher.BeginInvoke(DispatcherPriority.Loaded, new Action(() => UpdateAvailableCount(args)));
        }

        /// <summary>
        /// Updates the Grid Row Count
        /// </summary>
        private void UpdateAvailableCount(SizeChangedEventArgs args)
        {
            if (args != null && !args.HeightChanged)
                return;

            VisibleRowCount = grid.VisibleRowCount;
            Trace.WriteLine("Visible Row count: " + VisibleRowCount);
        }
    }
}
