using System.Windows;
using System.Windows.Controls;
using System.Windows.Media;

namespace WpfNodeDemo.Controls
{
	public partial class DualCogs : UserControl
	{
        public DualCogs()
		{
			InitializeComponent();
        }

        /// <summary>
        /// Foreground (fill) color of the cog wheels
        /// </summary>
		public Brush CogsForeground
		{
			get { return (Brush)GetValue(CogsForegroundProperty); }
			set { SetValue(CogsForegroundProperty, value); }
		}
		public static readonly DependencyProperty CogsForegroundProperty = DependencyProperty.Register(
            "CogsForeground"
            , typeof(Brush)
            , typeof(DualCogs)
            , new PropertyMetadata(new SolidColorBrush(Color.FromArgb(64, 0, 0, 0))));


        /// <summary>
        /// Outline (stroke) color of the cog wheels
        /// </summary>
        public Brush CogsStroke
        {
            get { return (Brush)GetValue(CogsStrokeProperty); }
            set { SetValue(CogsStrokeProperty, value); }
        }
	    public static readonly DependencyProperty CogsStrokeProperty = DependencyProperty.Register(
	        "CogsStroke"
	        , typeof (Brush)
	        , typeof (DualCogs)
	        , new PropertyMetadata(Brushes.Black));

        /// <summary>
        /// Increases or decreases the speed the cogs spin.
        /// </summary>
	    public double CogsSpeed
	    {
	        get { return (double) GetValue(CogsSpeedProperty); }
	        set { SetValue(CogsSpeedProperty, value); }
	    }
	    public static readonly DependencyProperty CogsSpeedProperty = DependencyProperty.Register(
            "CogsSpeed"
            , typeof(double)
	        , typeof(DualCogs)
	        , new PropertyMetadata(1D));
        
	}
}