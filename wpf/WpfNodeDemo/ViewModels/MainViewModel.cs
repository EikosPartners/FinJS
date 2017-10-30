using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Diagnostics;
using System.Dynamic;
using System.Linq;
using System.Net.WebSockets;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Threading;
using WpfNodeDemo.Classes;
using WpfNodeDemo.Enumerators;
using static System.Configuration.ConfigurationManager;

namespace WpfNodeDemo.ViewModels
{
    public class MainViewModel : NotificationsBase
    {
        public MainViewModel()
        {
            //Have to guarantee it will fill the window
            GridModel = new FastWindowGridModel<BlotterOrder>(200);

            if (DesignerProperties.GetIsInDesignMode(new DependencyObject()))
                return;

            //Load Defaults
            SortColumnName = AppSettings["ordersDefaultSortColumn"];
            SortDirection = (SortingDirection) Enum.Parse(typeof(SortingDirection), AppSettings["ordersDefaultSortDirection"], true);
        }

        #region Fields

        private int currentId = 0;
        private readonly string ordersStreamCall = AppSettings["ordersStreamCall"];
        private readonly ServerConnection<BlotterOrder> connection = new ServerConnection<BlotterOrder>();

        #endregion

        #region Exposed Properties

        /// <summary>
        /// Text Logging String
        /// </summary>
        public string LogText
        {
            get { return logText; }
            set { NotifySetProperty(ref logText, value); }
        }
        private string logText = $"Ready...{Environment.NewLine}";

        /// <summary>
        /// Grid Model that provides Blotter Order Data.
        /// </summary>
        public FastWindowGridModel<BlotterOrder> GridModel
        {
            get { return gridModel; }
            set { NotifySetProperty(ref gridModel, value); }
        }
        private FastWindowGridModel<BlotterOrder> gridModel;

        /// <summary>
        /// Indicates <c>true</c> if the server stream updates are paused.
        /// </summary>
        public bool IsStreamPaused
        {
            get { return isStreamPaused; }
            set
            {
                NotifySetProperty(ref isStreamPaused, value);
                if (value)
                {
                    connection.PauseUpdate();
                    gridModel.ClearGridRows();
                }
                else
                {
                    connection.ResumeUpdate();
                }
            }
        }
        private bool isStreamPaused = true;

        /// <summary>
        /// Indicates <c>true</c> if the connection to the server is established.
        /// </summary>
        public bool IsConnected
        {
            get { return isConnected; }
            set { NotifySetProperty(ref isConnected, value); }
        }
        private bool isConnected;

        #endregion

        #region Sorting and Filtering Properties

        /// <summary>
        /// Name of the column to sort on.
        /// </summary>
        public string SortColumnName
        {
            get { return sortColumnName; }
            set { NotifySetProperty(ref sortColumnName, value); }
        }
        private string sortColumnName;

        /// <summary>
        /// Sort column sorting direction.
        /// </summary>
        public SortingDirection SortDirection
        {
            get { return sortDirection; }
            set
            {
                NotifySetProperty(ref sortDirection, value); 
                UpdateDataStream();
            }
        }
        private SortingDirection sortDirection;

        /// <summary>
        /// Collection of column names and associated filters to apply at the server.
        /// </summary>
        public ICollection<ServerColumnFilter> ColumnFilters
        {
            get { return columnFilters; }
            set { NotifySetProperty(ref columnFilters, value); }
        }
        private ICollection<ServerColumnFilter> columnFilters;

        #endregion

        #region Pagination Counts Properties

        /// <summary>
        /// Current Row Number scrolled into view
        /// </summary>
        public int ScrolledRowNumber
        {
            get { return scrolledRowNumber; }
            set
            {
                NotifySetProperty(ref scrolledRowNumber, value);
                UpdateDataStream();
            }
        }
        private int scrolledRowNumber;

