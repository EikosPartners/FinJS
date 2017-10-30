const options = require("./options");

//See if file logging message
let logStream;
if (options.isMessageFileLogEnabled)
    logStream = options.messageFileLogStream;

function Response(socket, request) {
    this.socket = socket;
    this.request = request;
}

Response.prototype.sendAsJSON = function () {
    if (this.socket.isConnected()) {
        const json = JSON.stringify({
                id: this.request.id,
                args: Array.from(arguments)
            });

        this.socket.send(json);

        if (logStream)
            logStream.write(json + "\n");
    }
};

Response.prototype.sendEncoded = function () {
    const encoderType = arguments[0]; 
    const msg = {
        id: this.request.id,
        args:  Array.from(arguments).slice(1)
    };

    const encodedMsg = encoderType.create(msg);
    const buffer = encoderType.encode(encodedMsg).finish();

    if (this.socket.isConnected()) {
        this.socket.send(buffer);

        if (logStream)
            logStream.write(buffer + "\n");
    }
};

Response.closeLogging = function () {
    if (logStream)
        logStream.end();
};

module.exports = Response;