module.exports = function(api) {
  // Cache the returned value based on NODE_ENV (standard)
  api.cache(() => process.env.NODE_ENV);

  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin', // Muss als letztes stehen!
    ],
  };
};
