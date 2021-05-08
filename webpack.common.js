const path = require("path");

const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const ConfigParser = require('wirecloud-config-parser');
const parser = new ConfigParser('src/config.xml');
const metadata = parser.getData();

module.exports = {
    context: __dirname,
    entry: './src/js/main.js',
    output: {
        path: path.resolve(__dirname, 'build/js'),
        libraryTarget: 'umd',
        filename: 'main.js',
        chunkFilename: '[name].bundle.js',
        publicPath: '/showcase/media/' + metadata.vendor + '/' + metadata.name + '/' + metadata.version + '/js/',
    },
    module: {
        rules: [
            {
                test: /\.js/,
                exclude: /node_modules/,
                use: ['babel-loader']
            },
            {
                test: /\.css$/,
                include: [
                    path.resolve(__dirname, 'src/css'),
                    path.resolve(__dirname, 'node_modules/maplibre-gl/dist/'),
                ],
                use: [MiniCssExtractPlugin.loader, 'css-loader'],
            },
            {
                test: /\.(png|svg|jpg|gif)$/,
                use: {
                    loader: 'url-loader',
                    options: {
                        name: './dist/img/icon/[name].[ext]',
                    },
                },
            },
        ]
    },
    plugins: [
        new CopyWebpackPlugin({
            patterns: [
                { context: '', from: 'LICENSE', to: path.resolve(__dirname, 'build') },
                { context: 'src', from: '*', to: path.resolve(__dirname, 'build') },
                { context: 'src', from: 'doc/*', to: path.resolve(__dirname, 'build') },
                { context: 'src', from: 'images/*', to: path.resolve(__dirname, 'build') },
                { context: 'src', from: 'map/*', to: path.resolve(__dirname, 'build') },
                { context: 'src/contrib', from: 'gsi/*', to: path.resolve(__dirname, 'build/map') },
            ]
        }),
        new MiniCssExtractPlugin({
            filename: '../css/style.css',
        }),
    ]
}
