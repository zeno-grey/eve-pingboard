/**
 * Because we're referencing code in other packages in the yarn workspace, we're
 * using sources outside of the `src` directory.
 * Unfortunately, create-react-app doesn't pick those up by default, which
 * results in failing builds.
 * By using @craco/craco, we're able to override parts of the configuration
 * without ejecting from create-react-app, which spares us having to take
 * care of _all_ the configuration and only change the values we have to change
 * to support pulling in all our required source files.
 */

const path = require('path')
const { getLoader, loaderByName } = require('@craco/craco')

const workspaceProjectsToInclude = [
  'common',
].map(name => path.join(__dirname, `../${name}`))

module.exports = {
  webpack: {
    configure: webpackConfig => {
      const { isFound, match } = getLoader(webpackConfig, loaderByName('babel-loader'))
      if (isFound) {
        match.loader.include = [
          ...Array.isArray(match.loader.include) ? match.loader.include : [match.loader.include],
          ...workspaceProjectsToInclude,
        ]
      }
      return webpackConfig
    },
  },
}
