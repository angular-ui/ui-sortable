module.exports = function(grunt) {

  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-contrib-jshint');

  // Default task.
  grunt.registerTask('default', ['jshint', 'karma']);


  // HACK TO MAKE TRAVIS WORK
  var testConfig = function(configFile, customOptions) {
    var options = { configFile: configFile, singleRun: true };
    var travisOptions = process.env.TRAVIS && { browsers: ['Firefox', 'PhantomJS'], reporters: ['dots'] };
    return grunt.util._.extend(options, customOptions, travisOptions);
  };
  //


  // Project configuration.
  grunt.initConfig({
    karma: {
      unit: {
        options: testConfig('test/karma.conf.js')
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