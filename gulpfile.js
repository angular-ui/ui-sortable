var gulp = require('gulp');
var del = require('del');
var plumber = require('gulp-plumber');
var rename = require('gulp-rename');
var traceur = require('gulp-traceur');
var tsc = require('gulp-typescript');

var PATHS = {
    demo: {
      html: 'demo/src/**/*.html',
      css: 'demo/src/**/*.css',
      js: 'demo/src/**/*.js',
      ts: 'demo/src/**/*.ts'
    },
    src: {
      html: 'src/**/*.html',
      css: 'src/**/*.css',
      js: 'src/**/*.js',
      ts: 'src/**/*.ts'
    },
    lib: [
      'node_modules/gulp-traceur/node_modules/traceur/bin/traceur-runtime.js',
      'node_modules/es6-module-loader/dist/es6-module-loader-sans-promises.src.js',
      'node_modules/systemjs/lib/extension-register.js',
      'node_modules/reflect-metadata/Reflect.js',
      'node_modules/angular2/node_modules/zone.js/dist/zone.js',
      'node_modules/angular2/node_modules/zone.js/dist/long-stack-trace-zone.js',
      'bower_components/jquery/dist/jquery.min.js',
      'bower_components/jquery-ui/jquery-ui.min.js'
    ]
};

gulp.task('clean', function(done) {
  del(['dist', 'demo/dist', 'build'], done);
});

function pipeES6Build (src) {
    return gulp.src(src)
        .pipe(rename({extname: ''})) //hack, see: https://github.com/sindresorhus/gulp-traceur/issues/54
        .pipe(plumber())
        .pipe(traceur({
            modules: 'instantiate',
            moduleName: true,
            annotations: true,
            types: true,
            memberVariables: true
        }))
        .pipe(rename({extname: '.js'})); //hack, see: https://github.com/sindresorhus/gulp-traceur/issues/54
}

function pipeTSBuild (src) {
    return pipeES6Build.apply(this, arguments);
    // return gulp.src(src)
    //     .pipe(tsc({
    //         target: 'ES5',
    //         module: 'commonjs',
    //         // Don't use the version of typescript that gulp-typescript depends on, we need 1.5
    //         // see https://github.com/ivogabe/gulp-typescript#typescript-version
    //         typescript: require('typescript')
    //     })).js
    //     // .on('error', function(error) {
    //     //     // nodejs doesn't propagate errors from the src stream into the final stream so we are
    //     //     // forwarding the error into the final stream
    //     //     stream.emit('error', error);
    //     // })
    //     ;
}

gulp.task('js', function () {
    return pipeES6Build(PATHS.src.js).pipe(gulp.dest('dist'));
});

gulp.task('ts', function () {
    return pipeTSBuild(PATHS.src.ts).pipe(gulp.dest('dist'));
});

gulp.task('html', function () {
    return gulp.src(PATHS.src.html).pipe(gulp.dest('dist'));
});

gulp.task('css', function () {
    return gulp.src(PATHS.src.css).pipe(gulp.dest('dist'));
});

gulp.task('libs', ['angular2'], function () {
    var size = require('gulp-size');
    return gulp.src(PATHS.lib)
      .pipe(size({showFiles: true, gzip: true}))
      .pipe(gulp.dest('build/lib'));
});

gulp.task('angular2', function () {

  var buildConfig = {
    paths: {
      "angular2/*": "node_modules/angular2/es6/prod/*.js",
      "rx": "node_modules/angular2/node_modules/rx/dist/rx.js"
    },
    meta: {
      // auto-detection fails to detect properly
      'rx': {
        format: 'cjs' //https://github.com/systemjs/builder/issues/123
      }
    }
  };

  var Builder = require('systemjs-builder');
  var builder = new Builder(buildConfig);

  return builder.build('angular2/angular2', 'build/lib/angular2.js', {});
});

gulp.task('demojs', function () {
    return pipeES6Build(PATHS.demo.js).pipe(gulp.dest('demo/dist'));
});

gulp.task('demots', function () {
    return pipeTSBuild(PATHS.demo.ts).pipe(gulp.dest('demo/dist'));
});

gulp.task('demohtml', function () {
    return gulp.src(PATHS.demo.html).pipe(gulp.dest('demo/dist'));
});

gulp.task('democss', function () {
    return gulp.src(PATHS.demo.css).pipe(gulp.dest('demo/dist'));
});

gulp.task('demosortable', ['build'], function () {
  return gulp.src('dist/*.*').pipe(gulp.dest('demo/dist'));
});

gulp.task('demolib', ['libs'], function () {
  return gulp.src('build/lib/**/*.*').pipe(gulp.dest('demo/dist/lib'));
});

gulp.task('demolibs', ['demosortable', 'demolib']);

gulp.task('play', ['default'], function () {

    var http = require('http');
    var connect = require('connect');
    var serveStatic = require('serve-static');
    var open = require('open');

    var port = 9000, app;

    gulp.watch(PATHS.src.html, ['html']);
    gulp.watch(PATHS.src.css, ['css']);
    gulp.watch(PATHS.src.js, ['js']);
    gulp.watch(PATHS.src.ts, ['ts']);

    gulp.watch(PATHS.demo.html, ['demohtml']);
    gulp.watch(PATHS.demo.css, ['democss']);
    gulp.watch(PATHS.demo.js, ['demojs']);
    gulp.watch(PATHS.demo.ts, ['demots']);

    app = connect().use(serveStatic(__dirname + '/demo/dist'));  // serve everything that is static
    http.createServer(app).listen(port, function () {
      open('http://localhost:' + port);
    });
});

gulp.task('build', ['js', 'ts']);
gulp.task('demo', ['demolibs', 'demojs', 'demots', 'demohtml', 'democss']);
gulp.task('default', ['demo']);

// gulp.task('default', ['js', 'ts', 'html', 'css', 'libs']);
