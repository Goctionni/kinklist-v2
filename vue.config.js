module.exports = {
  devServer: {
    disableHostCheck: true
  },
  ...(() => {
    console.log(JSON.stringify(process.env));
    if (process.env.GITHUB_ACTION) {
      return {
        publicPath: '/kinklist-v2/',
      };
    }
    return {};
  })(),
}
