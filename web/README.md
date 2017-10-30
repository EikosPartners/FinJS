# OpenFin/Web to Node.js Demo 

This project contains a node.js web server to provide HTML and JavaScript content for the OpenFin, Electron and Web versions of the Client UI.

## Installation

* Install  [node](https://nodejs.org) (this was written in version 6.x)
* run `npm install`

## Usage in Browser

* To start the web app in VS Code open this folder (/web) and start debugging.  Or manually run in the directory with `npm start`
* Navigate to [http://localhost:3000](http://localhost:3000)
* Open console to see Application Started
* Make sure to have Source Maps enabled in browser!

## Usage in OpenFin

* To start the web app in VS Code open this folder (/web) and start debugging.  Or manually run in the directory with `npm start`.
* Navigate to the [http://localhost:3000/install](http://localhost:3000/install)
* Click Download to download the zip file, open the file, and double click on 'openfin-installer.exe' 
* The application will start and a shortcut icon will be placed on your desktop

## Usage in Electron

* To start the web app in VS Code open this folder (/web) and start debugging.  Or manually run in the directory with `npm start`.
* To run Electron in debug mode enter `npm run electron` in this folder.
* To complie Electon into a distribution package and installer for your current OS (Windows, Mac or Linux) enter `npm run electron-build` and check /electron/output.

## Production Build
* Run `npm run build`
* Source files will be written to public/build

## Deploying a module
* Your module must be in the `modules` folder.
* To deploy a module named `module1` with an entry point called `Module.js` run `npm run deploy -- module1 --entry-point Module.js`. Note the `--` before the commandline arguments
