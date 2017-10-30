//***Message IDs: 0 = orders data; -1 = protobuf spec; -2 = performance log data
//import 'scalejs.windowfactory';
import protobuf from 'protobufjs';
import present from 'present';
import {getWebsocketURL} from './utils-workers';
import {createDbTester} from './testing/dbServiceTesting';

function startConnection() {
	let serviceSubs = {};
	let onOpenSubs = {};
	let messageQueue = Object.create(null); // Avoid Object prototype overwrites
	let isWindowActive = !document.hidden;
	let ws;
	let protobufRoot;
	let ordersProtobufType;
	let dbTester;

	function open() {
		ws = new WebSocket(getWebsocketURL());
		ws.binaryType = "arraybuffer";
		dbTester = createDbTester(ws);

		//If this was actively pinging when the connection was last closed
		if (dbTester.getIsPinging()) dbTester.startServerPing();

		// Message Parsing Timer, for throttling:
		let subTimer = setInterval(() => {
			// Go through each queued message:
			for (const messageID in messageQueue) {
				const message = messageQueue[messageID];
				for (let subscriberId in serviceSubs)
					serviceSubs[subscriberId](message);
			}

			// Clean object:
			messageQueue = Object.create(null);
		}, windowfactory.isMobile ? 500 : 100); // Mobile is slower, so increase interval timer

		ws.onmessage = (event) => {
			//Determine if the message is binary or json
			let msg;
			let startTime;
			const logging = dbTester.getIsPerformanceLogging();

			try {
				if (logging) startTime = present();	

				//Deserialize message
				if (event.data instanceof ArrayBuffer) {
					msg = ordersProtobufType.decode(new Uint8Array(event.data));
					if (logging) msg.args[0].messageSize = event.data.byteLength;

				} else {
					msg = JSON.parse(event.data);		
					if (logging) msg.args[0].messageSize = event.data.length;							
				}

				if (logging) {
					msg.args[0].messageDeserializeStart = startTime;
					msg.args[0].messageDeserializeEnd = present();
				}	
				
			} catch(err) {
				console.error("Failed to parse message:", err, event.data);
			}

			if (msg.id >= 0){
				//Queue all non-spec
				messageQueue[msg.id] = msg;
			} else if (msg.id === -1) {
				//Handle protobuf schema
				protobufRoot = protobuf.Root.fromJSON(msg.args[0]);
				ordersProtobufType = protobufRoot.lookup("blotterorderspackage.BlotterOrdersResponse");
			} else if (msg.id === -2 && logging) {
				//Handle performance logs
				const logs = msg.args[0].data;
				dbTester.processPerformanceLogs(logs);
			}
		};
		ws.onopen = (event) => {
			//Call for the protobuf spec
			ws.send(JSON.stringify({id: -1, call: "getOrdersProtobuf"}));		

			for (let id in onOpenSubs) {
				onOpenSubs[id](event);
				//delete onOpenSubs[id];
			}	
		};
		ws.onclose = (event) => {
			dbTester.stopServerPing(dbTester.getIsPinging());			
			clearInterval(subTimer);
			const timerID = setInterval(() => {
				if (isWindowActive) {
					//console.debug("Active");
					clearInterval(timerID);
					open();
				} else {
					//console.debug("Inactive");
				}
			}, 1000);
		};
		ws.onerror = (error) => {
			console.error(error);
		};
	}

	function subscribeToService(callback) {
		let id = new Date().getTime().toString();
		serviceSubs[id] = callback;
		return id;
	}

	function unsubscribeToService(id) {
		return delete serviceSubs[id];
	}

	function sendQuery (query) {
		if (isClosed()) return;
		let queryMssg = {
			id: 0,
			call: "getOrderView",
			args: [query.start, query.end, query.sortDirection, query.sortColName, query.filterObject]
		}
		ws.send(JSON.stringify(queryMssg));
	}

	//Sample message sent to server
	/*{
		id: 0,
		call: "getOrderView",
		args: [
			0,
			39,
			"DESC",
			"emsblotterTime",
			{
				emsAccount: {
					value: "a",
					op: "startsWith"
				},
				orderSide: {
					value: "b",
					op: "startsWith"
				}
			}
		]
	}*/

	function close() {
		ws.close();
		onOpenSubs = null;
		serviceSubs = null;
		document.removeEventListener("visibilitychange", _handleVisibility);
	}

	function isOpen() {
		return ws.readyState === ws.OPEN;
	}

	function isClosed() {
		return ws.readyState !== ws.OPEN;
	}

	function onOpened(callback) {
		if (isOpen()) {
			callback();
		} else {
			let id = new Date().getTime().toString();
			onOpenSubs[id] = callback;
			return id;
		}
	}

	function _handleVisibility() {
		isWindowActive = !document.hidden;
		if (!isWindowActive) ws.close();
	}

	// TODO-TBD: Support for older versions?
	document.addEventListener("visibilitychange", _handleVisibility);

	open(); // Start connection

	return {
		subscribeToService: subscribeToService,
		onOpened: onOpened,
		sendQuery: sendQuery,
		close: close,
		isOpen: isOpen,
		isClosed: isClosed,
		testing : {
			getCurrentLatency: dbTester.getCurrentLatency,
			startPerformanceLogging: dbTester.startPerformanceLogging,
			stopPerformanceLogging: dbTester.stopPerformanceLogging,
			runProtobufTests: dbTester.runProtobufTests
		}
	};
}

export {
	startConnection
};
