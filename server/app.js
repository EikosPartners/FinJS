const server = require('http').createServer();
const url = require('url');
const path = require('path');
const protobuf = require("protobufjs");
const express = require('express');
const engine = require('express-dot-engine');

const WebSocketServer = require('ws').Server;
const wss = new WebSocketServer({ server: server });
const app = express();
const port = 4080;
const api = require("./api/api");
const Response = require("./api/response");
const options = require("./api/options");

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.engine('dot', engine.__express);
app.set('views', path.join(__dirname, './public'));
app.set('view engine', 'dot');

app.get('/_settings', (req, res) => {
    if (options.isProduction){
        const msg = "Cannot change stream setting when running in production.";
        console.error(msg);
        res.json({ ok: false, message: msg });
        return;
    }

    console.log('\nStream settings updated:');
    for (const field in req.query) {
        switch (req.query[field]) {
            case "true": options[field] = true; break;
            case "false": options[field] = false; break;
            default: options[field] = Number(req.query[field]) || options[field];
        }
        console.log('- %s: %s', field, options[field]);
        
    }
    api.flushQueue();
    res.json({ ok: true });
});

app.get('/_reset', (req, res) => {
    api.repeatStreamer();
    res.json({ ok: true });

    console.log('\nStream restarted:');
    for (let opt in options)
        console.log('- %s: %s', opt, options[opt]);
});

app.get('/', (req, res) => {
    res.render('index', { 
        buildIntervalMs: options.buildIntervalMs,
        viewUpdateIntervalMs: options.viewUpdateIntervalMs,
        isOrdersMessageEncoded: options.isOrdersMessageEncoded,
    });
});

app.use(express.static('public'));

wss.on('connection', (ws) => {
    console.log('Connection Established:');
    console.log(ws.upgradeReq.headers);
    console.log('\n');

    const location = url.parse(ws.upgradeReq.url, true);
    // you might use location.query.access_token to authenticate or share sessions
    // or ws.upgradeReq.headers.cookie (see http://stackoverflow.com/a/16395220/151312)

    ws.isConnected = function () {
        return ws.readyState === ws.OPEN;
    };

    ws.on('message', (raw) => {
        let message;
        try {
            message = JSON.parse(raw);
        } catch (err) {
            return console.error("Error parsing message: %s", raw);
        }

        if (message && message.call) {
            //keep ping request as close to the "metal" as possible
            if (message.call === "ping"){
                ws.send("pong" + message.stamp);
                return;
            }
            
            //Process general message
            console.log('received: %s', raw);

            if (!api[message.call])
                return;
            let args = message.args || [];
            args.unshift(new Response(ws, message));
            api[message.call].apply(ws, args);
        }
    });

    ws.on('close', (status, clientMsg) => {
        console.log(`Client disconnected (${status}) with message: ${clientMsg}\n`);
        Response.closeLogging();
    });
});

server.on('request', app);
server.listen(port, () => {
    console.log(`Listening on ${server.address().port}\n`);
});