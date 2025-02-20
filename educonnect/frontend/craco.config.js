module.exports = {
  style: {
    sass: {
      loaderOptions: {
        sassOptions: {
          quietDeps: true
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