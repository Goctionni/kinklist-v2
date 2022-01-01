module.exports = {
  devServer: {
    disableHostCheck: true
  },
  ...(() => {
    if (process.env.GH_BUILD) {
      return {
        publicPath: '/kinklist-v2/',
      };
    }
    return {};
  })
}
