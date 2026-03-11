const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

const defaultGetPolyfills = config.serializer?.getPolyfills?.bind(config.serializer) ?? (() => []);

config.serializer = {
  ...config.serializer,
  getPolyfills: (options) => [
    require.resolve('./polyfills.js'),
    ...defaultGetPolyfills(options),
  ],
};

module.exports = config;
