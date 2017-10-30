using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Net.WebSockets;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using WpfNodeDemo.Classes;
using static System.Configuration.ConfigurationManager;

namespace WpfNodeDemoTests
{
    /// <summary>
    /// Test connection to the server
    /// </summary>
    [TestClass]
    public class ServerConnectionTests
    {
        private readonly ServerConnection<BlotterOrder> connection = new ServerConnection<BlotterOrder>();

        [TestInitialize]
        public void Connect()
        {
            //Get the connection string from the main app
            var url = ConnectionStrings["WebSocketUri"].ConnectionString;
            Assert.IsNotNull(url, "App.Config should have a proper URL to the WS server.");
            Assert.AreNotEqual("", url, "App.Config should have a proper URL to the WS server.");

            //Open is async but Test Initialize cannot do async calls
            var task = connection.CreateConnection(url);
            task.Wait();
        }

        [TestMethod]
        public void ConnectionShouldBeOpen()
        {
            Assert.AreEqual(WebSocketState.Open, connection.State, "WS Connection should have an Open state after connecting.");
        }

        [TestMethod]
        public async Task OrderStreamShouldReturnOrders()
        {
            //Need to create delay for the first set of orders to come in
            var statusEvent = new ManualResetEvent(false);
            var isComplete = false;
            var rowCount = 10;
            IEnumerable<BlotterOrder> currentData = null;

            //Listen for log messages
            connection.ConnectionLog += (sender, message) => Console.WriteLine(message);

            //Listen for orders flowing in via JSON
            connection.ServerJsonReceived += (sender, jsonArgs) =>
            {
                //Create the args by comparing to prior (if any)
                var args = ServerDataReceivedEventArgs<BlotterOrder>.DeserializeMessage(jsonArgs.RawJson, currentData);
                currentData = args.Data.ToList();

                //The count increment has been processed at the server
                if (currentData.Count() == 100)
                {
                    //Second event should have a comparison result
                    Assert.IsNotNull(args.PriorComparisonResult, "Order PriorComparisonResult object should not be null.");
                    isComplete = true;
                }

                //Clear the event status
                Assert.IsNotNull(currentData, "Order Data object should not be null.");
                Assert.IsTrue(currentData.Any(), "Order Data object in Event handler args parameter should have objects.");
                Console.WriteLine(currentData.Count());
                statusEvent.Set();
            };

            //Listen for orders flowing in vis Protobuf
            connection.ServerBytesReceived += (sender, bytesArgs) =>
            {
                //Create the args by comparing to prior (if any)
                var args = ServerDataReceivedEventArgs<BlotterOrder>.DeserializeMessage(bytesArgs.RawData, currentData);
                currentData = args.Data.ToList();

                //The count increment has been processed at the server
                if (currentData.Count() == 100)
                {
                    //Second event should have a comparison result
                    Assert.IsNotNull(args.PriorComparisonResult, "Order PriorComparisonResult object should not be null.");
                    isComplete = true;
                }

                //Clear the event status
                Assert.IsNotNull(currentData, "Order Data object should not be null.");
                Assert.IsTrue(currentData.Any(), "Order Data object in Event handler args parameter should have objects.");
                Console.WriteLine(currentData.Count());
                statusEvent.Set();
            };


            //Make the call to open the orders stream and wait for the ServerDataReceived event to fire TWICE
            var callname = AppSettings["ordersStreamCall"];
            Assert.IsNotNull(callname, "AppSettings should contain an entry for 'ordersStreamCall'");

            connection.SetBufferMultiplier(rowCount);
            await connection.Send(new ServerCall(1, callname, new List<object> { 0, rowCount }));
            statusEvent.WaitOne(2000);
            statusEvent.Reset();
            statusEvent.WaitOne(2000);

            //Change the count
            statusEvent.Reset();
            rowCount = 100;
            connection.SetBufferMultiplier(rowCount);
            await connection.Send(new ServerCall(1, callname, new List<object> { 0, rowCount }));
            statusEvent.WaitOne(2000);

            //Make sure the event fired
            Assert.IsTrue(isComplete, "ServerDataReceived event should fired.");
        }

