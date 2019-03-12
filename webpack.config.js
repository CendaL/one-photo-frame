const path = require("path");
const webpack = require("webpack");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const VueLoaderPlugin = require("vue-loader/lib/plugin");

const outputPath = path.resolve(__dirname, "./dist");
const now = new Date();
const version =
  now.getFullYear() +
  ("0" + (now.getMonth() + 1)).slice(-2) +
  ("0" + now.getDate()).slice(-2) +
  ("0" + now.getHours()).slice(-2) +
  ("0" + now.getMinutes()).slice(-2);

var config = {
  entry: path.resolve(__dirname, "./src/App.js"),
  output: {
    path: outputPath,
    publicPath: "/dist/",
    filename: "build.js"
  },
  plugins: [new VueLoaderPlugin()],
  module: {
    rules: [
      { test: /\.vue$/, use: ["vue-loader"] },
      { test: /\.js$/, use: ["babel-loader"], exclude: /node_modules/ },
      { test: /\.css$/, use: ["vue-style-loader", "css-loader"] },
      { test: /\.(png|jpg|gif|svg)$/, loader: "file-loader", options: { name: "[name].[ext]?[hash]" } }
    ]
  },
  resolve: { alias: { vue$: "vue/dist/vue.esm.js" } },
  devServer: { historyApiFallback: true },
  performance: { hints: false },
  devtool: "eval-source-map",
  stats: "minimal"
};

module.exports = (env, argv) => {
  config.mode = argv.mode;
  const isProd = config.mode === "production";

  config.plugins = config.plugins.concat([
    new webpack.DefinePlugin({
      MSAL_REDIRECT_URL: isProd ? '"https://one-photo-frame.azurewebsites.net/"' : '"http://localhost:8080/"',
      VERSION: isProd ? `${version}` : "999999999999",
      IS_PROD: isProd ? "true" : "false",
      "process.env": isProd ? { NODE_ENV: '"production"' } : {}
    })
  ]);

  if (isProd) {
    console.log(`Building version ${version}\n`);
    config.devtool = "source-map";
    config.plugins = config.plugins.concat([
      new CopyWebpackPlugin([
        {
          from: path.resolve(__dirname, "./index.html"),
          to: outputPath,
          transform: (content, path) => {
            return content.toString().replace("/dist/build.js", "build.js");
          }
        }
      ])
    ]);
  } else {
    console.log(`Building dev version\n`);
  }

  return config;
};
