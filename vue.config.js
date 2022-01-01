module.exports = {
  devServer: {
    disableHostCheck: true
  },
  ...(() => {
    if (process.env.GITHUB_ACTION) {
      return {
        publicPath: '/kinklist-v2/',
      };
    }
    return {};
  })
}
