var gulp = require('gulp')
  , clean = require('gulp-rimraf')
  , cssmin = require('gulp-minify-css')
  , uglify = require('gulp-uglify')
  , ext_replace = require('gulp-ext-replace')
  , react = require('gulp-react')
  ;

gulp.task('clean', [], function() {
  console.log('Clean build folder');
  return gulp.src('public/build/*', { read: false }).pipe(clean());
});

gulp.task('css', [], function() {
  console.log('Minify CSS');
  return gulp.src('public/stylesheets/**.css')
    .pipe(cssmin())
    .pipe(gulp.dest('public/build/stylesheets'));
});

gulp.task('compile-jsx', [], function() {
  console.log('Compiling and transfering JSX files');
  return gulp.src('public/javascripts/**.jsx')
    .pipe(react())
    .pipe(ext_replace('.js'))
    .pipe(gulp.dest('public/javascripts/compiled'));
});

gulp.task('javascript', [ 'compile-jsx' ], function() {
  console.log('Minify JS');
  gulp.src('public/javascripts/**.js')
    .pipe(uglify())
    .pipe(gulp.dest('public/build/javascripts'));
  gulp.src('public/javascripts/compiled/**.js')
    .pipe(uglify())
    .pipe(gulp.dest('public/build/javascripts'));
});

gulp.task('default', [ 'clean', 'css', 'javascript' ], function() {
  console.log('Starting Gulp');
});
