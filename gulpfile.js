'use strict';

var gulp = require('gulp');
var mocha = require('gulp-mocha');
var istanbul = require('gulp-istanbul');

gulp.task('mochaTest', function (cb) {
  gulp.src(['common/**/*.js'])
    .pipe(istanbul()) // Covering files
    .pipe(istanbul.hookRequire()) // Force `require` to return covered files
    .on('finish', function () {
      var app = require('./server/server');
      var instance = app.start(function(err,serverInstance){
        if(err) {
          console.log(err);
          return cb();
        }
        gulp.src(['test/*-test.js'])
          .pipe(mocha({ timeout: 10000 }))
          .pipe(istanbul.writeReports({dir:'reports/coverage'}))// Creating the reports after tests runned
          .on('end', function(){
            (serverInstance || instance).close();
            cb();
          });
      });
    });
});

gulp.on('stop', function() { process.exit(0); });