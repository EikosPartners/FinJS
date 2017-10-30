import $ from 'jquery';
import ko from 'knockout';
import './slick.grid';
import './slick.dataview';
import '../../css/slick.grid.css';
import {exportArrayToCsv} from './utils';
import present from 'present';


ko.bindingHandlers.slickGrid = {
	init: function(
		element,
		valueAccessor,
		allBindings,
		viewModel,
		bindingContext
	) {
		let mouseWheelTimeout;

		let settings = valueAccessor(),
			columns = settings.columns,
			options = settings.options,
			dataService = settings.data,
			connection = settings.dictionary().connection,
			defaultSortDirection = settings.options.nonSlickGridOpts.defaultSortDirection,
			defaultSortColName = settings.options.nonSlickGridOpts.defaultSortColName,
			itemsCount = ko.observable(0);

		let itemsState = {},
			filterState = {},//{ orderId: { op: "startsWith", value: "1" }},
			viewState = {},
			sortState = {
				direction: defaultSortDirection,
				colName: defaultSortColName
			};

		let dataView = {
			getLength: function () {
				//console.log(itemsCount());
				if (ko.isObservable(itemsCount)) {
					return itemsCount();
				}
				return data.length;
			},
			getItem: function (index) {
				return itemsState[index];
			},
			getItemMetadata: function () {
			}
		};

		function onResize () {
			//prevent calling onViewportChanged which would send a query to a connection that is already closed
			if (connection.isClosed()) {
				return window.removeEventListener("resize", onResize);
			}
			if (grid != undefined) {
				grid.resizeCanvas(); //grid resizes number of rows to fit in the container
				grid.onViewportChanged.notify({ grid: grid }, new Slick.EventData(), grid); //use slick grid's event to notify the viewport has changed
			} else {
				console.warn("calling onResize but grid is not defined");
			}
		}

		function sendQueryToServer () {
			connection.sendQuery({
				start: viewState.start,
				end: viewState.end,
				sortDirection: sortState.direction,
				sortColName: sortState.colName,
				filterObject: filterState
			});
		}

		function onViewportChange () {
			let vp = grid.getViewport();
			let visibleRowCount = vp.bottom - vp.top;
			let totalRequestCount = visibleRowCount * 3;

			viewState.start = Math.max(0, vp.top - visibleRowCount);
			viewState.end = viewState.start + totalRequestCount;

			sendQueryToServer();
		}

		function onSortChange (e, args) {
			let sortObj = args.multiColumnSort ? args.sortCols[0].sortCol : args.sortCol;
			//update sort state
			sortState.colName = sortObj.field;
			sortState.direction = args.sortAsc ? "ASC" : "DESC";

			sendQueryToServer();
		}

		function onFilterChange (value, column) {
			//if value is empty, remove filter object from filterState
			if (value === "") {
				delete filterState[column.field];
			} else {
				if (filterState[column.field]) {
					//update filter object
					filterState[column.field]["value"] = value;
				} else {
					//create filter object
					filterState[column.field] = {
						value: value,
						op: "startsWith"
					};
				}
			}

			sendQueryToServer();
		}

		function onScrollMouseDown(e, args){
			viewModel.isScrolling(true);
		}
		
		function onScrollMouseUp(e, args){
			viewModel.isScrolling(false);
		}

		function onMouseWheel(e, args){
			clearTimeout(mouseWheelTimeout);
			viewModel.isScrolling(true);

			mouseWheelTimeout = setTimeout(function() {
				viewModel.isScrolling(false);
			}, 300);
		}

		//********************
		//debugging log
		//********************
		let isTimeLogging;
		let timeLog;
		let responseStartTime;

		window.startTimeLog = function (){
			connection.testing.startPerformanceLogging();
			timeLog = [];
			timeLog.push(["Performance Key", "UI Start Time", "UI End Time", "Row Count", "Connection Latency", "Message Size", "Deserialize Start", "Deserialize End"]);
			isTimeLogging = true;
			console.warn("Time logs are now being stored, call 'stopTimeLog()' to stop and save to file.");
		};

		window.stopTimeLog = function (){
			console.warn("Time logs storage is now stopped.");
			isTimeLogging = false;

			connection.testing.stopPerformanceLogging()
				.then(serverLog => {
					//Create the output starting with the header
					const outputLog = [timeLog[0].concat(serverLog[0].slice(1))];
					
					//Merge output based on performanceKey
					for(let i = 1; i < timeLog.length; i++) {
						let time = timeLog[i];
						const server = serverLog.filter((sl) => sl[0] === time[0])[0];
						if (server)
							time = time.concat(server.slice(1));
						outputLog.push(time);
					}

					timeLog = void 0;
					exportArrayToCsv(outputLog);
					console.warn("Export to CSV complete.");
				})
				.catch(error => {
					console.error(error);
				});
		};

		window.runProtobufTests = function () {
			connection
				.testing
				.runProtobufTests()
				.then(logs => {
					exportArrayToCsv(logs);
					console.warn("Export to CSV complete.");
				});
		};

		//********************
		//Create the main grid
		//********************
		let grid = new Slick.Grid(element, dataView, columns, options);


		//once we have a connection to websocket, resize the grid to fit the window, which will trigger a query to the server
		connection.onOpened(function () {
			onResize();
		});

		grid.setSortColumn(defaultSortColName, defaultSortColName == "ASC");

		//when viewport changes, send a query for the new visible rows
		grid.onViewportChanged.subscribe(onViewportChange);

		grid.onSort.subscribe(onSortChange);

		grid.onScrollMouseDown.subscribe(onScrollMouseDown);

		grid.onScrollMouseUp.subscribe(onScrollMouseUp);

		grid.onMouseWheel.subscribe(onMouseWheel);

		//grid.onTouchStart.subscribe(onScrollMouseDown);

		//grid.onTouchEnd.subscribe(onScrollMouseUp);

		grid.onHeaderRowCellRendered.subscribe(function(e,args) {
			let quickSearch = ko.observable("");
			let column = args.column;

			quickSearch.subscribe(function (value) {
				onFilterChange(value, column)
			});

			//Add input html element with a data bind attribute for the bindings
			args.node.innerHTML =  '<input type="text" data-bind="value: value, valueUpdate: \'afterkeydown\'"/>';

			//apply the bindings to this html element
			let childContext = bindingContext.createChildContext({value: quickSearch});
			ko.applyBindingsToDescendants(childContext, args.node);
		});



		window.addEventListener("resize", onResize);

		itemsCount.subscribe(function (count) {
			grid.updateRowCount();
			grid.render();
		});

		//dataService is an observable passed to us from blotterViewModel, it's updated with every new message from the server
		let subscription = dataService.subscribe(function (response) {
			if (isTimeLogging)
				responseStartTime = present();

			if (viewModel.isScrolling()) {
				return;
			}

        	const message = response.args[0];	//response.args[0] => {start: 0, end: 10, totalCount: 2662, filteredCount: 2662, data: Array[10]}
        	const data = message.data;
        	itemsCount(message.filteredCount || 0);
        	viewModel.filteredRowCount(message.filteredCount || 0);
        	viewModel.totalRowCount(message.totalCount);

        	let rows = new Array(data.length);
			let range = grid.getRenderedRange();
        	viewModel.recordsStart(range.top);
        	viewModel.recordsEnd(range.bottom);

			let start = Math.max((message.start || 0) -1, 0);
			
			itemsState = {};

	        //append index on each row object in data so slick grid can get it in getData
	        data.forEach(function (dataRow, index) {
	            let absoluteIndex = start + index;
	            dataRow.id = absoluteIndex.toString();
	            itemsState[absoluteIndex] = dataRow;
	            rows[index] = absoluteIndex;
	        });
	     

        	let	invalidated = rows.filter(function (r, i) {
    			return r >= range.top && r <= range.bottom;
    		});

	        if (invalidated.length > 0) {
	            grid.invalidateRows(invalidated);
	            grid.render();
	        } 

	        //When the server resets the loop of data, make sure the client requests the first rows
	       	if (viewState.start > range.top) {
	        	console.log("triggered viewport change");
	        	grid.onViewportChanged.notify({ grid: grid }, new Slick.EventData(), grid);
	        }

			if (isTimeLogging) {
				timeLog.push([
					message.performanceKey,
					responseStartTime,
					present(),
					data.length,
					connection.testing.getCurrentLatency(),
					message.messageSize,
					message.messageDeserializeStart,
					message.messageDeserializeEnd
				]);
			}
		});

    	grid.init();

		ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
			subscription.dispose();			
		});

		return { controlsDescendantBindings: true };
	}
}