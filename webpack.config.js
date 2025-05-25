const path = require("path");
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");

module.exports = {
  mode: "production", // Set the mode to 'production' or 'development'
  entry: "./src/index.ts", // Your entry file
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
    libraryTarget: "commonjs2", // For npm packages
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new BundleAnalyzerPlugin({
      analyzerMode: "static",
      openAnalyzer: true,
    }),
  ],
  externals: {
    // Exclude dependencies from the bundle
    axios: "axios",
    moment: "moment",
    xmldom: "xmldom",
    xmldsigjs: "xmldsigjs",
  },
};
