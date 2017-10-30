import protobuf from 'protobufjs';
import present from 'present';
import {getWebsocketURL} from '../utils-workers';

//Number of records to be retrieved in a scenario will be current scenarioCount x scenarioMultiplier
const scenarioCount = 20;
const scenarioMultiplier = 500;
const scenarioTime = 3000;

let resultData;
let protobufRoot;
let ordersProtobufType;
let performanceLogResolver;

//Open the connection to the server
const ws = new WebSocket(getWebsocketURL());
ws.binaryType = "arraybuffer";

ws.onopen = (event) => {
    ws.send(JSON.stringify({id: -1, call: "getOrdersProtobuf"}));	
    ws.send(JSON.stringify({id: -2, call: "startMeasuringPerformance"}));		
};

//Listen for responses from the server
ws.onmessage = (event) => {
    //Determine if the message is binary or json
    let msg;
    let startTime;
    const performanceData = [];

    //Deserialize message
    if (event.data instanceof ArrayBuffer) {
        performanceData.push("protobuf");
        performanceData.push(event.data.byteLength);

        //deserializeStart
        performanceData.push(present());
        msg = ordersProtobufType.decode(new Uint8Array(event.data));

    } else {
        performanceData.push("json");
        performanceData.push(event.data ? event.data.length : -1);		

        //deserializeStart
        performanceData.push(present());            
        msg = JSON.parse(event.data);		
    }
    //deserializeEnd
    performanceData.push(present());      

    //Handle message by id
    if (msg.id >= 0){
        //Add row count and performanceKey then push
        performanceData.push(msg.args[0].data.length);      
        performanceData.unshift(msg.args[0].performanceKey);      
        resultData.push(performanceData);
    } else if (msg.id === -1) {
        //Handle protobuf schema
        protobufRoot = protobuf.Root.fromJSON(msg.args[0]);
        ordersProtobufType = protobufRoot.lookup("blotterorderspackage.BlotterOrdersResponse");
    } else if (msg.id === -2 && performanceLogResolver) {
        //Finalize performance logs
        const logs = msg.args[0].data;
        performanceLogResolver(logs);
        performanceLogResolver = void 0;
    }
};

//Call the server to stop logging performance which will eventually send back the results
function callForPerformanceLogs(){
    const promise = new Promise(function(resolve, reject) { 
        ws.send(JSON.stringify({id: -2, call: "stopMeasuringPerformance"}));		
        performanceLogResolver = resolve;
    });

    return promise;
}

//Loop through increasing row counts
function runScenarios(){
    resultData = [["performanceKey", "type", "messageSize", "deserializeStart", "deserializeEnd", "rowCount"]];
    let loopCount = 0;

    const interval = setInterval(() => {
        if (++loopCount > scenarioCount) {
            clearInterval(interval);
            wrapUp();
        } else {
            const upperLimit = loopCount * scenarioMultiplier;
            console.log("Requesting getOrdersView from 0 to %s...", upperLimit);
    		ws.send(JSON.stringify({id: 0, call: "getOrderView", args: [0,upperLimit, "DESC", "emsTime", {}]}));
        }
    }, scenarioTime);
}

//Stop of all logging and send the results out
function wrapUp(){
    callForPerformanceLogs().then(serverLog => {
        ws.close();
        
        //Create the output starting with the header
        const outputLog = [resultData[0].concat(serverLog[0].slice(1))];
        
        //Merge output based on performanceKey
        for(let i = 1; i < resultData.length; i++) {
            let result = resultData[i];
            const server = serverLog.filter(sl => sl[0] === result[0])[0];
            if (server)
                result = result.concat(server.slice(1));
            outputLog.push(result);
        }

        //Send the results back
        postMessage(outputLog);
    })
    .catch(error => {
        console.error(error);
    });
}

runScenarios();