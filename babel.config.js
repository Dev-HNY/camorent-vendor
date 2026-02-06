module.exports = function(api) {
  api.cache(true);

  const plugins = ['react-native-reanimated/plugin'];

  // Remove all console statements in production builds
  if (process.env.NODE_ENV === 'production') {
    plugins.push(['transform-remove-console', { exclude: [] }]);
  }

  return {
    presets: ['babel-preset-expo'],
    plugins,
  };
};
