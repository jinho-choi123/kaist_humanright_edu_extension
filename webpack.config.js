const path = require('path');

module.exports = {
    entry: './src/contentScript.js',
    output: {
        filename: 'contentScript.bundle.js',
        path: path.resolve(__dirname, 'dist'),
    },
    watch: true,
}