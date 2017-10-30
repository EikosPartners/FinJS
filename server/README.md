# Node.js Server for FinJS Demo
This is the mock data middle/backend for the FinJS demo application.  It provides randomized data over websocket connections.  It can be connected to via the OpenFin, Electron, Web Browser, or WPF versions of the client application. 

## How to Setup
1. Install latest [Nodejs](https://nodejs.org/en/) (this was built in 6.x).

2. Install npm packages in this directory:
```bash
npm install
```
3. Install the latest version of [MongoDB](https://www.mongodb.com).  There is also the option to use redis by editing `api.js`, however, MongoDB performances better. 

## How to Run
1. Start MongoDB if it is not set to automatically run (in Windows run the mongo.bat file). 

2. To start the server in VS Code open this folder (/server) and start debugging.  Or manually run in the directory with:
```bash
npm start
```
