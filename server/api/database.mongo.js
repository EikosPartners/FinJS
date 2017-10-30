const MongoClient = require("mongodb").MongoClient;
let callbacks = [];
let ready = false;


//set hostname in environment variable: MONGO_HOSTNAME, otherwise use localhost
let mongoConnectionString="mongodb://localhost:27017/test";   
if(process.env.MONGO_HOSTNAME_PORT) mongoConnectionString="mongodb://"+process.env.MONGO_HOSTNAME_PORT+"/test";
   
console.log("Attempting to connect to server : "+mongoConnectionString);

MongoClient.connect(mongoConnectionString, (err, db) => {
    console.log("Connection status DB:" + db +" Err:"+err+" Con:"+mongoConnectionString);
    ready = true;
    exports.db = db;

    for (const callback of callbacks) {
        callback(db);
    }
    callbacks = undefined;
});

exports.onReady = (callback) => {
    if (ready) return callback(exports.db);

    if (callbacks.indexOf(callback) >= 0) return;

    callbacks.push(callback);
};