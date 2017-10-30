var argv = require('minimist')(process.argv.slice(2));
var path = require('path');
var fs = require('fs');
var rimraf = require('rimraf');
var ncp = require('ncp');

let moduleTemplate = `    %MODULE%: function (done) {
        require.ensure([], function (require) {
            require('./modules/%MODULE%/%ENTRYPOINT%');
            done();
        });
    },
`;

let moduleListMarker = 'let resolveModuleLookup = {';

let deployModule = argv['_'][0];
console.log(argv);
let entryPoint = argv['entry-point'];

if(!deployModule) {
  console.error('Please specify a module');
  process.exit(1);
}

if(!entryPoint) {
  console.error('Please specify an entry point with the --entry-point commandline argument');
  process.exit(1);
}

console.log('Deploying module: ' + deployModule);
// delete server/pjson/pages/<module>.json
try {
  fs.unlinkSync(path.join(__dirname, './server/pjson/pages/' + deployModule + '.json'));
} catch(ex) {}
// copy modules/<module>.json to server/pjson/pages
fs.createReadStream(path.join(__dirname, './modules/' + deployModule + '.json'))
  .pipe(fs.createWriteStream(path.join(__dirname, './server/pjson/pages/' + deployModule + '.json')));
// delete directory public/src/app/<module>
rimraf.sync(path.join(__dirname, './public/src/modules/' + deployModule));
// copy modules/<module> folder to public/src/modules/
ncp(path.join(__dirname, './modules/' + deployModule), path.join(__dirname, './public/src/modules/' + deployModule), (err) => {
  if (err) {
   return console.error('ncp:', err);
 }
 console.log(deployModule + ' done!');
});

// updating the moduleLoader to include the latest deployed module
{
  var moduleLoader = fs.readFileSync(path.join(__dirname, 'public/src/moduleLoader.js'), 'utf8');
  let moduleListMarkerIndex = moduleLoader.indexOf(moduleListMarker);
  let checkModuleExistsIndex = moduleLoader.indexOf(deployModule + ': function (done) {');
  if(moduleListMarkerIndex > -1 && checkModuleExistsIndex === -1) {
    let indexToInsert = moduleListMarkerIndex + moduleListMarker.length + 1; //add 1 for newline
    let updatedModuleLoader = moduleLoader.slice(0, indexToInsert) + moduleTemplate.replace(/%MODULE%/g, deployModule).replace('%ENTRYPOINT%', entryPoint) + moduleLoader.slice(indexToInsert);
    fs.writeFileSync(path.join(__dirname, 'public/src/moduleLoader.js'), updatedModuleLoader);
    console.log('Updated module loader with module ' + deployModule + '!');
  } else {
    console.error('Unable to insert module ' + deployModule + ' into module loader!');
  }
}


// update the header.jso file to include the latest module, security assumed for the moment, this needs to be generated on the fly.
/*
{
  let moduleTemplate = `    %MODULE%: function (done) {
        require.ensure([], function (require) {
            require('./modules/%MODULE%/%ENTRYPOINT%');
            done();
        });
    },
`;

let moduleListMarker = 'let resolveModuleLookup = {';

  var moduleLoader = fs.readFileSync(path.join(__dirname, 'server/pjson/pages/header.json'), 'utf8');
  let moduleListMarkerIndex = moduleLoader.indexOf(moduleListMarker);
  let checkModuleExistsIndex = moduleLoader.indexOf(deployModule + ': function (done) {');
  if(moduleListMarkerIndex > -1 && checkModuleExistsIndex === -1) {
    let indexToInsert = moduleListMarkerIndex + moduleListMarker.length + 1; //add 1 for newline
    let updatedModuleLoader = moduleLoader.slice(0, indexToInsert) + moduleTemplate.replace(/%MODULE%/g, deployModule).replace('%ENTRYPOINT%', entryPoint) + moduleLoader.slice(indexToInsert);
    fs.writeFileSync(path.join(__dirname, 'public/src/moduleLoader.js'), updatedModuleLoader);
    console.log('Updated module loader with module ' + deployModule + '!');
  } else {
    console.error('Unable to insert module ' + deployModule + ' into module loader!');
  }
}
*/
