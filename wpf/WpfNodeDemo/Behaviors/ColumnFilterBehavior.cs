using System.Windows;
using System.Windows.Input;
using System.Windows.Interactivity;
using FastWpfGrid;
using WpfNodeDemo.Classes;
using WpfNodeDemo.Interfaces;

namespace WpfNodeDemo.Behaviors
{
    /// <summary>
    /// Generates a <see cref="ServerColumnFilter"/> object for the attached grid when
    /// the <see cref="FastGridControl.ColumnFilterChanged"/> event fires and moves the grid to row 0.
    /// </summary>
    public class ColumnFilterBehavior: Behavior<FastGridControl> 
    {
        private FastGridControl grid;
        private IServerFastGridModel model;

        #region Dependency Properties

        public int ScrolledRowNumber
        {
            get { return (int) GetValue(ScrolledRowNumberProperty); }
            set { SetValue(ScrolledRowNumberProperty, value); }
        }
        public static readonly DependencyProperty ScrolledRowNumberProperty = DependencyProperty.Register(
            "ScrolledRowNumber"
            , typeof(int)
            , typeof(ColumnFilterBehavior)
            , new FrameworkPropertyMetadata(default(int), FrameworkPropertyMetadataOptions.BindsTwoWayByDefault));


        public ICommand AddFilterCommand
        {
            get { return (ICommand) GetValue(AddFilterCommandProperty); }
            set { SetValue(AddFilterCommandProperty, value); }
        }
        public static readonly DependencyProperty AddFilterCommandProperty = DependencyProperty.Register(
            "AddFilterCommand"
            , typeof(ICommand)
            , typeof(ColumnFilterBehavior)
            , new PropertyMetadata(default(ICommand)));

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
        /// Wire for changes to the column filters.
        /// </summary>
        private void Initialize()
        {
            grid.ColumnFilterChanged += OnColumnFilterChanged;
        }

        /// <summary>
        /// Send update to the listening object
        /// </summary>
        /// <param name="sender">Main Grid</param>
        /// <param name="e">Change Information</param>
        private void OnColumnFilterChanged(object sender, ColumnFilterChangedEventArgs e)
        {
            var filter = new ServerColumnFilter
            {
                ColumnName = model.GetServerColumnName(e.Column),
                Operation = ServerColumnFilter.FilterOperation.StartsWith,
                FilterText = e.NewValue
            };

            if (AddFilterCommand.CanExecute(null))
                AddFilterCommand.Execute(filter);

            //Go to the top of the grid
            ScrolledRowNumber = 0;
        }
    }
}
