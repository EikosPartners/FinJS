const bluebird = require("bluebird");
const redis = require("redis");
bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);
const client = redis.createClient(6379,"192.168.1.52");
let locked = false;
let lockQueue = [];

function nextLock() {
    if (locked) return;
    const callback = lockQueue.shift();
    if (callback == null) return;
    locked = true;
    // TODO: Timeout for lock?
    return callback(exports.redlock.unlock);
}

exports.client = client;
exports.redlock = {
    lock: (callback) => {
        lockQueue.push(callback);
        nextLock();
    },
    unlock: () => {
        locked = false;
        nextLock();
    },
    flush: () =>{
        lockQueue = [];
        locked = false;
    },
    isLocked: () => { return locked; }
};