const { merge } = require('webpack-merge');
const path = require('path');
const baseConfig = require('./webpack.config.base.js');

module.exports = merge(baseConfig, {
  mode: 'production',

  devtool: false,
});
