const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  // ...existing config...
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: 'assets', to: 'assets' }, // Copy assets to the dist folder
      ],
    }),
  ],
  // ...existing config...
};
