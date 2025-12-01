const path = require('path');

module.exports = {
    entry: {
        login: './client/login.jsx',
        app: './client/maker.jsx',
    },
    mode: 'production',
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                },
            },
        ],
    },
    output: {
        path: path.resolve(__dirname, 'hosted'),
        filename: '[name]Bundle.js',   // loginBundle.js + appBundle.js
    },
    watchOptions: {
        aggregateTimeout: 200,
    },

    entry: {
        login: './client/login.jsx',
        app: './client/maker.jsx',
    },
    output: {
        filename: '[name]Bundle.js',
        path: path.resolve(__dirname, 'hosted'),
    },

};
