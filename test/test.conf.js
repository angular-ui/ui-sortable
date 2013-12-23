basePath = '..';
files = [
  JASMINE,
  JASMINE_ADAPTER,
  'bower_components/jquery/jquery.js',
  'bower_components/jquery-simulate/jquery.simulate.js',
  'test/libs/jquery.simulate.dragandrevert.js',
  'bower_components/jquery-ui/ui/jquery-ui.js',
  'bower_components/angular/angular.js',
  'bower_components/angular-mocks/angular-mocks.js',
  'src/sortable.js',
  'test/*.spec.js'
];
singleRun = true;
autoWatch = false;
browsers = [ 'Chrome' ];
reporters = [ 'dots' ];

if (singleRun) {
  reporters.push('coverage');
  preprocessors = { '**/src/*.js': 'coverage' };
  coverageReporter = {
    type : 'html',
    dir : 'coverage/'
  };
}
