const path = require("path");
const ConfigParser = require('wirecloud-config-parser');
const parser = new ConfigParser('src/config.xml');
const metadata = parser.getData();

module.exports = {
  mode: 'development',
  entry: {
      app: ['@babel/polyfill', './src/js/main.js']
  },
  devtool: 'source-map',
  output: {
      path: path.resolve(__dirname, 'build/js'),
      libraryTarget: 'umd',
      filename: 'main.js',
      chunkFilename: '[name].bundle.js',
      publicPath: '/showcase/media/' + metadata.vendor +'/' + metadata.name + '/' + metadata.version + '/js/',
  },
  module: {
      rules: [
          {
              test: /\.js/,
              exclude: /node_modules/,
              use: [
                  'babel-loader'
              ]
          },
          {
              test: /\.css$/,
              use: [
                  'style-loader',
                  {
                      loader: 'css-loader',
                  },
              ],
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
  devServer: {
    contentBase: path.join(__dirname, 'build'),
    publicPath: '/js/',
    hot: true,
    open: false,
    host: '0.0.0.0',
    port: 8080,
    watchContentBase: true,
    inline: true,
    hot: true
  }
}
