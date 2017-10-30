const electron = require("electron");
const path = require("path");
const publicPath = path.join(__dirname, "../../public");

// Module to handle windows in windowfactory.
const wf = require(path.join(publicPath, "scalejs.windowfactory.js"));
// Module to control application life.
const app = electron.app;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
var mainWindow;

function createWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 600,
        height: 80,
        minWidth: 400,
        minHeight: 80,
        maxWidth: 600,
        maxHeight: 80,
        frame: false,
        resizable: true,
        hasShadow: false,
        icon: path.join(__dirname, "favicon.ico"),
        webPreferences: {
            nodeIntegration: false,
            preload: path.join(publicPath, "scalejs.windowfactory.js")
        }
        //transparent: true
    });

    // Open the DevTools.
    //mainWindow.webContents.openDevTools();

    //Determine the endpoint
    const epArg = process.argv.find(arg => arg.indexOf("--endpoint") >= 0);
    const ep = epArg 
        ? epArg.substr(epArg.indexOf("=") + 1) 
        : require(path.join(publicPath, "prodConfig.json")).endpoint;

    // and load the index.html of the app.
    mainWindow.loadURL(ep);

    // Emitted when the window is closed.
    mainWindow.on("closed", function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
        app.quit();
    });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed.
app.on("window-all-closed", function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow();
    }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.