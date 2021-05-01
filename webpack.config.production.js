const path = require("path");
const ConfigParser = require('wirecloud-config-parser');
const parser = new ConfigParser('src/config.xml');
const metadata = parser.getData();

module.exports = {
  mode: 'production',
  entry: './src/js/main.js',
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
  }
}