        /// <summary>
        /// Number of rows that are visible to the user.
        /// </summary>
        public int PageRowCount
        {
            get { return pageRowCount; }
            set
            {
                NotifySetProperty(ref pageRowCount, value);

                //Create the grid and set a large enough buffer 
                connection.SetBufferMultiplier(PageRowCount);
                UpdateDataStream();

            }
        }
        private int pageRowCount;

        /// <summary>
        /// Top row number of the current page.
        /// </summary>
        public int TopRowNumber
        {
            get { return topRowNumber; }
            private set { NotifySetProperty(ref topRowNumber, value); }
        }
        private int topRowNumber;

        /// <summary>
        /// Bottom row number of the current page.
        /// </summary>
        public int BottomRowNumber
        {
            get { return bottomRowNumber; }
            private set { NotifySetProperty(ref bottomRowNumber, value); }
        }
        private int bottomRowNumber;

        /// <summary>
        /// Number of rows available from the server connection.
        /// </summary>
        public int TotalCount
        {
            get { return totalCount; }
            private set { NotifySetProperty(ref totalCount, value); }
        }
        private int totalCount;

        /// <summary>
		/// Number of rows being displayed including filtering at the server.
		/// </summary>
		public int FilteredCount
        {
            get { return filteredCount; }
            private set { NotifySetProperty(ref filteredCount, value); }
        }
        private int filteredCount;

        #endregion

        #region Server Connection Methods

        /// <summary>
        /// Dispatch call for updating the data stream.
        /// </summary>
        protected void UpdateDataStream()
        {
            Dispatcher.CurrentDispatcher.InvokeAsync(async () => await CallForDataStream());
        }

        /// <summary>
        /// Establish the connection to the web socket server.
        /// </summary>
        /// <returns>Await <see cref="Task"/></returns>
        protected async Task ConnectToServer()
        {
            //Wire the handlers
            connection.ConnectionLog += OnConnectionLog;
            connection.ServerJsonReceived += OnJsonOrdersReceived;
            connection.ServerBytesReceived += OnBytesOrdersReceived;
            connection.Connected += (s, e) =>
            {
                IsStreamPaused = false;
                IsConnected = true;
            };
            connection.Disconnected += (s, e) =>
            {
                IsStreamPaused = true;
                IsConnected = false;
            };

            //Call the connection
            var url = ConnectionStrings["WebSocketUri"].ConnectionString;
            await connection.CreateConnection(url);
        }

        /// <summary>
        /// Send call to the server to open the stream if the connection is open and 
        /// unpaused; otherwise store the call to use when the connection is (re)established.
        /// </summary>
        /// <returns>Await <see cref="Task"/></returns>
        protected async Task CallForDataStream()
        {
            //Need a dynamic object to properly format the json string
            var filters = new ExpandoObject();
            if (ColumnFilters != null && ColumnFilters.Any())
            {
                var filtersDict = (IDictionary<string, object>)filters;
                foreach (var filter in ColumnFilters)
                    filtersDict.Add(filter.ColumnName, filter);
            }

            //Create the arg list to send to the sever
            var args = new List<object>
            {
                ScrolledRowNumber,
                ScrolledRowNumber + PageRowCount,
                sortDirection.ToString().ToUpper(),
                SortColumnName,
                filters
            };

            var call = new ServerCall(currentId++, ordersStreamCall, args);

            //If the connection is not in a ready state store the call for when it is; otherwise commit
            if (connection.State != WebSocketState.Open || connection.IsUpdatePaused)
            {
                connection.StoreNextServerCall(call);
            }
            else
            {
                IsStreamPaused = true;
                await connection.Send(call);

                //Resume connection update but do not unpause stream until the next orders received event.
                connection.ResumeUpdate();
            }
        }

