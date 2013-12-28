module.exports = function(grunt) {

  reqiore('load-grunt-tasks')(grunt);

  // Default task.
  grunt.registerTask('default', ['jshint', 'testacular']);

  var testacularConfig = function(configFile, customOptions) {
    var options = {
      configFile: configFile,
      keepalive: true
    };
    var travisOptions = process.env.TRAVIS && {
      browsers: ['Firefox'],
      reporters: 'dots'
    };
    return grunt.util._.extend(options, customOptions, travisOptions);
  };

  // Project configuration.
  grunt.initConfig({
    testacular: {
      unit: {
        options: testacularConfig('test/test.conf.js')
      }
    },
    jshint: {
      files: ['src/**/*.js', 'test/**/*.js', 'demo/**/*.js', '!test/libs/*.js'],
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        //indent: 2,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        boss: true,
        eqnull: true,
        globals: {}
      }
    }
  });

};
