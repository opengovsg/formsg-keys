"use strict";

const { merge } = require("webpack-merge");

const common = require("./webpack.common.js");
const PATHS = require("./paths.js");

// Merge webpack configuration files
const config = merge(common, {
  entry: {
    app: PATHS.src + "/app.js",
    background: PATHS.src + "/background.js",
    content: PATHS.public + "/content.js",
  },
  devtool: false,
});

module.exports = config;
