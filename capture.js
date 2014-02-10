'use strict';

var fs = require('fs');
var exec = require('child_process').exec;
var _ = require('lodash');

module.exports = function(opts, callback) {
  var options = _.mapValues(opts, function(value) {
    return ('' + value).replace(/\s/g, '');
  });

  function clean() {
    fs.unlink(options.tempOutput, function(err) {
      if (err) throw err;
    });
    fs.unlink(options.tempMinified, function(err){
      if (err) throw err;
    });
  }

  function base64() {
    fs.readFile(options.tempMinified, {
      encoding: 'base64'
    }, function(err, data) {
      if (err) throw err;
      callback(data);
      clean();
    });
  }

  function compress() {
    exec([
      'gifsicle -O2 -o',
      options.tempMinified,
      options.tempOutput
    ].join(' '), function(err) {
      if (err) throw err;
      base64();
    });
  }

  exec([
    'avconv',
    '-f', 'video4linux2',
    '-i', options.input,
    '-r', options.fps,
    '-s', options.size,
    '-t', options.seconds,
    '-pix_fmt rgb24 -vf format=rgb8,format=rgb24',
    options.tempOutput
  ].join(' '), function(err) {
    if (err) throw err;
    compress();
  });
};
