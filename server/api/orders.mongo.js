const async = require("async");
const present = require("present");

const api = require("./api");
const database = require("./database.mongo");
const options = require('./options');

/** Schema:
 * order#id = All unique ids for orders
 * order:ID = order object (where ID is input)
 * order@FIELD = field index (where FIELD is input)
 */

database.onReady((db) => {
	
	console.log("Db "+db);
	
    const ordersCol = db.collection("orders");
    for (const field of api.indexFields) {
        ordersCol.createIndex({ [field]: 1 });
    }

    function processOrder(data = {}) {
        data.key = data.account + ":" + data.orderId;
        ordersCol.updateOne({ key: data.key }, data, { upsert: true });
    }

    let channels = new Map();
    api.getOrderView = function (response, start, end, sortDir, sortBy, filterObj) {
        start = Math.max(0, start || 0);
        end = Math.max(0, end || 0);
        sortDir = sortDir || "ASC";
        sortBy = sortBy || "orderId";
        filterObj = filterObj || {};
        const websocket = this;

        function removeChannel() {
            clearInterval(channels.get(websocket));
            channels.delete(websocket);
        }

        if (channels.get(this)) removeChannel();

        let lastQueryDate = new Date();
        channels.set(this, () => {
            if (!websocket.isConnected()) return removeChannel();

            //Record key and start time if needed
            let debugArray;
            if (options.performanceData) {
                debugArray = [];
                debugArray.push(++options.performanceData.performanceKey);
                debugArray.push(present());

                //Fail-safe in case the requester never called for the log
                if (options.performanceData.performanceKey > 100000) 
                    api.stopMeasuringPerformance();
            }

            // Get total database count:
            ordersCol.count((err, totalCount) => {
                // Build Filter&Sort queries:
                const sortQuery = { [sortBy]: (sortDir === "ASC" ? 1 : -1) };
                const findQuery = Object.keys(filterObj).reduce((q, field) => {
                    const value = filterObj[field].value.toLowerCase();
                    switch (filterObj[field].op.toUpperCase() || "STARTSWITH") {
                        case "STARTSWITH":
                            q[field] = new RegExp("^" + value + ".*", "i");
                            break;
                        case "CONTAINS":
                            q[field] = new RegExp(".*" + value + ".*", "i");
                            break;
                        case "ENDSWITH":
                            q[field] = new RegExp(".*" + value + "$", "i");
                            break;
                        case "EQUAL":
                            q[field] = new RegExp("^" + value + "$", "i");
                            break;
                        default:
                            break;
                    }

                    return q;
                }, {});

                // Get filter count:
                ordersCol.count(findQuery, (err, filteredCount) => {
                    // Get results:
                    ordersCol.find(findQuery, {_id:0}).sort(sortQuery).skip(start).limit(end-start).toArray((err, orders) => {
                        const message = {
                            start: start,
                            end: end,
                            totalCount: totalCount,
                            filteredCount: filteredCount,
                            data: orders
                        };

                        //Record serialization start time if needed
                        if (options.performanceData) {
                            debugArray.push(present());
                            message.performanceKey = options.performanceData.performanceKey;
                        }

                        // Send view:
                        api.sendOrdersMessage(message, response);
                        
                        //If logging performance record end time and add entry
                        if (options.performanceData) { 
                            debugArray.push(present());
                            options.performanceData.performanceLog.push(debugArray);
                        }
                    });
                });
            });
        });
    };

    const startStreamer = (function () {
        let interval;
        let index;
        let lastInsertDate;
        let lastQueryDate;

        return (callback) => {
            clearInterval(interval); // Make sure to stop current streamer
            index = 0;
            // Clear DB:
            ordersCol.deleteMany({}, () => {
                function processEvent() {
                    // Perform data simulation message updates:
                    if (new Date() - lastInsertDate >= options.buildIntervalMs) {
                        lastInsertDate = new Date();//.setMilliseconds(lastInsertDate.getMilliseconds() + options.buildIntervalMs);
                        // Check if simulation is complete:
                        if (index >= api.messages.length) {
                            console.log("Simulation Complete!");
                            clearInterval(interval);
                            if (callback) callback();
                            return;
                        }

                        let line = api.messages[index];
                        index += 1;
                        // Process line (unless it is empty):
                        if (line.includes(",")) {
                            processOrder(line.split(",").reduce((order, value, index) => {
                                order[api.allFields[index]] = value;
                                return order;
                            }, {}));
                        }
                    }

                    // Perform view updates:
                    if (new Date() - lastQueryDate >= Math.max(options.viewUpdateIntervalMs, options.buildIntervalMs, 50)) {
                        lastQueryDate = new Date();
                        for (const channel of channels) {
                            channel[1]();
                        }
                    }
                }

                api.flushQueue();
                lastInsertDate = new Date();
                lastQueryDate = new Date();
                interval = setInterval(processEvent, 1);//Math.max(buildIntervalMs, 10));
            });
        };
    })();

    function repeatStreamer() {
        startStreamer(repeatStreamer);
    }
    repeatStreamer();

    api.repeatStreamer = repeatStreamer;

    api.flushQueue = () => {};
});