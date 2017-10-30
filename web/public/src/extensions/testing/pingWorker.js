import present from 'present';
import {getWebsocketURL} from '../utils-workers';

let latencyStartTime;
let pingingInterval;

//Open the connection to the server
const ws = new WebSocket(getWebsocketURL());

//Listen for responses from the server
ws.onmessage = function (ev) {
    
    //See if this is a ping response
    if (ev.data.substr(0, 4) !== "pong") 
        return;
    
    if (ev.data.substr(4) === latencyStartTime.toString()) {
        const currentLatency = (present() - latencyStartTime).toFixed(4);
        postMessage(currentLatency);    
    }    
};

//Stop sending messages if the connection is closed
ws.onclose = function(ev){
    clearInterval(pingingInterval);
};

//Send the message to the server and time the response
function ping(){
    latencyStartTime = present();
    ws.send(JSON.stringify({ call: "ping", stamp: latencyStartTime.toString() }));
}

pingingInterval = setInterval(ping, 1000);