        [TestMethod]
        public async Task OrderStreamUpdatesSorting()
        {
            //Need to create delay for the first set of orders to come in
            var statusEvent = new ManualResetEvent(false);
            var isFired = false;
            var count = 0;

            //Listen for orders flowing in as json
            connection.ServerJsonReceived += (sender, jsonArgs) =>
            {
                var args = ServerDataReceivedEventArgs<BlotterOrder>.DeserializeMessage(jsonArgs.RawJson);

                switch (count)
                {
                    case 1:
                    {
                        var prices = args.Data
                            .Select(order => order.Price)
                            .ToList();

                        Console.WriteLine(prices.Aggregate(new StringBuilder(), (sb, p) => sb.Append($"{p}, ")));

                        for (var i = 1; i < prices.Count; i++)
                            Assert.IsTrue(prices[i] <= prices[i - 1], "Prices should be in descending order.");

                        count = 0;
                        isFired = true;
                        statusEvent.Set();
                    }
                        break;
                    case 2:
                    {
                        var prices = args.Data
                            .Select(order => order.Price)
                            .ToList();

                        Console.WriteLine(prices.Aggregate(new StringBuilder(), (sb, p) => sb.Append($"{p}, ")));

                        for (var i = 1; i < prices.Count; i++)
                            Assert.IsTrue(prices[i] >= prices[i - 1], "Prices should be in ascending order.");

                        count = 0;
                        isFired = true;
                        statusEvent.Set();

                    }
                        break;
                }
            };

            //Listen for orders flowing in as byte arrays
            connection.ServerBytesReceived += (sender, bytesArgs) =>
            {
                var args = ServerDataReceivedEventArgs<BlotterOrder>.DeserializeMessage(bytesArgs.RawData);

                switch (count)
                {
                    case 1:
                        {
                            var prices = args.Data
                                .Select(order => order.Price)
                                .ToList();

                            Console.WriteLine(prices.Aggregate(new StringBuilder(), (sb, p) => sb.Append($"{p}, ")));

                            for (var i = 1; i < prices.Count; i++)
                                Assert.IsTrue(prices[i] <= prices[i - 1], "Prices should be in descending order.");

                            count = 0;
                            isFired = true;
                            statusEvent.Set();
                        }
                        break;
                    case 2:
                        {
                            var prices = args.Data
                                .Select(order => order.Price)
                                .ToList();

                            Console.WriteLine(prices.Aggregate(new StringBuilder(), (sb, p) => sb.Append($"{p}, ")));

                            for (var i = 1; i < prices.Count; i++)
                                Assert.IsTrue(prices[i] >= prices[i - 1], "Prices should be in ascending order.");

                            count = 0;
                            isFired = true;
                            statusEvent.Set();

                        }
                        break;
                }
            };

            //Make the call to open the orders stream and wait for the ServerDataReceived event to fire TWICE
            var callname = AppSettings["ordersStreamCall"];
            Assert.IsNotNull(callname, "AppSettings should contain an entry for 'ordersStreamCall'");

            //Call with sorting by price DESC
            var call = new ServerCall(1, callname, new List<object> { 0, 10, "DESC", "price" });
            count = 1;
            await connection.Send(call);
            statusEvent.WaitOne(5000);

            Assert.IsTrue(isFired, "ServerDataReceived event should fired.");

            //Call with sorting by price ASC
            statusEvent.Reset();
            call = new ServerCall(1, callname, new List<object> { 0, 10, "ASC", "price" });
            count = 2;
            await connection.Send(call);
            statusEvent.WaitOne(5000);

            Assert.IsTrue(isFired, "ServerDataReceived event should fired.");
        }

        [TestMethod]
        public async Task OrderStreamUpdatesCount()
        {
            //Need to create delay for the first set of orders to come in
            var statusEvent = new ManualResetEvent(false);
            var isFired = false;
            var requestedCount = 0;


            //Listen for orders flowing in as json
            connection.ServerJsonReceived += (sender, jsonArgs) =>
            {
                var args = ServerDataReceivedEventArgs<BlotterOrder>.DeserializeMessage(jsonArgs.RawJson);

                Assert.AreEqual(requestedCount, args.Data.Count(), "Count received from the server does not match what was expected.");

                Console.WriteLine($"Count from the server: {args.Data.Count()}, ");
                isFired = true;
                statusEvent.Set();
            };

            //Listen for orders flowing in as byte arrays
            connection.ServerBytesReceived += (sender, bytesArgs) =>
            {
                var args = ServerDataReceivedEventArgs<BlotterOrder>.DeserializeMessage(bytesArgs.RawData);

                Assert.AreEqual(requestedCount, args.Data.Count(), "Count received from the server does not match what was expected.");

                Console.WriteLine($"Count from the server: {args.Data.Count()}, ");
                isFired = true;
                statusEvent.Set();
            };

            //Make the call to open the orders stream and wait for the ServerDataReceived event to fire TWICE
            var callname = AppSettings["ordersStreamCall"];
            Assert.IsNotNull(callname, "AppSettings should contain an entry for 'ordersStreamCall'");

            //Call with sorting by price DESC
            requestedCount = 10;
            var call = new ServerCall(1, callname, new List<object> { 0, requestedCount, "DESC", "price" });
            await connection.Send(call);
            statusEvent.WaitOne(5000);

            Assert.IsTrue(isFired, "ServerDataReceived event should fired.");

            //Call with sorting by price ASC
            statusEvent.Reset();
            requestedCount = 20;
            call = new ServerCall(1, callname, new List<object> { 0, requestedCount, "DESC", "price" });
            await connection.Send(call);
            statusEvent.WaitOne(5000);

            Assert.IsTrue(isFired, "ServerDataReceived event should fired.");
        }

