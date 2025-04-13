const sass = require('sass');

module.exports = {
  style: {
    sass: {
      loaderOptions: {
        api: "modern",
        implementation: sass,
        sassOptions: {
          outputStyle: 'compressed',
        }
      }
    }
  },
  webpack: {
    configure: {
      watchOptions: {
        poll: 1000,
        aggregateTimeout: 300
      }
    }
  }
}; 