const path = require('path');
const fs = require('fs');
const packagejson = require("../package.json");

//Currently supported mime types
const mimes = new Map();
mimes.set("exe",  "exe");
mimes.set("dmg", "dmg");
mimes.set("AppImage", "x-executable");

function findFileByExt(fileExt){
    const folderPath = packagejson.electronBuilder.directories.output;
    const files = fs.readdirSync(folderPath);

    for (let i = 0; i < files.length; i++) {
        const filePath = path.join(folderPath, files[i]);
        const stat = fs.lstatSync(filePath);

        if (!stat.isDirectory() && path.extname(filePath) === `.${fileExt}` )
            return filePath;
    }
}

function getPlatformPromise(fileExt){
    return new Promise((resolve, reject) => {
        const filePath = findFileByExt(fileExt);

        fs.readFile(filePath, (err, data) => {
            if (err) reject(err);
            
            const mimeType = mimes.get(fileExt);
            if (!mimeType) reject(`Unsupported file extension ${fileExt}`);
            
            resolve({ fileName: path.win32.basename(filePath), mimeType, data });
        });
    }).catch((error) => {
        console.error(error);
    });
}

module.exports = getPlatformPromise;