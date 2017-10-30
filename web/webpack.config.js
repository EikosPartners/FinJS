var path = require('path');
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
    context: path.join(__dirname, 'public'),
    entry: {
        webpack: 'webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000',
        app: [path.resolve(__dirname, 'public/src/app/app.js'),'webpack-hot-middleware/client?path=/__webpack_hmr'] // entry point location to app
    },
    resolve: {
        root: [__dirname, path.join(__dirname, 'public/src/')],
        alias: {
            // scalejs
            'scalejs.application': path.join(__dirname, 'node_modules/scalejs/dist/scalejs.application.js'),
            'scalejs.core': path.join(__dirname, 'node_modules/scalejs/dist/scalejs.core.js'),
            'scalejs.sandbox': path.join(__dirname, 'node_modules/scalejs/dist/scalejs.sandbox.js'),

            // extensions
            'scalejs.extensions': path.join(__dirname, 'public/src/extensions/scalejs.extensions.js'),
            'dataservice': 'extensions/dataservice',
            'dbService': 'extensions/dbService',
            'slickCore': 'extensions/slick.core',
            'jqueryEventDragWrapper': 'extensions/jqueryEventDragWrapper',
            'jqueryEventDrag': path.join(__dirname, 'node_modules/jquery.event.drag/jquery.event.drag.js'),
            'jquery-ui/autocomplete':  path.join(__dirname, 'node_modules/jquery-ui/ui/widgets/autocomplete.js'),
            'jquerymousewheel':  path.join(__dirname, 'node_modules/jquery-mousewheel/jquery.mousewheel.js')
        }
    },
    output: {
        path: __dirname,
        publicPath: '/build/',
        filename: '[name].bundle.js'
    },
    resolveLoader: {
        alias: {
            'hot-loader': path.join(__dirname, 'public/loaders/hot-loader')
        }
    },
    module: {
        preLoaders: [
            {
                test: /\.scss/, loader: 'sass-global-vars-loader'
            },
            {
                test: [
                    /Module\.js$/
                ],
                loader: 'hot-loader'
            },
            {
                test: [
                    path.join(__dirname, 'node_modules/scalejs'),
                    path.join(__dirname, 'node_modules/datatables-epresponsive')
                ],
                loader: 'source-map-loader'
            }
        ],
        loaders: [
            {
                loader: 'babel-loader',
                test: [
                    path.join(__dirname, 'public/src'),
                    path.join(__dirname, 'test')
                ],
                exclude: /\.html?$/,
                query: {
                  presets: 'es2015',
                }
            },
            {
                test: /\.html$/,
                loader: 'html-loader'
            },
            {
                test: /\.scss$/,
                loader: 'style-loader!css-loader!autoprefixer-loader!sass-loader'
            },
            {
                test: /\.css$/,
                exclude: /doTjs.template.css/,
                loader: 'style-loader!css-loader!autoprefixer-loader',
            },
            {
                test: /doTjs.template.css/,
                loader: 'css-loader!autoprefixer-loader',
            },
            {
                test: /\.woff|\.woff2|\.svg|.eot|\.png|\.jpg|\.ttf/,
                loader: 'url?prefix=font/&limit=10000'
            },
            {
                test: /slick.core/,
                loader: 'imports?jQuery=jquery,$=jquery,this=>window'
            },
            {
                test: /slick.grid.js/,
                loader: 'exports?Slick!imports?slickCore,jQuery=jquery,$=jquery,jqueryEventDragWrapper,jquerymousewheel,this=>window'
            },
            {
                test: /slick.dataview.js/,
                loader: 'imports?jQuery=jquery,$=jquery,this=>window'
            }
        ]
    },
    plugins: [
        // Avoid publishing files when compilation fails
        // new webpack.optimize.CommonsChunkPlugin( {
        //     name: "commons",
        //     filename: "commons.js",
        //     chunks: ["app", "moduleLoader"]
        // }),
        new webpack.optimize.OccurenceOrderPlugin(),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoErrorsPlugin(),
        //new ExtractTextPlugin('main.css') // TODO: move to production config
    ],
    // Create Sourcemaps for the bundle
    devtool: 'source-map'
};
