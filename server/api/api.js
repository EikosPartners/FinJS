const fs = require("fs");
const path = require("path");
const protobufPackaging = require('./protobufPackaging');
const options = require('./options');

//Import the data
const messages = fs.readFileSync(path.join(__dirname, "..", "data", "order_messages_demo.csv"), { encoding: "utf-8" }).split(/[\r\n]+/g);
const header = messages.shift();
const fieldTypesMap = new Map();
fieldTypesMap.key = "String";
header.split(",").forEach(field => {
    const parts = field.split(":");
    fieldTypesMap.set(parts[0], parts[1]);
}, {});

//Set the indexFields for the api
const allFields = [...fieldTypesMap.keys()];
const indexFields = allFields.filter((field) => {
    return true;//return fieldTypesMap[field] !== "String";
});

//Populate the protobuf Schema
const protobufRoot = protobuf.Root.fromJSON(protobufPackaging.getOrdersPackage(fieldTypesMap));

//Send the orders message base on encoding type
function sendOrdersMessage(ordersMessage, response) {
    if (options.isOrdersMessageEncoded) {
        const ordersProtobufType = protobufRoot.lookup("blotterorderspackage.BlotterOrdersResponse");
        response.sendEncoded(ordersProtobufType, ordersMessage);
    } else {
        response.sendAsJSON(ordersMessage);
    }
}

//Expose the protobuf spec
function getOrdersProtobuf(response){
    const protoObj = protobufRoot.toJSON();
    response.sendAsJSON(protoObj);
}

//Turn on storage of timestamps
function startMeasuringPerformance(response){
    options.performanceData = {};
    options.performanceData.performanceLog = [["performanceKey", "queryStartTime", "serializeStartTime", "serializeEndTime"]];
    options.performanceData.performanceKey = 0;
    console.log("\nPerformance Logging Started....\n");
}

//Turn off storage of timestamps
function stopMeasuringPerformance(response){
    if (response)
        response.sendAsJSON({ data: options.performanceData.performanceLog });
        
    options.performanceData = void 0;
    console.log("\nPerformance Logging stopped.\n");
}

module.exports = {
    messages,
    indexFields,
    allFields,
    fieldTypesMap,
    sendOrdersMessage,
    getOrdersProtobuf,
    startMeasuringPerformance,
    stopMeasuringPerformance
};

//selected backend type
require("./orders." + options.backendType);