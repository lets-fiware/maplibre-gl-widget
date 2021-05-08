const path = require("path");

const { merge } = require('webpack-merge');
const commonConfig = require('./webpack.common.js');

module.exports = merge(commonConfig, {
    mode: 'development',
    devtool: 'source-map',
    devServer: {
        contentBase: path.join(__dirname, 'build'),
        publicPath: '/js/',
        hot: true,
        open: false,
        host: '0.0.0.0',
        port: 8080,
        watchContentBase: true,
        inline: true
    }
});
