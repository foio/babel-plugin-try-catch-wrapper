/**
 * Created by kellanzhang on 2017/3/10.
 */
const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');
const path = require('path');

module.exports = {
    target: 'node',
    cache: false,
    context: __dirname,
    debug: false,
    devtool: 'inline-source-map',
    entry: ['./test/index.js'],
    output: {
        path: path.join(__dirname, './test'),
        filename: 'release.js'
    },
    plugins: [
        new webpack.DefinePlugin({
            __CLIENT__: false,
            __SERVER__: true,
            __PRODUCTION__: true,
            __DEV__: false
        })
    ],
    module: {
        loaders: [{
            test: /\.js|\.jsx$/,
            loader: ['babel-loader'],
            query: {
                babelrc: false,
                plugins: [
                    'transform-decorators-legacy'
                ],
                presets: [
                    'node6',
                    'stage-0',
                    'react'
                ],
            },
            exclude: /node_modules/
        }],
        postLoaders: [],
        noParse: /\.min\.js/
    },
    externals: [
        nodeExternals()
    ],
    resolve: {
        modulesDirectories: [
            'node_modules'
        ],
        extensions: ['', '.json', '.js', '.jsx']
    },
    node: {
        __dirname: true,
        fs: 'empty'
    }
};
