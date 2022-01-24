const { src, dest, series, parallel } = require('gulp');
const uglify = require('gulp-uglify')
const babel = require('gulp-babel');
const concat = require('gulp-concat');
const rename = require("gulp-rename");
const cleancss = require('gulp-clean-css')
const gutil = require("gulp-util");
const del = require('del')

const conf = {
  output: 'lib',    // 生产路径
  mangle: true,     // 压缩时开启修改变量名
}


let clean = async () => {
  await del(['lib']);
}


let babelJs = () => {
  return src([
    'src/*.js',
    ])
    .pipe(babel())
    .pipe(uglify({mangle: conf.mangle}))
    .on('error', function(err) {
      gutil.log(gutil.colors.red('[Error]'), err.toString());
    })
    .pipe(rename({
      suffix: "-min",
    }))
    .pipe(dest(conf.output));
}

let clearCss = () => {
  return src([
    'src/*.css',
    ])
    .pipe(cleancss())
    .pipe(rename({
      suffix: "-min",
    }))
    .pipe(dest(conf.output));
}



exports.build = series(clean, parallel(babelJs, clearCss))
exports.dev = series(clean, parallel(babelJs, clearCss))