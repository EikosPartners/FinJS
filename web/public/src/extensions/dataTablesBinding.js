import $ from 'jquery';
import ko from 'knockout';

ko.bindingHandlers.dataTables = {
	init: function(
		element,
		valueAccessor,
		allBindings
	) {

		let settings = valueAccessor(),
			columns = settings.columns,
			options = settings.options,
			dataService = settings.data,
			connection = settings.dictionary().connection,
			data = [];

		
		//let grid = new Slick.Grid(element, dataView, columns, options);

		//once we have a connection to websocket, resize the grid to fit the window, which will trigger a query to the server
		// connection.onOpened(function () {
		// 	onResize();
		// });

		//when viewport changes, send a query for the new visible rows
		// grid.onViewportChanged.subscribe(function () {
		// 	let vp = grid.getViewport();
		// 	let size = vp.bottom - vp.top;
		// 	let query = {
		// 		start: Math.max(0, vp.top - size),
		// 		size: 3 * size
		// 	};
		// 	connection.sendQuery(query);
		// });

		function onResize() {
			
		}

		window.addEventListener("resize", onResize);

		function transformData (data) {
			let keys = Object.keys(data[0]);
			let transformedData = [];
			for (let i = 0; i < data.length; i++) {
				let newRow = keys.map(function (key) {
					return data[i][key];
				});
				transformedData.push(newRow);
			}
			return transformedData;
		}

		let isDTLoaded = false;
		//dataService is an observable passed to us from blotterViewModel, it's updated with every new message from the server
		let subscription = dataService.subscribe(function (response) {     	
        	data = response.args[0].data;	//response.args[0] => {start: 0, end: 10, totalCount: 2662, filteredCount: 2662, data: Array[10]}
			let newData = transformData(data);
			if (!isDTLoaded) {
				$('#mydatatable').DataTable({
					data: newData,
					columns: columns
				});
			}
			isDTLoaded = true;
			let table = $('#mydatatable').DataTable();
			table.rows().every(function (index) {
				this.data(newData[index]);
				this.invalidate();
			});
			table.draw();
    	});

		ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
			subscription.dispose();
		});
	}
}
