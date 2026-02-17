const { dest } = require('gulp');
const browserify = require('browserify');
const babelify = require('babelify');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const sourcemaps = require('gulp-sourcemaps');
const terser = require('gulp-terser');
const rename = require('gulp-rename');
const logger = require('../utils/logger');
const paths = require('../utils/paths');
const { pipeline } = require('stream');

function compileJs() {
  const taskName = 'JavaScript';
  const startTime = Date.now();
  logger.taskStart(taskName);

  return new Promise((resolve, reject) => {
    const bundler = browserify({
      entries: `${paths.src.js}/main.js`,
      debug: true,
      transform: [
        [
          babelify,
          {
            presets: ['@babel/preset-env']
          }
        ]
      ]
    });

    bundler
      .bundle()
      .on('error', function(err) {
        logger.error(err.message, taskName);
        reject(err);
      })
      .pipe(source('script.js'))
      .pipe(buffer())
      .pipe(sourcemaps.init({ loadMaps: true }))
      .pipe(sourcemaps.write('.'))
      .pipe(dest(paths.dist.js))
      .on('end', () => {
        // Минифицированная версия
        const bundlerMin = browserify({
          entries: `${paths.src.js}/main.js`,
          debug: true,
          transform: [
            [
              babelify,
              {
                presets: ['@babel/preset-env']
              }
            ]
          ]
        });

        bundlerMin
          .bundle()
          .on('error', function(err) {
            logger.error(err.message, taskName);
            reject(err);
          })
          .pipe(source('script.js'))
          .pipe(buffer())
          .pipe(sourcemaps.init({ loadMaps: true }))
          .pipe(terser({
            compress: true,
            mangle: true
          }))
          .pipe(rename({ suffix: '.min' }))
          .pipe(sourcemaps.write('.'))
          .pipe(dest(paths.dist.js))
          .on('end', () => {
            logger.taskEnd(taskName, startTime);
            logger.success('JavaScript файлы скомпилированы (script.js и script.min.js)', taskName);
            resolve();
          });
      });
  });
}

module.exports = compileJs;
