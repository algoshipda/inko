'use strict';

import gulp from 'gulp';
import gutil from 'gulp-util';
import uglify from 'gulp-uglify-es';
import mocha from 'gulp-mocha';
import rename from 'gulp-rename';
import sourcemaps from 'gulp-sourcemaps';
import pump from 'pump';
import del from 'del';

const DIR = {
    DEST: 'dist'
};

gulp.task('clean', () => {
    return del.sync([DIR.DEST]);
});

gulp.task('test', () =>
    gulp.src('test/**/*.js')
        .pipe(mocha())
);

gulp.task('watch', () => {
    gulp.watch(['inko.js', 'gulpfile.babel.js', 'test/**/*.js'], ['test'])
});


gulp.task('build', (cb) => {
    pump([gulp.src('inko.js'), sourcemaps.init(),
        rename('inko.min.js'), uglify(), sourcemaps.write('.'),
        gulp.dest('dist'),
    ], cb);
})

gulp.task('default', ['watch', 'clean', 'test'], () => {
    gutil.log('Gulp is running...');
});