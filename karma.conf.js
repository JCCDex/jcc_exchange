const webpack = require("webpack");

module.exports = function (config) {
  config.set({
    frameworks: ["mocha", "detectBrowsers"],
    files: ["test/*.spec.js"],
    preprocessors: {
      "test/*.spec.js": ["webpack"]
    },
    singleRun: true,
    plugins: ["karma-webpack", "karma-chrome-launcher", "karma-env-preprocessor", "karma-firefox-launcher", "karma-detect-browsers", "karma-mocha"],
    webpack: {
      mode: "development",
      resolve: {
        fallback: {
          fs: false,
          tls: false,
          child_process: false,
          net: false,
          crypto: require.resolve("crypto-browserify"),
          stream: require.resolve("stream-browserify"),
          buffer: require.resolve("buffer/"),
          path: require.resolve("path-browserify"),
          util: require.resolve("util/"),
          assert: require.resolve("assert/"),
          url: require.resolve("url/")
        }
      },
      plugins: [
        new webpack.ProvidePlugin({
          Buffer: ["buffer", "Buffer"],
          process: require.resolve("process/browser")
        })
      ]
    },
    webpackMiddleware: {
      stats: "errors-only"
    },
    envPreprocessor: ["RANDOM_TESTS_REPEAT"],
    detectBrowsers: {
      enabled: true,
      usePhantomJS: false,
      postDetection(availableBrowser) {
        if (availableBrowser.includes("Chrome")) {
          return ["ChromeHeadless"];
        }

        var browsers = ["Chrome", "Firefox"];
        return browsers.filter(function (browser) {
          return availableBrowser.indexOf(browser) !== -1;
        });
      }
    }
  });
};
