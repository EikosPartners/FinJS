import PingWorker from 'worker!./pingWorker.js';
import ProtobufTestWorker from 'worker!./protobufTestWorker.js';

function createDbTester(ws){
    let currentLatency;
    let pingWorker;
    let isPinging = false;
    let isPerformanceLogging = false;
    let performanceLogResolver;

    //Setup web worker to measure net latency
    function startServerPing(){
        stopServerPing();

        pingWorker = new PingWorker();
        pingWorker.onmessage = function(e){
            currentLatency = e.data;
        };

        isPinging = true;
    }

    //Kill the web worker with option to leaving pinging indicator for the benefit of the a reconnect
    function stopServerPing(wasPinging){
        if (pingWorker) pingWorker.terminate();
        if (!wasPinging) isPinging = false;
        currentLatency = null;
    }

    //Call the server to start logging performance
    function startPerformanceLogging(){
        isPerformanceLogging = true;
        startServerPing();
        ws.send(JSON.stringify({id: -2, call: "startMeasuringPerformance"}));		
    }

    //Call the server to stop logging performance which will eventually send back the results
    function stopPerformanceLogging(){
        const promise = new Promise(function(resolve, reject) { 
            ws.send(JSON.stringify({id: -2, call: "stopMeasuringPerformance"}));		
            stopServerPing();
            performanceLogResolver = resolve;
        });

        return promise;
    }

    //Executes the protobuf tests on a web worker
    function runProtobufTests(){
        return new Promise((resolve, reject) => {
            var protoTest = new ProtobufTestWorker();
            protoTest.onmessage = e => {
                protoTest.terminate();
                resolve(e.data);
            };
        });
    }

    function getCurrentLatency() { 
        return currentLatency; 
    }

    function getIsPinging() { 
        return isPinging; 
    }

    function getIsPerformanceLogging() { 
        return isPerformanceLogging; 
    }

    function processPerformanceLogs(logs){
        if (!performanceLogResolver) 
            return;
        
        performanceLogResolver(logs);
        performanceLogResolver = void 0;
    }

    return {
        getCurrentLatency,    
        getIsPinging,
        startServerPing,
        stopServerPing,
        getIsPerformanceLogging,
        startPerformanceLogging,
        stopPerformanceLogging,
        processPerformanceLogs,
        runProtobufTests
    };
}

export {
    createDbTester
};