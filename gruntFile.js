/* jshint node:true */

'use strict';

module.exports = function(grunt) {

  require('load-grunt-tasks')(grunt);

  // Default task.
  grunt.registerTask('default', ['test']);
  grunt.registerTask('test', ['jshint', 'karma:unit']);
  grunt.registerTask('serve', ['karma:continuous', 'dist', 'build:gh-pages', 'connect:continuous', 'watch']);
  grunt.registerTask('dist', ['ngmin', 'surround:main', 'uglify', 'surround:banner' ]);
  grunt.registerTask('coverage', ['jshint', 'karma:coverage']);
  grunt.registerTask('junit', ['jshint', 'karma:junit']);


  // HACK TO ACCESS TO THE COMPONENT PUBLISHER
  function fakeTargetTask(prefix){
    return function(){

      if (this.args.length !== 1) {
        return grunt.log.fail('Just give the name of the ' + prefix + ' you want like :\ngrunt ' + prefix + ':bower');
      }

      var done = this.async();
      var spawn = require('child_process').spawn;
      spawn('./node_modules/.bin/gulp', [ prefix, '--branch='+this.args[0] ].concat(grunt.option.flags()), {
        cwd : './node_modules/angular-ui-publisher',
        stdio: 'inherit'
      }).on('close', done);
    };
  }

  grunt.registerTask('build', fakeTargetTask('build'));
  grunt.registerTask('publish', fakeTargetTask('publish'));
  //


  // HACK TO MAKE TRAVIS WORK
  var testConfig = function(configFile, customOptions) {
    var options = { configFile: configFile, singleRun: true };
    var travisOptions = process.env.TRAVIS && {
      browsers: ['Chrome', 'Firefox'],
      reporters: ['dots', 'coverage', 'coveralls'],
      preprocessors: { 'src/*.js': ['coverage'] },
      coverageReporter: {
        reporters: [{
          type: 'text'
        }, {
          type: 'lcov',
          dir: 'coverage/'
        }]
      },
    };
    return grunt.util._.extend(options, customOptions, travisOptions);
  };
  //


  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    meta: {
      banner: ['/**',
        ' * <%= pkg.name %> - <%= pkg.description %>',
        ' * @version v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>',
        ' * @link <%= pkg.homepage %>',
        ' * @license <%= pkg.license %>',
        ' */',
        ''].join('\n')
    },

    connect: {
      options: {
        base : 'out/built/gh-pages',
        open: true,
        livereload: true
      },
      server: { options: { keepalive: true } },
      continuous: { options: { keepalive: false } }
    },

    coveralls: {
      options: {
        coverage_dir: 'coverage/',
        // debug: true
        // dryRun: true,
        // force: true,
        // recursive: true
      }
    },

    karma: {
      unit: testConfig('test/karma.conf.js'),
      server: {configFile: 'test/karma.conf.js'},
      continuous: {configFile: 'test/karma.conf.js',  background: true },
      coverage: {
        configFile: 'test/karma.conf.js',
        reporters: ['progress', 'coverage'],
        preprocessors: { 'src/*.js': ['coverage'] },
        coverageReporter: {
          reporters: [{
            type: 'text'
          }, {
            type: 'lcov',
            dir: 'coverage/'
          }]
        },
        singleRun: true
      },
      junit: {
        configFile: 'test/karma.conf.js',
        reporters: ['progress', 'junit'],
        junitReporter: {
          outputFile: 'junit/unit.xml',
          suite: 'unit'
        },
        singleRun: true
      }
    },

    jshint: {
      src: {
        files:{ src : ['src/**/*.js', 'demo/**/*.js'] },
        options: { jshintrc: '.jshintrc' }
      },
      test: {
        files:{ src : [ 'test/*.js', 'gruntFile.js'] },
        options: grunt.util._.extend({}, grunt.file.readJSON('.jshintrc'), grunt.file.readJSON('test/.jshintrc'))
      }
    },

    uglify: {
      build: {
        expand: true,
        cwd: 'dist',
        src: ['*.js', '!*.min.js'],
        ext: '.min.js',
        dest: 'dist'
      }
    },

    surround: {
      main: {
        expand: true,
        cwd: 'src',
        src: ['*.js'],
        dest: 'dist',
        options: {
          prepend: ['(function(window, angular, undefined) {',
                    '\'use strict\';'].join('\n'),
          append: '})(window, window.angular);'
        }
      },
      banner: {
        expand: true,
        cwd: 'dist',
        src: ['*.js'],
        dest: 'dist',
        options: {
          prepend: '<%= meta.banner %>'
        }
      }
    },

    ngmin: {
      main: {
        expand: true,
        cwd: 'src',
        src: ['*.js'],
        dest: 'dist'
      }
    },

    changelog: {
      options: {
        dest: 'CHANGELOG.md'
      }
    },

    watch: {
      src: {
        files: ['src/*'],
        tasks: ['jshint:src', 'karma:unit:run', 'dist', 'build:gh-pages']
      },
      test: {
        files: ['test/*.js'],
        tasks: ['jshint:test', 'karma:unit:run']
      },
      demo: {
        files: ['demo/*', 'publish.js'],
        tasks: ['jshint', 'build:gh-pages']
      },
      livereload: {
        files: ['out/built/gh-pages/**/*'],
        options: { livereload: true }
      }
    }
  });

};
