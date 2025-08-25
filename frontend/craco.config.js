const webpack = require('webpack');

module.exports = {
  devServer: {
    port: 3000,
    open: true,
    hot: true,
    watchOptions: {
      poll: true,
      ignored: /node_modules/,
    },
  },
  webpack: {
    configure: (webpackConfig, { env, paths }) => {
      // 开发环境优化
      if (env === 'development') {
        webpackConfig.mode = 'development';
        webpackConfig.cache = {
          type: 'filesystem',
        };
        webpackConfig.watchOptions = {
          poll: 1000,
          aggregateTimeout: 300,
          ignored: ['**/node_modules/**'],
        };
      }

      // 简化 node 配置，只处理必要的模块
      webpackConfig.node = {
        ...webpackConfig.node,
        fs: 'empty',
        net: 'empty',
        tls: 'empty'
      };

      // 提供全局变量
      webpackConfig.plugins.push(
        new webpack.ProvidePlugin({
          process: 'process/browser',
          Buffer: ['buffer', 'Buffer'],
        })
      );

      return webpackConfig;
    },
  },
};