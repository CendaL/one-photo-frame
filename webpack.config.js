const path = require("path");
const webpack = require("webpack");
const CopyWebpackPlugin = require("copy-webpack-plugin");

const outputPath = path.resolve(__dirname, "./dist");
const isProd = process.env.NODE_ENV === "production";

module.exports = {
  entry: path.resolve(__dirname, "./src/Shell.js"),
  output: {
    path: outputPath,
    publicPath: "/dist/",
    filename: "build.js"
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: "vue-loader",
        options: {
          loaders: {}
          // other vue-loader options go here
        }
      },
      {
        test: /\.js$/,
        loader: "babel-loader",
        exclude: /node_modules/
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        loader: "file-loader",
        options: {
          name: "[name].[ext]?[hash]"
        }
      }
    ]
  },
  resolve: {
    alias: {
      vue$: "vue/dist/vue.esm.js"
    }
  },
  devServer: {
    historyApiFallback: true,
    noInfo: true
  },
  performance: {
    hints: false
  },
  devtool: "#eval-source-map",
  plugins: [
    new webpack.DefinePlugin({
      MSAL_REDIRECT_URL: isProd ? '"https://one-photo-frame.azurewebsites.net/"' : '"http://localhost:8080/"',
      "process.env": isProd
        ? {
            NODE_ENV: '"production"'
          }
        : ""
    })
  ]
};

if (isProd) {
  module.exports.devtool = "#source-map";
  // http://vue-loader.vuejs.org/en/workflow/production.html
  module.exports.plugins = (module.exports.plugins || []).concat([
    new webpack.optimize.UglifyJsPlugin({
      sourceMap: true,
      compress: {
        warnings: false
      }
    }),
    new webpack.LoaderOptionsPlugin({
      minimize: true
    }),
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
  module.exports.plugins = (module.exports.plugins || []).concat([new webpack.NamedModulesPlugin()]);
}