        /// <summary>
        /// Handler when the <see cref="connection"/> object receives new blotter orders as byte array.
        /// </summary>
        /// <param name="sender">Calling object.</param>
        /// <param name="args"><see cref="ServerBytesReceivedEventArgs&lt;BlotterOrder&gt;"/> that contains the updated blotter orders.</param>
        protected void OnBytesOrdersReceived(object sender, ServerBytesReceivedEventArgs<BlotterOrder> args)
        {
            IsStreamPaused = false;

            //Make sure it is not a delayed message with an incorrect count match
            if (PageRowCount != args.RowCount)
                return;

            TopRowNumber = connection.StartRow;
            BottomRowNumber = connection.EndRow;
            TotalCount = connection.TotalCount;
            FilteredCount = connection.FilteredCount;

            //Make sure scroll is not beyond count
            if (ScrolledRowNumber > FilteredCount)
                ScrolledRowNumber = 0;

            GridModel.LoadRowObjects(args.RowData);
        }

        /// <summary>
        /// Handler when the <see cref="connection"/> object receives new blotter orders as JSON.
        /// </summary>
        /// <param name="sender">Calling object.</param>
        /// <param name="args"><see cref="ServerJsonReceivedEventArgs"/> that contains the updated blotter orders.</param>
        protected void OnJsonOrdersReceived(object sender, ServerJsonReceivedEventArgs args)
        {
            IsStreamPaused = false;

            //Make sure it is not a delayed message with an incorrect count match
            if (PageRowCount != args.RowCount)
                return;

            TopRowNumber = connection.StartRow;
            BottomRowNumber = connection.EndRow;
            TotalCount = connection.TotalCount;
            FilteredCount = connection.FilteredCount;

            //Make sure scroll is not beyond count
            if (ScrolledRowNumber > FilteredCount)
                ScrolledRowNumber = 0;

            GridModel.LoadRowJson(args.RowsJson);
        }

        /// <summary>
        /// Handlers when the <see cref="connection"/> object has a log event.
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="message"></param>
        protected void OnConnectionLog(object sender, string message)
        {
            //LogText = $"{message}{Environment.NewLine}{LogText}";
        }

        #endregion

        #region Commands

        #region Connection

        /// <summary>
        /// Connect to the Backend Server
        /// </summary>
        public DelegateCommand ConnectCommand => new DelegateCommand(connectCommand, connectCommandCanExecute);

        protected async void connectCommand()
        {
            await ConnectToServer();
            await CallForDataStream();
        }

        protected bool connectCommandCanExecute() { return true; }

        #endregion

        #region Add Filter

        /// <summary>
        /// Add server filter and update the server.
        /// </summary>
        public DelegateCommand<ServerColumnFilter> AddFilterCommand => new DelegateCommand<ServerColumnFilter>(addFilterCommand, addFilterCommandCanExecute);

        protected void addFilterCommand(ServerColumnFilter newFilter)
        {
            //Update the filter collection
            if (ColumnFilters == null)
            {
                //Initiate the collection with the filter
                ColumnFilters = new List<ServerColumnFilter> {newFilter};
            }
            else
            {
                //See if there is already an entry for this column
                var oldfilter = ColumnFilters.FirstOrDefault(f => f.ColumnName == newFilter.ColumnName);
                if (oldfilter != null)
                {
                    if (string.IsNullOrEmpty(newFilter.FilterText))
                        ColumnFilters.Remove(oldfilter);
                    else
                        oldfilter.FilterText = newFilter.FilterText;
                }
                else
                {
                    columnFilters.Add(newFilter);
                }
            }

            //Send it to the server
            UpdateDataStream();
        }

        protected bool addFilterCommandCanExecute() { return true; }

        #endregion

        #region Clear Filters

        public DelegateCommand ClearFiltersCommand => new DelegateCommand(clearFiltersCommand, clearFiltersCommandCanExecute);

        protected void clearFiltersCommand()
        {
            GridModel.ClearColumnFilters();
            ColumnFilters = null;
            UpdateDataStream();
        }

        protected bool clearFiltersCommandCanExecute()
        {
            return true;
        }

        #endregion

        #endregion
    }
}
