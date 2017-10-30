using System.Windows;
using System.Windows.Input;

namespace WpfNodeDemo.Controls
{
    /// <summary>
    /// Proves Maximize, Minimize and Close button controls for a Window.
    /// </summary>
    public partial class WindowChromeButtons
    {
        protected Window ParentWindow { get; set; }

        public WindowChromeButtons()
        {
            InitializeComponent();
            Loaded += CaptionButtonsLoaded;
        }

        /// <summary>
        /// Event when the control is loaded.
        /// </summary>
        /// <param name="sender">The sender.</param>
        /// <param name="e">The <see cref="System.Windows.RoutedEventArgs"/> instance containing the event data.</param>
        void CaptionButtonsLoaded(object sender, RoutedEventArgs e)
        {
            ParentWindow = Window.GetWindow(this);
        }

        /// <summary>
        /// TitleBar_MouseDown - Drag if single-click, resize if double-click
        /// </summary>
        protected void TitleBar_MouseDown(object sender, MouseButtonEventArgs e)
        {
            if (e.ChangedButton != MouseButton.Left)
                return;

            if (e.ClickCount == 2)
                AdjustWindowSize();
            else
                Application.Current.MainWindow.DragMove();
        }

        /// <summary>
        /// CloseButton_Clicked
        /// </summary>
        protected void CloseButton_Click(object sender, RoutedEventArgs e)
        {
            Application.Current.Shutdown();
        }

        /// <summary>
        /// MaximizedButton_Clicked
        /// </summary>
        protected void MaximizeButton_Click(object sender, RoutedEventArgs e)
        {
            AdjustWindowSize();
        }

        /// <summary>
        /// Minimized Button_Clicked
        /// </summary>
        protected void MinimizeButton_Click(object sender, RoutedEventArgs e)
        {
            ParentWindow.WindowState = WindowState.Minimized;
        }

        /// <summary>
        /// Adjusts the WindowSize to correct parameters when Maximize button is clicked
        /// </summary>
        protected void AdjustWindowSize()
        {
            ParentWindow.WindowState = ParentWindow.WindowState == WindowState.Maximized
                ? WindowState.Normal
                : WindowState.Maximized;
        }
    }
}
