const { src, dest } = require('gulp');
const plumber = require('gulp-plumber');
const logger = require('../utils/logger');
const paths = require('../utils/paths');
const fs = require('fs');
const path = require('path');

function processFonts() {
  const taskName = 'Fonts';
  const startTime = Date.now();
  logger.taskStart(taskName);

  // Копирование шрифтов
  const copyFonts = src(`${paths.src.fonts}/**/*.{woff,woff2,ttf,otf,eot}`)
    .pipe(
      plumber({
        errorHandler: function(err) {
          logger.error(err.message, taskName);
          this.emit('end');
        }
      })
    )
    .pipe(dest(paths.dist.fonts));

  // Генерация миксина для SCSS
  const fontsDir = path.join(process.cwd(), paths.src.fonts);
  const mixinsDir = path.join(process.cwd(), 'src/scss/mixins');

  if (!fs.existsSync(mixinsDir)) {
    fs.mkdirSync(mixinsDir, { recursive: true });
  }

  let fontFaceMixin = '@mixin font-face($font-family, $font-path, $font-weight: normal, $font-style: normal) {\n';
  fontFaceMixin += '  @font-face {\n';
  fontFaceMixin += '    font-family: $font-family;\n';
  fontFaceMixin += '    src: url("#{$font-path}.woff2") format("woff2"),\n';
  fontFaceMixin += '         url("#{$font-path}.woff") format("woff"),\n';
  fontFaceMixin += '         url("#{$font-path}.ttf") format("truetype");\n';
  fontFaceMixin += '    font-weight: $font-weight;\n';
  fontFaceMixin += '    font-style: $font-style;\n';
  fontFaceMixin += '    font-display: swap;\n';
  fontFaceMixin += '  }\n';
  fontFaceMixin += '}\n';

  fs.writeFileSync(path.join(mixinsDir, '_font-face.scss'), fontFaceMixin);

  return copyFonts.on('end', () => {
    logger.taskEnd(taskName, startTime);
    logger.success('Шрифты обработаны и миксин создан', taskName);
  });
}

module.exports = processFonts;

