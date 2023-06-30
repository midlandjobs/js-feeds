const TerserPlugin = require('terser-webpack-plugin');
const webpack = require('webpack');

module.exports = {

  resolve: {
    fallback: {
      "crypto": require.resolve("crypto-browserify"),
      "buffer": require.resolve("buffer/"),
      "util": require.resolve("util/"),
      "path": require.resolve("path-browserify"),
      "stream": require.resolve("stream-browserify")
    },
  },
  
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin({
      extractComments: false,
    })],
  },
  
  performance: {
    // remove file size warnings from webpack, sets new limit
    hints: false,
    maxEntrypointSize: 512000,
    maxAssetSize: 512000
  },

  mode: "production", // sets mode to miniied production output, the entry file and the path & filename to output file

  module: {
    rules: [
      {
        test: /\.twig/,
        type: 'asset/source',
      },
      {
        test: /\.templates\/twig/,
        type: 'asset/source',
      },
      {
        test: /\.templates\/parts\/twig/,
        type: 'asset/source',
      }
    ]
  },

  plugins: [
    // Work around for Buffer is undefined: https://github.com/webpack/changelog-v5/issues/10
    new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
    }),
    new webpack.ProvidePlugin({
        process: 'process/browser',
    }),
  ],
  
  
  entry: {
    main: './src/js/src/index.js',
  },
  
  output: {
    filename: '[name].js',
    path: __dirname + '/src/js',
  },
    
};