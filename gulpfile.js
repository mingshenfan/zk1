var gulp = require("gulp");
var sass = require("gulp-sass");
var autoprefixer = require("gulp-autoprefixer");
var minCss = require("gulp-clean-css");
var concat = require("gulp-concat");

var uglify = require("gulp-uglify");
var minHtml = require("gulp-htmlmin");
var clean = require("gulp-clean");
var sequence = require("gulp-sequence");
var server = require("gulp-webserver");
var rev = require("gulp-rev");
var revCollector = require("gulp-rev-collector");

var list = require("./src/data/list.json");

//gulp-sass                把sass文件编译为css文件
//gulp-less                把less文件编译为css文件
//gulp-autoprefixer        自动添加前缀
//gulp-clean-css           压缩css
//gulp-concat              合并文件
//gulp-uglify              压缩js文件
//gulp-htmlmin             压缩html 
//gulp-clean               删除文件
//gulp-sequence            设置gulp任务的执行顺序
//gulp-webserver           起服务
//gulp-rev                 文件名后添加MD5后缀
//gulp-rev-collector       替换路径

gulp.task("clean", function() {
    return gulp.src("build")
        .pipe(clean())
})

gulp.task("css", function() {
    return gulp.src("src/css/*.scss")
        .pipe(sass())
        .pipe(autoprefixer({
            browsers: ["last 2 versions", "Android >= 4.0"]
        }))
        .pipe(minCss())
        .pipe(concat("all.min.css"))
        .pipe(rev()) //生成MD5加密的后缀名
        .pipe(gulp.dest("build/css"))
        .pipe(rev.manifest())
        .pipe(gulp.dest("rev/css"))
})

//压缩js文件
gulp.task("uglify", function() {
    return gulp.src(["src/js/**/*.js", "!src/js/**/*.min.js"])
        .pipe(uglify())
        .pipe(gulp.dest("build/js"))
})

gulp.task("copy", function() {
    return gulp.src("src/js/**/*.min.js")
        .pipe(gulp.dest("build/js"))
})

var options = {
    removeComments: true, //清除HTML注释
    collapseWhitespace: true, //压缩HTML
    // collapseBooleanAttributes: true, //省略布尔属性的值 <input checked="true"/> ==> <input />
    // removeEmptyAttributes: true, //删除所有空格作属性值 <input id="" /> ==> <input />
    // removeScriptTypeAttributes: true, //删除<script>的type="text/javascript"
    // removeStyleLinkTypeAttributes: true, //删除<style>和<link>的type="text/css"
    // minifyJS: true, //压缩页面JS
    // minifyCSS: true //压缩页面CSS
};

gulp.task("minHtml", function() {
    return gulp.src(["rev/**/*.json", "src/**/*.html"])
        .pipe(revCollector({
            replaceReved: true
        }))
        .pipe(minHtml(options))
        .pipe(gulp.dest("build"))
})

gulp.task("watch", function() {
    gulp.watch("src/css/*.scss", ["css", "minHtml"])
    gulp.watch("src/*.html", ["minHtml"])
})

//起服务

gulp.task("server", function() {
    gulp.src("build")
        .pipe(server({
            port: 9090, //  端口号
            open: true, //自动打开浏览器
            livereload: true, //自动刷新浏览器
            host: "169.254.204.130", //配置ip地址
            middleware: function(req, res, next) { //拦截前端请求
                if (req.url === '/api/list') {
                    res.end(JSON.stringify(list))
                }
                next()
            }
        }))
})

gulp.task("default", function(cb) {
    sequence("clean", ["css", "uglify", "copy", "minHtml"], "watch", "server", cb)
})