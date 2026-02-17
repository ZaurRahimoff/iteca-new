const { src, dest } = require('gulp');
const svgSprite = require('gulp-svg-sprite');
const svgmin = require('gulp-svgmin');
const plumber = require('gulp-plumber');
const logger = require('../utils/logger');
const paths = require('../utils/paths');

function processSvg() {
  const taskName = 'SVG';
  const startTime = Date.now();
  logger.taskStart(taskName);

  // Оптимизация отдельных SVG
  const optimize = src(`${paths.src.icons}/**/*.svg`)
    .pipe(
      plumber({
        errorHandler: function(err) {
          logger.error(err.message, taskName);
          this.emit('end');
        }
      })
    )
    .pipe(
      svgmin({
        plugins: [
          {
            removeViewBox: false
          },
          {
            removeEmptyAttrs: false
          }
        ]
      })
    )
    .pipe(dest(paths.dist.icons));

  // Генерация sprite
  const sprite = src(`${paths.src.icons}/**/*.svg`)
    .pipe(
      plumber({
        errorHandler: function(err) {
          logger.error(err.message, taskName);
          this.emit('end');
        }
      })
    )
    .pipe(
      svgSprite({
        mode: {
          symbol: {
            sprite: '../sprite.svg',
            render: {
              scss: {
                dest: '../../../src/scss/vendors/_sprite.scss',
                template: 'gulp/templates/sprite-template.scss'
              }
            }
          }
        }
      })
    )
    .pipe(dest(paths.dist.icons));

  return Promise.all([optimize, sprite]).then(() => {
    logger.taskEnd(taskName, startTime);
    logger.success('SVG файлы обработаны (оптимизация и sprite)', taskName);
  });
}

module.exports = processSvg;

