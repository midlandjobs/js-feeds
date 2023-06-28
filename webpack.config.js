const TerserPlugin = require('terser-webpack-plugin');
const webpack = require('webpack');

module.exports = {
  
  optimization: {
    minimizer: [new TerserPlugin({
      extractComments: false,
    })],
  },
  
  // remove file size warnings from webpack, sets new limit
  performance: {
    hints: false,
    maxEntrypointSize: 512000,
    maxAssetSize: 512000
  },

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
    // Work around for Buffer is undefined:
    // https://github.com/webpack/changelog-v5/issues/10
    new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
    }),
    new webpack.ProvidePlugin({
        process: 'process/browser',
    }),
  ],
    
  // sets mode to miniied production output, the entry file and the path & filename to output file
  mode: "production",
  entry: {
    main: './index.js',
  },
  output: {
    filename: '[name].js',
    path: __dirname,
  },

  resolve: {
    fallback: {
        "crypto": require.resolve("crypto-browserify"),
        "buffer": require.resolve("buffer/"),
        "util": require.resolve("util/"),
        "path": require.resolve("path-browserify"),
        "stream": require.resolve("stream-browserify")
    },
  },
    
};