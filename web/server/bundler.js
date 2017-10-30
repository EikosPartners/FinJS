var webpack = require('webpack');
var webpackConfig = require('./../webpack.config.js');
var path = require('path');
var fs = require('fs');

module.exports = function (app) {
    var bundleStart = null;
    var compiler = webpack(webpackConfig);

    compiler.plugin('compile', function() {
        bundleStart = Date.now();
        console.log('building... ',bundleStart);
    });

    compiler.plugin('done', function () {
        console.log('building complete in ', Date.now() - bundleStart);
    });

    app.use(require("webpack-dev-middleware")(compiler, {
        publicPath: webpackConfig.output.publicPath,
        hot: true,
        quiet: false,
        noInfo: false,
        stats: {
            colors: true
        }
    }));

    app.use(require("webpack-hot-middleware")(compiler,  {
        log: console.log, path: '/__webpack_hmr', heartbeat: 10 * 1000
    }));
};
