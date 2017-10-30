using System;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Media;
using WpfNodeDemo.Enumerators;

namespace WpfNodeDemo.Controls
{
    /// <summary>
    /// Interaction logic for GridSortIndicator.xaml
    /// </summary>
    public partial class GridSortIndicator : UserControl
    {
        public GridSortIndicator()
        {
            InitializeComponent();
        }

        /// <summary>
        /// Foreground column of the indicator.
        /// </summary>
        public Brush Fill
        {
            get { return (Brush) GetValue(FillProperty); }
            set { SetValue(FillProperty, value); }
        }

        public static readonly DependencyProperty FillProperty = DependencyProperty.Register(
            "Fill"
            , typeof (Brush)
            , typeof (GridSortIndicator)
            , new PropertyMetadata(new SolidColorBrush(Color.FromRgb(255, 0, 0))));


        /// <summary>
        /// Outline (stroke) color of the indicator.
        /// </summary>
        public Brush Stroke
        {
            get { return (Brush) GetValue(StrokeProperty); }
            set { SetValue(StrokeProperty, value); }
        }

        public static readonly DependencyProperty StrokeProperty = DependencyProperty.Register(
            "Stroke"
            , typeof (Brush)
            , typeof (GridSortIndicator)
            , new PropertyMetadata(default(Brush)));


        /// <summary>
        /// Direction the control should indicate.
        /// </summary>
        public SortingDirection SortingDirection
        {
            get { return (SortingDirection) GetValue(SortingDirectionProperty); }
            set { SetValue(SortingDirectionProperty, value); }
        }
        public static readonly DependencyProperty SortingDirectionProperty = DependencyProperty.Register(
            "SortingDirection"
            , typeof(SortingDirection)
            , typeof(GridSortIndicator)
            , new PropertyMetadata(default(SortingDirection), OnSortingDirectionChanged));

        private static void OnSortingDirectionChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
        {
            var control = d as GridSortIndicator;
            if(control == null)
                throw new ArgumentException($"SortingDirection property could not get the Sort Indicator object from type '{d.GetType()}'");

            control.OnSortingDirectionChanged(control, (SortingDirection) e.NewValue);
        }

        /// <summary>
        /// Fired when the Sorting Direction is changed update the indicators state.
        /// </summary>
        /// <param name="control"><see cref="GridSortIndicator"/> to update.</param>
        /// <param name="direction">New <see cref="SortingDirection"/> to set indication to.</param>
        protected virtual void OnSortingDirectionChanged(GridSortIndicator control, SortingDirection direction)
        {
            if (direction == SortingDirection.Asc)
            {
                control.uc_Polygon_Asc.Visibility = Visibility.Visible;
                control.uc_Polygon_Desc.Visibility = Visibility.Collapsed;
            }
            else
            {
                control.uc_Polygon_Asc.Visibility = Visibility.Collapsed;
                control.uc_Polygon_Desc.Visibility = Visibility.Visible;
            }
        }
    }
}
