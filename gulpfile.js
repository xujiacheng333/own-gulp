const gulp = require('gulp');
const browserSync = require('browser-sync').create();
var proxy = require('http-proxy-middleware');  // 代理
const pug = require('gulp-pug');
const htmlbeautify = require('gulp-html-beautify');
const less = require('gulp-less');
const uglify = require('gulp-uglify');
const cleancss = require('gulp-clean-css');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const Px2rem = require('postcss-px2rem');
// 图片压缩
const imagemin = require('gulp-imagemin');

//  js 文件处理
const sourcemaps = require('gulp-sourcemaps'); //创建sourcemap插件
const babel = require('gulp-babel'); //编译为es5
// node代码 转化成 浏览器代码  es6 => es5 的基础设置
var browserify = require('browserify'); 
var source = require('vinyl-source-stream'); 
var watchify = require('watchify');
var buffer = require('vinyl-buffer');
const gutil = require('gulp-util');
const babelify = require('babelify');
//合并js代码
const concat = require('gulp-concat'); 

// 捕获错误
const combiner = require('stream-combiner2');

// 规范代码
// const eslint = require('gulp-eslint');

// 个人配置文件
const gulpSetting = require('./gulpSetting.js');

var apiProxy = proxy('/api', {target: 'http://www.yny8888.com',changeOrigin: true}); // 设置代理

gulp.task('default',['less','uglify','images','pug'] , function () {

	browserSync.init({
        server: {
            baseDir: "./"
        },
        middleware: [apiProxy]
    });

  gulpSetting.projects.forEach(function (pro) {
  	gulp.watch("src/" + pro + "/**" , ['less','uglify','pug']);
  	// gulp.watch("src/" + pro + "/pug/**" , ['pug'])
  	// gulp.watch("src/" + pro + "/less/**" , ['less'])
  	// gulp.watch("src/" + pro + "/js/**" , ['uglify'])
  	gulp.watch("src/" + pro + "/imgs/**" , ['images'])
  	gulp.watch("dest/" + pro + "/**").on('change',browserSync.reload);
  })

})

	


gulp.task('pug' , function () {

	gulpSetting.projects.forEach(function (pro) {
		if (gulpSetting.pugHtmlbeautify) {
			var combined_pug = combiner.obj([
					gulp.src("src/" + pro + "/pug/*.pug"),
					pug(),
					htmlbeautify({indentSize: 2}),
					gulp.dest('./dest/'+ pro)
				])
		} else {
			var combined_pug = combiner.obj([
					gulp.src("src/" + pro + "/pug/*.pug"),
					pug(),
					// htmlbeautify({indentSize: 2}),
					gulp.dest('./dest/'+ pro)
				])
		}

		combined_pug.on('error', console.error.bind(console));
		return combined_pug;
	})


})

gulp.task('less', function () {
	// 设置1rem等于多少px  可以使用sublime插件代替
	// let processors = [px2rem({remUnit: 37.5})];
	
	gulpSetting.projects.forEach(function (pro) {
		if (!gulpSetting.lessConcat) {
			//导出多个压缩文件
			var combined_css = combiner.obj([
					gulp.src('src/'+ pro + '/less/*.less'),
					less(),
					cleancss(),
					postcss([ autoprefixer({ browsers: ['> 5%'] })]),
					gulp.dest('./dest/' + pro + '/css'),
				])
		} else {
			// 导出单个map文件
			var combined_css = combiner.obj([
					gulp.src('src/'+ pro + '/less/*.less'),
					sourcemaps.init(),
					less(),
					cleancss(),
					postcss([ autoprefixer({ browsers: ['> 5%'] })]),
					concat("all.css"),
					sourcemaps.write("."),
					gulp.dest('./dest/' + pro + '/css'),
				])
		}
		combined_css.on('error', console.error.bind(console));
		return combined_css;
	})

})

gulp.task('uglify' , function () {

	gulpSetting.projects.forEach(function (pro) {
		if (!gulpSetting.jsConcat) {
			//  生成多个js文件
			var combined_js = combiner.obj([
					gulp.src('src/' + pro + '/js/*.js'),
					// babel(),
					// uglify(),
					gulp.dest("./dest/" + pro + "/js")
				])
			combined_js.on('error', console.error.bind(console));
			return combined_js;
		} else {
			// 导出单个map文件
			// var combined_js = combiner.obj([
			// 		gulp.src('src/' + pro + '/js/*.js'),
			// 		sourcemaps.init(),
			// 		babel(),
			// 		concat("all.js"),
			// 		uglify(),
			// 		sourcemaps.write("."),
			// 		gulp.dest("./dest/" + pro + "/js")
			// 	])

			// 通过browserify将Node代码变成浏览器代码
			browserify({
			   entries: 'src/' + pro + '/js/main.js',
			   debug: true
			})
			.transform(babelify,{
					"presets": [
					  "es2015",
					  "stage-2"
					],
					"plugins": ["transform-regenerator"],
				})
			.bundle()
			.on('error', err => {
			  gutil.log("Browserify Error", gutil.colors.red(err.message))
			})
			.pipe(source('all.js'))
			.pipe(buffer())  // 将代码转化为buffer
			.pipe(sourcemaps.init({loadMaps: true}))
			.pipe(uglify())
			.pipe(sourcemaps.write("."))
			.pipe(gulp.dest("./dest/" + pro + "/js"))



		}


	})

})


// // 压缩图片
gulp.task('images', function () {

	gulpSetting.projects.forEach(function (pro) {
	  var combined_imgs = combiner.obj([
			gulp.src('src/' + pro + '/imgs/*.*'),
			// imagemin({progressive: true}),
			gulp.dest("./dest/" + pro + "/imgs")
		])
		combined_imgs.on('error', console.error.bind(console));
		return combined_imgs;
	})
});