        [TestMethod]
        public async Task OrderStreamConvertsToGrid()
        {
            //Need to create delay for the first set of orders to come in
            var statusEvent = new ManualResetEvent(false);
            var isFired = false;

            //Listen for orders flowing in as json
            connection.ServerJsonReceived += (sender, jsonArgs) =>
            {
                var args = ServerDataReceivedEventArgs<BlotterOrder>.DeserializeMessage(jsonArgs.RawJson);
                var grid = new FastWindowGridModel<BlotterOrder>(10);
                grid.LoadRowJson(jsonArgs.RowsJson);

                //Make sure data matches
                var props = typeof (BlotterOrder).GetProperties();
                Assert.AreEqual(props.Length, grid.ColumnCount, "Grid column count should match the number of public properties in BlotterOrders");

                for (var r = 0; r < grid.RowCount; r++)
                {
                    for (var c = 0; c < grid.ColumnCount; c++)
                    {
                        var cellstr = grid.GetCellText(r, c).ToLower();
                        var propval = props[c].GetValue(args.Data.ElementAt(r));

                        if (propval is DateTime)
                        {
                            var cellval = DateTimeOffset.Parse(cellstr,CultureInfo.InvariantCulture).DateTime;
                            Console.WriteLine($"({r},{c}): {propval} = {cellval}: {(DateTime)propval == cellval}");
                            Assert.AreEqual(propval, cellval);
                        }
                        else
                        {
                            var propstr = propval?.ToString().ToLower() ?? string.Empty;
                            Console.WriteLine($"({r},{c}): {propstr} = {cellstr}: {propstr == cellstr}");
                            Assert.AreEqual(propstr, cellstr);
                        }
                    }
                }

                Console.WriteLine("Property match completed successfully.");
                isFired = true;
                statusEvent.Set();
            };

            //Listen for orders flowing in as byte arrays
            connection.ServerBytesReceived += (sender, bytesArgs) =>
            {
                var args = ServerDataReceivedEventArgs<BlotterOrder>.DeserializeMessage(bytesArgs.RawData);
                var grid = new FastWindowGridModel<BlotterOrder>(10);
                grid.LoadRowObjects(bytesArgs.RowData);

                //Make sure data matches
                var props = typeof(BlotterOrder).GetProperties();
                Assert.AreEqual(props.Length, grid.ColumnCount, "Grid column count should match the number of public properties in BlotterOrders");

                for (var r = 0; r < grid.RowCount; r++)
                {
                    for (var c = 0; c < grid.ColumnCount; c++)
                    {
                        var cellstr = (grid.GetCellText(r, c) ?? "").ToLower();
                        var propval = props[c].GetValue(args.Data.ElementAt(r));

                        if (propval is DateTime)
                        {
                            var cellval = DateTimeOffset.Parse(cellstr, CultureInfo.InvariantCulture).DateTime;
                            Console.WriteLine($"({r},{c}): {propval} = {cellval}: {(DateTime)propval == cellval}");
                            Assert.AreEqual(propval, cellval);
                        }
                        else
                        {
                            var propstr = propval?.ToString().ToLower() ?? string.Empty;
                            Console.WriteLine($"({r},{c}): {propstr} = {cellstr}: {propstr == cellstr}");
                            Assert.AreEqual(propstr, cellstr);
                        }
                    }
                }

                Console.WriteLine("Property match completed successfully.");
                isFired = true;
                statusEvent.Set();
            };

            //Make the call to open the orders stream and wait for the ServerDataReceived event to fire TWICE
            var callname = AppSettings["ordersStreamCall"];
            Assert.IsNotNull(callname, "AppSettings should contain an entry for 'ordersStreamCall'");

            //Call with sorting by price DESC
            var call = new ServerCall(1, callname, new List<object> { 0, 10, "DESC", "price" });
            await connection.Send(call);
            statusEvent.WaitOne(5000);

            Assert.IsTrue(isFired, "ServerDataReceived event should fired.");
        }


        [TestCleanup]
        public async void Disconnect()
        {
            if (connection.State != WebSocketState.Closed)
                await connection.Close("Closed by WPF Unit Test Session Cleanup");

            Assert.IsTrue(connection.State == WebSocketState.Closed);
        }
    }
}
