const gulp = require("gulp");
const { parallel, series } = require("gulp");

const imagemin = require("gulp-imagemin");
const htmlmin = require("gulp-htmlmin");
const uglify = require("gulp-uglify");
const sourcemaps = require("gulp-sourcemaps");
const sass = require("gulp-sass")(require("sass"));
const concat = require("gulp-concat");
const browserSync = require("browser-sync").create(); //https://browsersync.io/docs/gulp#page-top
const nunjucksRender = require("gulp-nunjucks-render");
const autoprefixer = require("gulp-autoprefixer");
const babel = require("gulp-babel");
const purgecss = require("gulp-purgecss");

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
    // .pipe(sourcemaps.init())
    .pipe(sass({ outputStyle: "expanded" }).on("error", sass.logError))
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
    // .pipe(sourcemaps.write())
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
