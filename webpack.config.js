const path = require('path')
const Html = require('html-webpack-plugin')

module.exports = {
    entry: path.join(__dirname, 'index.js'),
    output: {
        filename: 'tog.bundle.js',
        path: path.join(__dirname, 'www')
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: { presets: ['es2015'] }
                }
            }
        ]
    },
    plugins: [
        new Html({
            filename: path.join(__dirname, 'www', 'index.html'),
            template: path.join(__dirname, 'index.html')
        })
    ]
}
