using System;
using System.Diagnostics;
using System.Windows;
using System.Windows.Controls.Primitives;
using System.Windows.Input;
using System.Windows.Interactivity;
using FastWpfGrid;
using WpfNodeDemo.Interfaces;

namespace WpfNodeDemo.Behaviors
{
    public class SyncScrollPositionBehavior : Behavior<FastGridControl>
    {
        private FastGridControl grid;

        /// <summary>
        /// Vertical <see cref="ScrollBar"/> that will sync position with.
        /// </summary>
        public ScrollBar ScrollBar
        {
            get { return (ScrollBar) GetValue(ScrollBarProperty); }
            set { SetValue(ScrollBarProperty, value); }
        }
        public static readonly DependencyProperty ScrollBarProperty = DependencyProperty.Register(
            "ScrollBar"
            , typeof(ScrollBar)
            , typeof(SyncScrollPositionBehavior)
            , new PropertyMetadata(default(ScrollBar)));

        /// <summary>
        /// Indicates <c>true</c> if the <see cref="ScrollBar"/> is scrolling.
        /// </summary>
        public bool IsScrolling
        {
            get { return (bool) GetValue(IsScrollingProperty); }
            set { SetValue(IsScrollingProperty, value); }
        }
        public static readonly DependencyProperty IsScrollingProperty = DependencyProperty.Register(
            "IsScrolling"
            , typeof(bool)
            , typeof(SyncScrollPositionBehavior)
            , new FrameworkPropertyMetadata(default(bool), FrameworkPropertyMetadataOptions.BindsTwoWayByDefault));


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
        /// Wire updating or the column sorting when the Grid header is clicked.
        /// </summary>
        private void Initialize()
        {
            grid.MouseWheel += OnMouseWheel;

            if (ScrollBar == null)
                return;

            ScrollBar.PreviewMouseLeftButtonDown += ScrollBarOnMouseDown;
            ScrollBar.PreviewMouseLeftButtonUp += ScrollBarOnMouseUp;
            ScrollBar.MouseLeave += ScrollBarOnMouseLeave;
        }

        private void ScrollBarOnMouseUp(object sender, MouseButtonEventArgs e)
        {
            IsScrolling = false;

            //Seems the capture events suppress updating the ui
            ScrollBar.Value++;
            ScrollBar.Value--;
        }

        private void ScrollBarOnMouseDown(object sender, MouseButtonEventArgs e)
        {
            IsScrolling = true;
        }

        private void OnMouseWheel(object sender, MouseWheelEventArgs e)
        {
            var delta = (e.Delta < 0 ? 1 : -1) * ScrollBar.LargeChange;

            if (delta > 0)
            {
                if (ScrollBar.Maximum >= ScrollBar.Value + delta)
                    ScrollBar.Value += delta;
            }
            else if (delta < 0)
            {
                //Delta is already negative
                if (ScrollBar.Value + delta > 0)
                    ScrollBar.Value += delta;
                else
                    ScrollBar.Value = 0;
            }
        }

        private void ScrollBarOnMouseLeave(object sender, MouseEventArgs mouseEventArgs)
        {
            //This should only fire if a part of the scrollbar itself is exposed and clicked on (not the thumb or up/down buttons)
            IsScrolling = false;
        }
    }
}
