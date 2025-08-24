const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
const path = require('path');

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
  server: {
    port: 8082,
  },
  projectRoot: __dirname,
  watchFolders: [__dirname],
  resolver: {
    blockList: [
      // Block the old mobile directories to prevent conflicts
      /.*\/mobile\/.*/, 
      /.*\/mobile_old\/.*/,
    ],
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
