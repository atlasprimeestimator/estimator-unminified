const gulp = require('gulp');
const sass = require('gulp-sass');
const cleanCSS = require('gulp-clean-css');
const autoprefixer = require('gulp-autoprefixer');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify-es').default;
const concat = require('gulp-concat');
const nodemon = require('gulp-nodemon');
const browserSync = require('browser-sync').create();

gulp.task('sass', () => {
    return gulp.src('src/scss/**/*.scss')
        .pipe(sass())
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }))
        .pipe(gulp.dest('src/css'))
});

gulp.task('css', ['sass'], () => {
    return gulp.src('src/css/*.css')
    .pipe(cleanCSS({compatibility: 'ie8'}))
    .pipe(gulp.dest('public/assets/css'))
    .pipe(browserSync.stream());    
});

gulp.task('js', () => {
    return gulp.src('src/js/*.js')
    .pipe(babel({
        presets: ['es2015']
      }))
    .pipe(uglify())
    .pipe(concat('script.min.js'))
    .pipe(gulp.dest('public/assets/js'))
    .pipe(browserSync.stream());    
});

gulp.task('watch', () => {
    gulp.watch('src/scss/**/*.scss', ['sass','css']);
    gulp.watch('src/js/*.js', ['js']);
    gulp.watch('public/**/*.html');
})

gulp.task('serve', () => {
    return nodemon({
        script: 'server/index.js',
        env: {
            'NODE_ENV': 'development',
        }
    });
});

gulp.task('browser-sync', () => {
    browserSync.init({
        proxy: 'localhost:4000/'
    })
});
gulp.task('dist', ['sass','css','js']);
gulp.task('default', ['sass', 'css','js','watch', 'serve','browser-sync']);

module.exports = gulp;
