# html-webpack-replace-manifest-assets-plugin

This plugin was inspired by the very good post of Andrey Okonetchnikov
(http://https://medium.com/@okonetchnikov/long-term-caching-of-static-assets-with-webpack-1ecb139adb95) about the long term caching problem that every developer should solve during the deploy in
production of his projects. In the post, the detail of replacing, in a static
HTML file, the assets with their hashed versions, is not covered even if in one
comment Andrey suggested to use the HtmlWebpackPlugin to solve the problem.
This subplugin of the HtmlWebpackPlugin recreate the manifest.json and raplace the assets in the html file template with their hashed versions.

## Usage

Install via npm:

```shell
npm install html-webpack-replace-manifest-assets-plugin
```

And then require and provide to webpack:

```javascript
// in webpack.config.js or similar
var HtmlWebpackReplaceManifestAssetsPlugin = require('html-webpack-replace-manifest-assets-plugin');


module.exports = {
  ......
  // your config values here
  plugins: [
    new webpack.optimize.CommonsChunkPlugin({
      name: "vendor",
      minChunks: Infinity,
    }),
    new WebpackMd5Hash(),
    new ManifestPlugin(),
    new ChunkManifestPlugin({
      filename: "chunk-manifest.json",
      manifestVariable: "webpackManifest"
    }),
    new webpack.optimize.OccurenceOrderPlugin(),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template:'./src/index.html',
      inject: false,
      minify: {
        removeCommets: true,
        collapseWhitespace: true
      }
    }),
    new HtmlWebpackReplaceManifestAssetsPlugin({
      manifestVariable: 'webpackManifest'
    })
  ]
};
```

### Options

#### `manifestVariable`

The name of the global window variable for storing the map between the webpack modules identifiers and their hashed filename.
