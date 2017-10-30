var path = require('path');
// var favicon = require('serve-favicon');
// var logger = require('morgan');
// var cookieParser = require('cookie-parser');
// var bodyParser = require('body-parser');
var http = require('http');
var pjsonLoader = require('pjson-loader');
var parseRole = require('ep-utils/parseRole');
var opensesameProfile = require('opensesame-profile');
var socket = require('socket.io');
var watchpack = require('watchpack');
var fsw = require('ep-utils/fsWrapper');
var fs = require('fs');
var useragent = require('express-useragent');
var archiver = require('archiver');
var packageJSON = require('./package.json');

const electronRetrieve = require('./electron/electronRetrieve');

var routes = require('./server/routes/index');
// var build = require('./server/routes/build');
// var users = require('./server/routes/users');

var express = require('express');
var app = express();

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use(useragent.express());
app.use(express.static('public'));

//Wire for serving install.html without authentication
app.get('/install', function(req, res, next){
    res.sendFile('install.html', { root: 'public' });
});

//Wire for service app.json without authentication
app.get('/app.json', function(req, res, next) {
    fs.readFile('./public/src/app.json', 'utf8', function(err, data) {
        //Set the json to reference ipaddress and send it back
        let json = data;
        json = json.replace(/localhost:3000/gi, req.headers.host);
        json = json.replace(/localhost/gi, req.headers.host.replace(/:3000/, ''));
        res.setHeader('Content-type', 'application/json');
        res.send(json);
    });
});

// Wire service for generating Electron install:
app.get('/install/electron', function(req, res, next) {
    const agent = req.useragent;
    let ext;

    if (req.query.windows != null)
        ext = "exe";
    else if (req.query.linux != null)
        ext = "AppImage";
    else if (req.query.macos != null)
        ext = "dmg";
    else if (agent.isWindows)
        ext = "exe";
    else if (agent.isLinux || agent.isLinux64)
        ext = "AppImage";
    else if (agent.isMac)
        ext = "dmg";
    
    if (!ext){
        res.status(404).send("Not found");
        return;
    }

    electronRetrieve(ext)
        .then(e =>{
            res.setHeader('Content-type', e.mimeType);
            res.setHeader('Content-Disposition', `attachment; filename="${e.fileName}"`);
            res.send(e.data);
        })
        .catch(error => {
            console.error(error);
            res.status(404).send("Not found");            
        });
});

/*
opensesameProfile({
    secret: 'testSecret',
    httpsOnly: false,
    middleware: function (req, res, next) {
        if(req.url.startsWith('/profile')) {
            if(req.user.roles.indexOf('admin') !== -1) {
                return next();
            } else {
                return res.status(401).end();
            }
        } else {
            next();
        }
    }
}, app);
*/
// view engine setup

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
// app.use(logger('dev'));
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(cookieParser());
app.use(require('./server/transform.js')());
// app.use(express.static(path.join(__dirname, 'public')));

// app.use('/', routes);
// app.use('/build', build);
// app.use('/users', users);

// catch 404 and forward to error handler
// app.use(function (req, res, next) {
//     var err = new Error('Not Found');
//     err.status = 404;
//     next(err);
// });

// pjson setup.
pjsonLoader.load(app, {
    jsonTransform : function (req, res, data) {
        // Parse data to remove routes the user does not have access to.
        //return parseRole.parse(data, req.user.roles);
        return data;
    }
}, function (err) {
    if (err) {
        console.log(err);
    }
});

var moduleLoaderPath = path.join(__dirname, './public/src/moduleLoader.js');

function touchModuleLoader() {
    fs.readFile(moduleLoaderPath, 'utf8', function(err, data) {
        fs.appendFile(moduleLoaderPath, '//', function (err) {
            //need to wait some time before restoring because watchpack isn't instant
            setTimeout(function () {
                fs.writeFile(moduleLoaderPath, data, function(err) {
                    if(err) {
                        console.log('error writing to module loader');
                    } else {
                        console.log('successfully touched moduleLoader');
                    }
                });
            }, 1100);
        });
    });
}

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    var bundler = require('./server/bundler.js');

    bundler(app);

    app.use('/', routes);

    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });

    var server = http.createServer(app);

    var io = socket(server);

    var wp = new watchpack({
        aggregateTeimout: 1000,
        poll: true
    });

    wp.on('change', function (file) {
        var filename = file.replace(/^.*[\\\/]/, '');
        io.emit('pjsonUpdate', {
            file: filename
        });
        if(filename === 'users.json') {
            touchModuleLoader();
        }
    });

    wp.watch([path.join(__dirname, 'users.json')], [path.join(__dirname, 'server/pjson/')]);

    server.listen(process.env.PORT || 3000, function() {
        console.log("Listening on %j", server.address());
    });
}



// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
