
const path = require('path')

process.env.CHROME_BIN = process.env.CHROME_BIN || '/usr/bin/google-chrome'

module.exports = function (config) {
  config.set({
    basePath: '',

    frameworks: ['jasmine', 'webpack'],

    
    files: [
      { pattern: 'src/test-setup.ts', watched: false },
      { pattern: 'src/**/*.spec.ts', watched: false },
    ],

    preprocessors: {
      'src/test-setup.ts': ['webpack'],
      'src/**/*.spec.ts': ['webpack'],
    },

    webpack: {
      mode: 'development',
      devtool: 'inline-source-map',
      resolve: {
        extensions: ['.ts', '.js'],
        alias: {
          '~': path.resolve(__dirname, 'src'),
        },
      },
      module: {
        rules: [
          {
            test: /\.ts$/,
            use: {
              loader: 'ts-loader',
              options: { configFile: path.resolve(__dirname, 'tsconfig.spec.json') },
            },
            exclude: /node_modules/,
          },
        ],
      },
      stats: 'errors-only',
    },

    webpackMiddleware: {
      stats: 'errors-only',
    },

    reporters: ['progress', 'junit'],

    junitReporter: {
      outputDir: 'test-reports',
      outputFile: 'unit-tests.xml',
      useBrowserName: false,
    },

    browsers: ['ChromeHeadless'],

    singleRun: true,
    autoWatch: false,
    concurrency: 1,
  })
}
