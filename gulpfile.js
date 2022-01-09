const gulp = require('gulp');
const	gutil = require('gulp-util');
const	sass = require('gulp-sass')(require('sass'));
const	browsersync = require('browser-sync').create();
const	concat = require('gulp-concat');
const	uglify = require('gulp-uglify');
const	cleancss = require('gulp-clean-css');
const	rename = require('gulp-rename');
const	notify = require('gulp-notify');
const	cssbeautify = require('gulp-cssbeautify');
const	del = require('del');
const	imagemin = require('gulp-imagemin');
const	pngquant = require('imagemin-pngquant');
const	cache = require('gulp-cache');
const	autoprefixer = require('gulp-autoprefixer');
const minify = require('gulp-minify');

gulp.task('browser-sync', function (done) {
	browsersync.init({
		server: {
			baseDir: 'src'
		},
		notify: false
	});

	browsersync.watch('src').on('change', browsersync.reload);

	done()
});

gulp.task('clean', function () {
	return del(['dist']); // Удаляем папку dist перед сборкой
});

gulp.task('img', function () {
	return gulp.src('src/assets/**/*')
		.pipe(cache(imagemin({ // С кешированием
			// .pipe(imagemin({ // Сжимаем изображения без кеширования
			interlaced: true,
			progressive: true,
			svgoPlugins: [{ removeViewBox: false }],
			use: [pngquant()]
		}))/**/)
		.pipe(gulp.dest('dist/assets'));
});

const autoprefixBrowsers = ['> 1%', 'last 2 versions', 'firefox >= 4', 'safari 7', 'safari 8', 'IE 10', 'IE 11'];

gulp.task('scss', function () {
	return gulp.src('src/scss/**/*.scss')
		.pipe(sass({ outputStyle: 'compressed', includePaths: ['node_modules'] }).on('error', notify.onError()))
		.pipe(cssbeautify({
			indent: '  ',
			openbrace: 'end-of-line',
			autosemicolon: true
		}))
		.pipe(rename({ basename: "style" })).pipe(gulp.dest('src/css'))
		.pipe(rename({
			suffix: ".min",
			prefix: ""
		}))
		.pipe(autoprefixer({ overrideBrowserslist: autoprefixBrowsers }))
		.pipe(cleancss({ level: { 1: { specialComments: 0 } } }))
		.pipe(gulp.dest('src/css'))
		.pipe(browsersync.reload({ stream: true }))
		.on('error', gutil.log)
});

gulp.task('js', function () {
	return gulp.src([
		'./node_modules/jquery/dist/jquery.min.js',
		'src/js/common.js', // Always at the end
	])
		.pipe(concat('scripts.min.js'))
		.pipe(minify({
			ext:{
					src:'-debug.js',
					min:'.js'
			},
			exclude: ['tasks'],
			ignoreFiles: ['.combo.js', '-min.js']
		}))
		.pipe(gulp.dest('src/js'))
		.pipe(browsersync.reload({ stream: true }))

});

gulp.task('watch', gulp.series('scss', 'js', 'browser-sync', function (done) {
	gulp.watch('src/scss/**/*.scss', gulp.parallel('scss'));
	gulp.watch(['libs/**/*.js', 'src/js/common.js'], gulp.parallel('js'));
	gulp.watch('src/*.html');
	done();
}));


gulp.task('clear', function (callback) {
	return cache.clearAll();
})

gulp.task('build', gulp.series('clean', 'img', 'scss', 'js', function (done) {
	gulp.src([
		'src/css/*.css',
		'src/css/*.min.css'
	])
		.pipe(gulp.dest('dist/css'));

	gulp.src('src/fonts/**/*')
		.pipe(gulp.dest('dist/fonts'));

	gulp.src('src/js/**/*')
		.pipe(gulp.dest('dist/js'));

	gulp.src('src/*.html')
		.pipe(gulp.dest('dist'));

	gulp.src('src/*.php')
		.pipe(gulp.dest('dist'));

	gulp.src('src/video/*')
		.pipe(gulp.dest('dist/video'));

	done();
}));

gulp.task('default', gulp.parallel('watch'));