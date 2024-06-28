const path = require('path');

module.exports = {
  webpack: {
    alias: {},
    plugins: [],
    configure: {
      resolve: {
        fallback: {
          "buffer": require.resolve("buffer/"),
          "http": require.resolve("stream-http"),
          "https": require.resolve("https-browserify"),
          "fs": false
        }
      }
    }
  }
};
