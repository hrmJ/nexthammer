// Gulp.js configuration
var 
    // modules
    gulp = require('gulp'),
    newer = require('gulp-newer'),
    concat = require('gulp-concat'),
    deporder = require('gulp-deporder'),
    sass = require('gulp-ruby-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    babel = require('gulp-babel');




//gulp.task("js",function(){
//    //Huom: tiedostojen järjestys oleellinen: mieti, mikä pitää olla ladattuna ennen mitäkin
//    var jsfiles = ['interface_events.js'];
//    var jsbuild = gulp.src(jsfiles).pipe(deporder()).pipe(concat('main.js'));
//    return jsbuild.pipe(gulp.dest(folder.build));
//});
//
gulp.task("jsx", function(){
    return gulp.src("jsx/**/*")
        .pipe(babel({
            plugins: ['transform-react-jsx']
        }))
        .pipe(concat('react.js'))
        .pipe(gulp.dest("js/src/"));
});


gulp.task("js",function(){
    var jsfiles = ['js/src/utilities.js',
                   'js/src/corpus_desktop.js',
                   'js/src/setup_loaders.js',
                   'js/src/corpus_actions.js',
                   'js/src/corpus_management_actions.js',
                   'js/src/ldr_tab.js',
                   'js/src/interface_events.js',
                   'js/src/react.js',
                    ];
    var jsbuild = gulp.src(jsfiles)
        .pipe(babel({
                    presets: ['@babel/env']
                }))
        .pipe(deporder())
        .pipe(concat('main.js'));
    return jsbuild.pipe(gulp.dest('js/build/'));
});

gulp.task("css",function(){
        var sass_folder = "sass/**/*.scss";
        gulp.src(sass_folder)
    	sass(sass_folder)
		.on('error', sass.logError)
		.pipe(gulp.dest('css/'))
});


//gulp.task("php",function(){
//    gulp.src("corpustools/topics_interface/php/*.php").pipe(newer("tests/")).pipe(gulp.dest("tests/"));
//});

//gulp.task("csspres",function(){
//        gulp.src(folder.src + "sass/presentation/**/*.scss")
//    	sass(folder.src + "sass/presentation/**/*.scss")
//		.on('error', sass.logError)
//		.pipe(gulp.dest(folder.build + "stylesheets/presentation"))
//});


gulp.task("watch",function(){

    gulp.watch("jsx/**/*",["jsx"]);
    gulp.watch("js/src/*.js",["js"]);
    gulp.watch("sass/**/*",["css"]);

});

gulp.task('run',['jsx', 'js','css']);
gulp.task('default',['run','watch']);
