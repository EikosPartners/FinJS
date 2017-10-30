/* eslint global-require:"off" */
// Karma configuration
// Generated on Thu Jun 09 2016 08:51:10 GMT-0400 (EDT)
const baseConfig = require('./karma.config.base.js'),
    path = require('path');

// Add in the istanbul-instrumenter so we can do code coverage on the transpiled files.
baseConfig.webpack.module.postLoaders = [
    {
        test: /\.js$/,
        include: [
            path.join(__dirname, '../../public/src/'),
            path.join(__dirname, '../../test/tests/'),
            path.join(__dirname, '../../node_modules/datatables-epresponsive/dist/'),
            path.join(__dirname, '../../node_modules/ko-bindings/dist/'),
            path.join(__dirname, '../../node_modules/scalejs.ajax-jquery/dist/'),
            path.join(__dirname, '../../node_modules/scalejs.expression-jsep/dist/'),
            path.join(__dirname, '../../node_modules/scalejs.inputmask/dist/'),
            path.join(__dirname, '../../node_modules/scalejs.messagebus/dist/'),
            path.join(__dirname, '../../node_modules/scalejs.metadataFactory/dist/'),
            path.join(__dirname, '../../node_modules/scalejs.mvvm/dist/'),
            path.join(__dirname, '../../node_modules/scalejs.navigation/dist/'),
            path.join(__dirname, '../../node_modules/scalejs.noticeboard/dist/'),
            path.join(__dirname, '../../node_modules/scalejs.popup/dist/')
        ],
        loader: 'istanbul-instrumenter'
    }
];

module.exports = function (config) {
    baseConfig.logLevel = config.LOG_INFO;
    baseConfig.reporters.push('coverage');
    baseConfig.coverageReporter = {
        dir: 'test/coverage',
        type: 'html'
    };
    baseConfig.plugins.push(require('karma-coverage'));

    config.set(baseConfig);
};