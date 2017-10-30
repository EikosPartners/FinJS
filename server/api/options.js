//Determines if this should ignore changes to the settings
const isProduction = false;

//Use this file to for various program options
const fs = require("fs");

//Update intervals and protobuf serialization
let viewUpdateIntervalMs = 200;
let buildIntervalMs = 10;
let isOrdersMessageEncoded = true;

//Message logging - write messages sent to server to file
let isMessageFileLogEnabled = true;
let messageFileLogStream;
if (isMessageFileLogEnabled)
{
    const logPath = "./messges.log";
    try { fs.unlinkSync(logPath); } catch (error) { } //fs.exists is deprecated so only way is with try-catch?!
    messageFileLogStream = fs.createWriteStream(logPath);
}

//Set backend tech - 'mongo' or 'redis'
let backendType = "mongo";
//let backendType = "redis";

//If time measurements should be recorded this object will be defined
let performanceData;

//Export options
module.exports = {
    isProduction,
    isMessageFileLogEnabled,
    messageFileLogStream,
    viewUpdateIntervalMs,
    buildIntervalMs,
    isOrdersMessageEncoded,
    backendType,
    performanceData,
};