'use strict';

const path = require('path');
const webpack = require('webpack');
const config = require('./config');
const ManifestPlugin = require('webpack-manifest-plugin');

const webpackConfig = {
    entry: [
        path.join(__dirname, 'public/js/app.js')
    ],
    output: {
        path: path.join(__dirname, config.publicDir),
        publicPath: config.publicDir + '/',
        filename: 'js/app.js'
    },
    module: {
        rules: [
            {
                test: /\.vue$/,
                loader: 'vue-loader',
                options: {
                    loaders: {
                        scss: 'vue-style-loader!css-loader!sass-loader',
                        js: 'babel-loader?presets[]=es2015'
                    }
                }
            },
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                loader: 'babel-loader',
                query: {
                    presets: ['es2015']
                }
            },
            {
                test: /\.(png|jpg|gif|svg|woff2)$/,
                loader: 'file-loader',
                options: {
                    context: 'public/',
                    name: '[path][name].[ext]'
                }
            }
        ]
    },
    plugins: [
        new ManifestPlugin({
            fileName: 'assets-manifest.json',
            publicPath: config.publicDir + '/'
        })
    ]
};

if (config.webpack.hot) {
    // Push entry to beginning of list.
    webpackConfig.entry.unshift('webpack-hot-middleware/client?reload=true');
    webpackConfig.plugins.push(new webpack.HotModuleReplacementPlugin());
}

if (config.isProduction()) {
    webpackConfig.plugins.push(new webpack.DefinePlugin({
        'process.env': {
            NODE_ENV: '"production"'
        }
    }));
    webpackConfig.plugins.push(new webpack.optimize.UglifyJsPlugin({
        compress: {
            warnings: false
        }
    }));
}

module.exports = webpackConfig;
