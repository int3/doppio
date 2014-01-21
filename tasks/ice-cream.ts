/// <reference path="../vendor/DefinitelyTyped/node/node.d.ts" />
/// <reference path="../vendor/DefinitelyTyped/gruntjs/gruntjs.d.ts" />
import os = require('os');
import child_process = require('child_process');
import fs = require('fs');
import path = require('path');
import run_command = require('./helpers/run_command');
var async = require('async');

function ice_cream(grunt: IGrunt) {
  grunt.registerMultiTask('ice-cream', 'Removes debug statements from code.', function() {
    var ice_cream_path: string = 'node_modules/ice-cream/dessert.js',
        files: {src: string[]; dest: string}[] = this.files,
        done: (status?: boolean) => void = this.async(),
        args: string = " --remove trace --remove vtrace --remove debug",
        i: number, tasks: Function[] = [];
    for (i = 0; i < files.length; i++) {
      // Closure to capture 'file'.
      (function(file: {src: string[]; dest: string}) {
        // Ensure destination folder exists
        if (!fs.existsSync(path.dirname(file.dest))) {
          grunt.file.mkdir(path.dirname(file.dest));
        }
        tasks.push(function(cb: (err?: any) => void): void {
          var fileStream = fs.createWriteStream(file.dest);
          run_command.runCommand('node',
            [ice_cream_path, file.src[0], '--remove', 'trace', '--remove', 'vtrace', '--remove', 'debug'],
            {},
            run_command.createWriteCb(fileStream),
            run_command.nopCb,
            run_command.createErrorCb(grunt, fileStream, cb, "Could not run ice-cream on file " + file.src[0] + ".")
          );
        });
      })(files[i]);
    }

    // Parallelize!
    async.parallelLimit(tasks, os.cpus().length, function(err: any, results: any[]) {
      done(err == null);
    });
  });
}

(module).exports = ice_cream;