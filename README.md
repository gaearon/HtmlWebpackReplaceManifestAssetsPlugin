# html-webpack-replace-manifest-assets-plugin

This plugin was inspired by the very good post of Andrey Okonetchnikov
(http://https://medium.com/@okonetchnikov/long-term-caching-of-static-assets-with-webpack-1ecb139adb95) about the long term caching problem that every developer should solve during the deploy in
production of his projects. In the post, the detail of replacing in a static
HTML file the assets with their hashing versions, is not covered even if in one
comment Andrey suggested to use the HtmlWebpackPlugin to solve the problem.
This subplugin of the HtmlWebpackPlugin read the manifest.json file, generated with the ManifestPlugin, and raplace the assets in the html file template with
their hashing versions.

## Usage

Install via npm:

```shell
npm install git://github.com/pierol/html-webpack-replace-manifest-assets-plugin.git
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
      manifest:'./build/manifest.json',
      inject: false,
      minify: {
        removeCommets: true,
        collapseWhitespace: true
      }
    }),
    new HtmlWebpackReplaceManifestAssetsPlugin()
  ]
};
```

### Options

#### `manifest`

Where the manifest.json will be exported to on bundle compilation. 
