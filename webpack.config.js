const path = require('path');
//const ExtractTextPlugin = require('extract-text-webpack-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');


let htmlOptions = {
    template: 'src/index.html',
        minify: {
          collapseWhitespace: true,
          removeAttributeQuotes: true
        }
    };

module.exports = {
    entry: './src/app/app.js',
    mode: 'development',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js'
    },
    module: {
        rules: [
        {
            test: /\.s*css$/,
            use: [
                "style-loader", // creates style nodes from JS strings
                "css-loader", // translates CSS into CommonJS
                "sass-loader" // compiles Sass to CSS, using Node Sass by default
            ]
        },
        {
            test: /\.(jpg|png)$/,
            loader: 'file-loader'
        },
        ]
    },
    plugins: [
        //new ExtractTextPlugin("styles.css"),
        new HtmlWebpackPlugin(htmlOptions),
        new webpack.ProvidePlugin({
             $: "jquery",
             jQuery: "jquery",
             "window.jQuery": "jquery'",
             "window.$": "jquery"
         })
    ],
    devServer: {
        contentBase: './src'
    },
};
