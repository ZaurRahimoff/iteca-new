const { src, dest } = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const autoprefixer = require('gulp-autoprefixer');
const sourcemaps = require('gulp-sourcemaps');
const cleanCSS = require('gulp-clean-css');
const rename = require('gulp-rename');
const plumber = require('gulp-plumber');
const logger = require('../utils/logger');
const paths = require('../utils/paths');
const path = require('path');
const through2 = require('through2');

function compileScss() {
  const taskName = 'SCSS';
  const startTime = Date.now();
  logger.taskStart(taskName);

  // Компиляция SCSS
  const stream = src(`${paths.src.scss}/main.scss`)
    .pipe(
      plumber({
        errorHandler: function(err) {
          // Игнорируем ошибки в map файлах
          if (!err.message.includes('.map')) {
            logger.error(err.message, taskName);
          }
          this.emit('end');
        }
      })
    )
    .pipe(sourcemaps.init())
    .pipe(
      sass({
        outputStyle: 'expanded',
        includePaths: [
          paths.src.scss,
          path.join(process.cwd(), 'node_modules')
        ]
      }).on('error', function(err) {
        // Игнорируем ошибки в map файлах
        if (!err.message.includes('.map')) {
          logger.error(err.message, taskName);
        }
      })
    )
    .pipe(autoprefixer({
      overrideBrowserslist: ['last 3 versions', '>1%', 'not dead']
    }));

  // Обычная версия с sourcemaps
  stream
    .pipe(sourcemaps.write('.'))
    .pipe(rename({ basename: 'normal' }))
    .pipe(dest(paths.dist.css));

  // Минифицированная версия с sourcemaps
  stream
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(
      cleanCSS({
        compatibility: 'ie8',
        level: 2
      })
    )
    .pipe(rename({ basename: 'normal', suffix: '.min' }))
    .pipe(sourcemaps.write('.', { includeContent: false, sourceRoot: '../src/scss' }))
    .pipe(dest(paths.dist.css))
    .on('end', () => {
      logger.taskEnd(taskName, startTime);
      logger.success('SCSS файлы скомпилированы (normal.css и normal.min.css)', taskName);
    });

  return stream;
}

module.exports = compileScss;
