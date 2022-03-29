const gulp = require("gulp");
const { parallel, series } = require("gulp");

const imagemin = require("gulp-imagemin");
const htmlmin = require("gulp-htmlmin");
const uglify = require("gulp-uglify");
const sourcemaps = require("gulp-sourcemaps");
// const sass = require("gulp-sass")(require("sass"));
// 구버전 node-sass
const sass = require("gulp-sass")(require("node-sass"));
const concat = require("gulp-concat");
const browserSync = require("browser-sync").create(); //https://browsersync.io/docs/gulp#page-top
const nunjucksRender = require("gulp-nunjucks-render");
const autoprefixer = require("gulp-autoprefixer");
const babel = require("gulp-babel");
const purgecss = require("gulp-purgecss");

var sass_opt = {
	/**
	  * outputStyle (Type : String  , Default : nested)
	  * CSS의 컴파일 결과 코드스타일 지정
	  * Values : nested, expanded, compact, compressed
	*/
	outputStyle:"nested",
	/**
	  * indentType (>= v3.0.0 , Type : String , Default : space)
	  * 컴파일 된 CSS의 "들여쓰기" 의 타입
	  * Values : space , tab
	*/
	indentType:"space",
	/**
	  * indentWidth (>= v3.0.0, Type : Integer , Default : 2)
	  * 컴파일 된 CSS의 "들여쓰기" 의 갯수
	*/
	indentWidth:2,
	/**
	 * precision (Type :  Integer , Default : 5)
	 * 컴파일 된 CSS의 소수점 자리수.
	*/
	precision:5,
	/**
	 * sourceComments (Type : Boolean , Default : false)
	 * 컴파일 된 CSS에 원본소스의 위치와 줄수 주석표시.
	*/
	sourceComments:false
}


// /*
// TOP LEVEL FUNCTIONS
//     gulp.task = Define tasks
//     gulp.src = Point to files to use
//     gulp.dest = Points to the folder to output
//     gulp.watch = Watch files and folders for changes
// */


// Optimise Images
function imageMin(cb) {
  gulp.src(["src/assets/images/**/*"]).pipe(imagemin()).pipe(gulp.dest("dist/images"));
  cb();
}

// Copy Fonts
function copyFont(cb) {
  gulp.src(["src/assets/fonts/**"]).pipe(gulp.dest("dist/fonts"));
  cb();
}

// Copy all HTML files to Dist
function copyHTML(cb) {
  gulp.src(["src/pages/**/*.html"]).pipe(gulp.dest("dist"));
  cb();
}

// Minify HTML
function minifyHTML(cb) {
  gulp
    .src("src/*.html")
    .pipe(gulp.dest("dist"))
    .pipe(
      htmlmin({
        collapseWhitespace: true,
      })
    )
    .pipe(gulp.dest("dist"));
  cb();
}

// Scripts
function js(cb) {
  gulp
    .src([
      "src/assets/js/**/*.js",
    ])
    .pipe(
      babel({
        presets: ["@babel/preset-env"],
      })
    )
    // .pipe(concat("main.js"))
    .pipe(uglify())
    .pipe(gulp.dest("dist/js"));
  cb();
}

// Compile Sass
function css(cb) {
  gulp
    .src([
      // 공통 css
      "src/assets/sass/style.scss",
      "src/assets/sass/**/*.scss",
    ])
    .pipe(sourcemaps.init())
    .pipe(sass({ 
      outputStyle: 'compact',
      // sourceComments: false
    }).on("error", sass.logError))
    // .pipe(sass(sass_opt).on("error", sass.logError))
    .pipe(purgecss({ content: ["src/**/*.html"] }))
    .pipe(
      autoprefixer({
        browserlist: [
          "> 2%",
          "last 2 versions",
          "IE 11"
          // "ios 5"
        ],
        cascade: false,
      })
    )
    .pipe(sourcemaps.write("./sourcemap"))
    .pipe(gulp.dest("dist/css"))
    // Stream changes to all browsers
    .pipe(browserSync.stream());
  cb();
}

// Process Nunjucks
function nunjucks(cb) {
  gulp
    .src("src/pages/**/*.html")
    .pipe(
      nunjucksRender({
        path: ["src/templates/"], // String or Array
      })
    )
    .pipe(gulp.dest("dist"));
  cb();
}

function nunjucksMinify(cb) {
  gulp
    .src("src/pages/**/*.html")
    .pipe(
      nunjucksRender({
        path: ["src/templates/"], // String or Array
      })
    )
    .pipe(
      htmlmin({
        collapseWhitespace: true,
      })
    )
    .pipe(gulp.dest("dist"));
  cb();
}

// Watch Files
function watch_files() {
  browserSync.init({
    server: {
      baseDir: "dist/",
    },
    notify: false,
  });
  gulp.watch("src/assets/sass/**/*.scss", css);
  gulp.watch("src/assets/js/**/*.js", js).on("change", browserSync.reload);
  gulp.watch("src/pages/**/*.html", nunjucks).on("change", browserSync.reload);
  gulp.watch("src/templates/*.html", nunjucks).on("change", browserSync.reload);
}

// Default 'gulp' command with start local server and watch files for changes.
exports.default = series(nunjucks, copyFont, css, js, imageMin, watch_files);

// 'gulp build' will build all assets but not run on a local server.
exports.build = parallel(nunjucksMinify, copyFont, css, js, imageMin);
