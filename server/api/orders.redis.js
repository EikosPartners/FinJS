const fs = require("fs");
const path = require("path");
const async = require("async");
const present = require("present");

const client = require("./database.redis").client;
const redlock = require("./database.redis").redlock;
let api = require("./api");
const options = require('./options');

/** Schema:
 * order#id = All unique ids for orders
 * order:ID = order object (where ID is input)
 * order@FIELD = field index (where FIELD is input)
 */

function processOrder(data = {}) {
    data.key = data.account + ":" + data.orderId;
    // Lock database:
    redlock.lock((unlock) => {
        client.hgetall("order:" + data.key, (err, oldData) => {
            const exists = (oldData != null);
            let commands = client.multi();

            // Add order to db:
            commands.hmset("order:" + data.key, data); // We use orderId to overwrite older orders with the same ID (as if an update)

            if (exists) {
                for (const field of api.indexFields) {
                    if (oldData[field] !== null) {
                        commands.srem("order@" + field + ":" + oldData[field], data.key);
                    }
                }
            } else {
                commands.sadd("order#id", data.key);
            }

            // Index order:
            for (const field of api.indexFields) {
                if (data[field] !== null) {
                    commands.sadd("order@" + field + ":" + data[field], data.key);
                }
            }

            commands.exec((err) => {
                unlock(); // Unlock database
            });
        });
    });
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

        // Lock DB:
        redlock.lock((unlock) => {
            // Get total database count - scard(key, callback)
            client.scard("order#id", (err, totalOrders) => {
                // Store/Filter orders using unique id:
                const uniqueQueryId = "query:" + new Date().getTime() + "." + Math.floor(Math.random() * 1000000);

                if (filterObj != null && Object.keys(filterObj).length > 0) {
                    let commands = client.multi();
                    // Assumes startswith for now:
                    // TODO: For optimization, create a map for field values, to make the following op faster:
                    for (const field in filterObj) {
                        commands.keys("order@" + field + ":" + toIgnoreCasePattern(filterObj[field].value) + "*");
                    }

                    commands.exec((err, keysArray) => {
                        if (keysArray.some((keys) => { return keys.length <= 0; })) {
                            // Early termination of query if 0 results being returned:
                            // We know it is early termination since one of the indexes going into the AND stage is size 0
                            const message = {
                                start: start,
                                end: end,
                                totalCount: totalOrders,
                                filteredCount: 0,
                                data: []
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

                            // Unlock database
                            unlock(); 
                            return;
                        }
                        // Union the keys of the filters:
                        let uniqueQueryIds = [];
                        let commands = client.multi();

                        // Loop through each key and add it to the command queue:
                        for (let i = 0; i < keysArray.length; i += 1) {
                            if (keysArray[i].length > 0) { // Don't add keys with no characters
                                const uid = uniqueQueryId + "." + i;
                                uniqueQueryIds.push(uid);
                                keysArray[i].unshift(uid);
                                commands.sunionstore.apply(commands, keysArray[i]); // TODO: Optimize if one key?
                            }
                        }

                        commands.exec((err, counts) => {
                            // Delete temporary Redis keys:
                            let args = uniqueQueryIds.slice();
                            args.unshift(uniqueQueryId);
                            args.push(function (err, filteredCount) {
                                // Delete unioned keys:
                                // TODO: Merge the following with deleting uniqueQueryId, into one del command
                                let args = uniqueQueryIds.slice();
                                args.push(() => { sortOps(err, filteredCount); });
                                client.del.apply(client, args);
                            });

                            // Get the intersection and store the result in a set with id of uniqueQueryId - sinterstore(destination, [key]..., callback)
                            client.sinterstore.apply(client, args);
                        });
                    });
                } else {
                    // Skip if no filter:
                    client.sinterstore(uniqueQueryId, "order#id", sortOps);
                }

                function sortOps(err, filteredCount) {
                    // Sort result parameters:
                    let args = [uniqueQueryId, "BY", "order:*->" + sortBy, "LIMIT", start, Math.max(end - start, 0), sortDir];
                    if (api.fieldTypesMap.get(sortBy) === "String") args.push("ALPHA");

                    args.push((err, keys) => {
                        // Remove uniqueQueryId set - del(key, callback)
                        client.del(uniqueQueryId, (err) => {
                            let commands = client.multi();
                            // Get all orders assciated with key - hgetall(key)
                            keys.forEach((key) => { commands.hgetall("order:" + key); });

                            // Execute the queued commands
                            commands.exec((err, orders) => {
                                // Change fields that are numbers into a JSON number:
                                for (let order of orders) {
                                    for (const field in order) {
                                        const fieldType = api.fieldTypesMap.get(field);
                                        if (fieldType !== "String" && fieldType != null) {
                                            order[field] = Number(order[field]);
                                        }
                                    }
                                }

                                const message = {
                                    start: start,
                                    end: end,
                                    totalCount: totalOrders,
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

                                unlock(); // Unlock database

                                //If logging performance record end time and add entry
                                if (options.performanceData) { 
                                    debugArray.push(present());
                                    options.performanceData.performanceLog.push(debugArray);
                                }                                
                            });
                        });
                    });

                    // Sort(key,"BY",pattern,"LIMIT",offset, count,["GET",pattern]...,["ASC"|"DESC"],"ALPHA", "STORE", destination, callback)
                    client.sort.apply(client, args);
                }
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
        client.send_command("FLUSHDB", () => {
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

api.flushQueue = () => {
    redlock.flush();
};

function toIgnoreCasePattern(str){
    const chars = str.split('');
    const res = chars.map(c => {
        let toCase = c.toLowerCase();
        if (c !== toCase)
            return '[' + c + toCase + ']';
        
        toCase = c.toUpperCase();
        if (c !== toCase)
            return '[' + c + toCase + ']';
            
        return c;
    });
      
    return res.join('');
}