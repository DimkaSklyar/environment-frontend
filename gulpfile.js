var gulp 					= require('gulp'),
		gutil 				= require('gulp-util'),
		sass					= require('gulp-sass'),
		browsersync 	= require('browser-sync').create(),
		concat 				= require('gulp-concat'),
		uglify				= require('gulp-uglify'),
		cleancss			= require('gulp-clean-css'),
		rename				= require('gulp-rename'),
		notify				= require('gulp-notify'),
		cssbeautify		= require('gulp-cssbeautify')
		del						= require('del'),
		imagemin 			= require('gulp-imagemin'),
		pngquant 			= require('imagemin-pngquant'),
		cache					= require('gulp-cache'),
		autoprefixer 	= require('gulp-autoprefixer');

gulp.task('browser-sync', function(done) { 
	browsersync.init({ 
		server: { 
			baseDir: 'src'
		},
		notify: false 
	});

	browsersync.watch('src').on('change', browsersync.reload);
  
  done()
});

gulp.task('clean', function() {
	return del(['dist']); // Удаляем папку dist перед сборкой
});

gulp.task('img', function() {
	return gulp.src('src/img/**/*') 
		.pipe(cache(imagemin({ // С кешированием
		// .pipe(imagemin({ // Сжимаем изображения без кеширования
			interlaced: true,
			progressive: true,
			svgoPlugins: [{removeViewBox: false}],
			use: [pngquant()]
		}))/**/)
		.pipe(gulp.dest('dist/img')); 
});

let autoprefixBrowsers = ['> 1%', 'last 2 versions', 'firefox >= 4', 'safari 7', 'safari 8', 'IE 10', 'IE 11'];

gulp.task('sass', function(){
	return gulp.src('src/sass/**/*.sass')
		.pipe(sass({ outputStyle: 'expand' }).on('error', notify.onError()))
		.pipe(cssbeautify({
	    indent: '  ',
	    openbrace: 'end-of-line',
	    autosemicolon: true
		}))
		.pipe(rename({basename: "style"})).pipe(gulp.dest('src/css'))
		.pipe(rename({
			suffix: ".min",
			prefix: ""
		}))
		.pipe(autoprefixer({overrideBrowserslist: autoprefixBrowsers }))
		.pipe(cleancss({level: { 1: { specialComments: 0 } } }))
		.pipe(gulp.dest('src/css'))
		.pipe(browsersync.reload({stream: true}))
		.on('error', gutil.log)
});

gulp.task('js', function() {
	return gulp.src([
			'src/libs/jquery/dist/jquery.min.js',
			'src/js/common.js', // Always at the end
			])
		//.pipe(concat('scripts.min.js'))
		// .pipe(uglify()) // Mifify js (opt.)
		.pipe(gulp.dest('src/js'))
		.pipe(browsersync.reload({ stream: true }))

});

gulp.task('watch', gulp.series('sass','js','browser-sync', function(done) {
	gulp.watch('src/sass/**/*.sass', gulp.parallel('sass'));
	//gulp.watch(['libs/**/*.js', 'src/js/common.js'], gulp.parallel('js'));
	gulp.watch('src/*.html');
  done();
}));


gulp.task('clear', function (callback) {
	return cache.clearAll();
})

gulp.task('build', gulp.series('clean','img', 'sass', 'js', function(done) {
	var buildCss = gulp.src([ 
		'src/css/*.css',
		'src/css/*.min.css'
		])
	.pipe(gulp.dest('dist/css'));

	var buildFonts = gulp.src('src/fonts/**/*')
	.pipe(gulp.dest('dist/fonts'));

	var buildJs = gulp.src('src/js/**/*') 
	.pipe(gulp.dest('dist/js'));

	var buildHtml = gulp.src('src/*.html') 
	.pipe(gulp.dest('dist'));

	var buildPhp = gulp.src('src/*.php') 
	.pipe(gulp.dest('dist'));

	var buildVideo = gulp.src('src/video/*')
	.pipe(gulp.dest('dist/video'));
done();
}));

gulp.task('default', gulp.parallel('watch'));