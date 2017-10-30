/* eslint global-require:"off" */
const webpackConfig = require('../../webpack.config');
var path = require('path');

webpackConfig.entry = {};
webpackConfig.devtool = 'inline-source-map';

module.exports = {
    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '../../',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['mocha-debug', 'mocha', 'chai-as-promised', 'chai'],

    // list of files / patterns to load in the browser
    files: [
        // karma creates a bundle for every file here
        // to avoid having multiple bundles for our tests
        // all specs get imported from allTheTests.js
        'test/karma_config/test-main.js',
        'test/tests/allTheTests.js'
    ],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    // Entry point of the app. Redefine in karma config
    preprocessors: {
        'test/**/*.js': ['webpack', 'sourcemap'],
        'public/src/**/*.js': ['webpack', 'sourcemap']
    },

    // list of files to exclude
    exclude: [
    ],

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],


    // web server port
    port: 9004,


    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['PhantomJS'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true,

    // Inject webpack config
    webpack: webpackConfig,
    webpackMiddleware: { noInfo: true },

    // plugins: [
    //     require('karma-webpack'),
    //     require('karma-mocha'),
    //     require('karma-mocha-debug'),
    //     require('karma-chai'),
    //     require('karma-chai-as-promised'),
    //     require('karma-phantomjs-launcher'),
    //     require('karma-sourcemap-loader')
    // ]
};