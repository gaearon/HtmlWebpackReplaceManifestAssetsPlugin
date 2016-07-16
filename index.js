'use strict';
var fs = require('fs');
var path = require('path');
var _ = require('lodash');

function HtmlWebpackReplaceManifestAssetsPlugin(options) {
  this.opts = _.assign({
    basePath: '',
    fileName: 'manifest.json',
    stripSrc: null,
    transformExtensions: /^(gz|map)$/i,
    cache: null,
    manifestVariable: 'webpackManifest'
  }, options || {});

}

HtmlWebpackReplaceManifestAssetsPlugin.prototype.apply = function(compiler) {
  var self = this;
  // Hook into the html-webpack-plugin processing
  compiler.plugin('compilation', function(compilation) {
    compilation.plugin('html-webpack-plugin-after-html-processing', function(htmlPluginData, callback) {
      self.replaceAsset(compilation, htmlPluginData, htmlPluginData.plugin.options, callback);
    });
  });
};

HtmlWebpackReplaceManifestAssetsPlugin.prototype.getFileType = function(str) {
  str = str.replace(/\?.*/, '');
  var split = str.split('.');
  var ext = split.pop();
  if (this.opts.transformExtensions.test(ext)) {
    ext = split.pop() + '.' + ext;
  }
  return ext;
};

HtmlWebpackReplaceManifestAssetsPlugin.prototype.replaceAsset = function(compilation, htmlPluginData, htmlWebpackPluginOptions, callback) {
  var stats = compilation.getStats().toJson();
  var manifest = {};
  var cache = {};
  var moduleAssets = {};

  _.merge(cache, compilation.chunks.reduce(function(memo, chunk) {
    var chunkName = chunk.name ? chunk.name.replace(this.opts.stripSrc, '') : null;

    // Map original chunk name to output files.
    // For nameless chunks, just map the files directly.
    return chunk.files.reduce(function(memo, file) {
      if (chunkName) {
        memo[chunkName + '.' + this.getFileType(file)] = file;
      } else {
        memo[file] = file;
      }
      return memo;
    }.bind(this), memo);
  }.bind(this), {}));

  // module assets don't show up in assetsByChunkName.
  // we're getting them this way;
  _.merge(cache, stats.assets.reduce(function(memo, asset) {
    var name = moduleAssets[asset.name];
    if (name) {
      memo[name] = asset.name;
    }
    return memo;
  }, {}));

  // Append optional basepath onto all references.
  // This allows output path to be reflected in the manifest.
  if (this.opts.basePath) {
    cache = _.reduce(cache, function(memo, value, key) {
      memo[this.opts.basePath + key] = this.opts.basePath + value;
      return memo;
    }.bind(this), {});
  }

  Object.keys(cache).sort().forEach(function(key) {
    manifest[key] = cache[key];
  });

  // I replace in the generated html the assets with their hashed version
  // based on the key value pair in manifest
  for (var key in manifest) {
    var value = manifest[key];
    var pattern = new RegExp(key, 'gm');
    htmlPluginData.html = htmlPluginData.html.replace(pattern, value);
  }


  // Create in result variable the webpackManifest then
  // after putting in the html template the placeholder ##window.webpackManifest##,
  // i replace it inlining the window.webpackManifest updated with the hashed assets
  var result = {}
  stats.assets.filter(function(item) {
    return item.name.match('.js$') !== null
  }).forEach(function(item) {
    result[item.chunks[0]] = item.name
  })
  var pattern = new RegExp("##window.webpackManifest##", 'gm');
  htmlPluginData.html = htmlPluginData.html.replace(pattern, 'window.' + this.opts.manifestVariable + ' = ' + JSON.stringify(result));

  callback(null, htmlPluginData);

}

module.exports = HtmlWebpackReplaceManifestAssetsPlugin;