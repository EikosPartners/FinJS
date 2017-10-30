//Run with npm commmand line to generate the install for the current OS
const builder = require("electron-builder");
const packagejson = require("../package.json");

//Development package.json, see https://goo.gl/5jVxoO
const devMetadata  = packagejson.electronBuilder;

//Application package.json
const appMetadata = {
    name: packagejson.name,
    version: packagejson.version,
    description: packagejson.description,
    author: packagejson.author
};

//Main function - returns a Promise with an object of file arguments
new Promise((resolve, reject) => {
    builder
        .build({ projectDir: "./", devMetadata, appMetadata })
        .then(args => {
            const filePath = args[0];
            const fileName = filePath.substr(filePath.replace(/\\/g,"/").lastIndexOf("/") + 1);
            resolve({fileName, filePath});

        }).catch((error) => {
            reject(error);
        });
})
.then(e =>console.log(`Completed build of file '${e.filePath}'`))
.catch(error => console.error(error));
