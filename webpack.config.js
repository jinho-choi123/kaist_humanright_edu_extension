const path = require('path');
const CopyPlugin = require('copy-webpack-plugin')

module.exports = {
    entry: {
        contentScript: './src/contentScript.js',
        inject: './src/inject.js',
    },
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dist'),
    },
    plugins: [
    ]
}