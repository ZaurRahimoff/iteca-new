const { src, dest } = require('gulp');
const pug = require('gulp-pug');
const plumber = require('gulp-plumber');
const logger = require('../utils/logger');
const paths = require('../utils/paths');
const fs = require('fs');
const path = require('path');
const { getConfig } = require('../config/config');

function compilePug() {
  const taskName = 'Pug';
  const startTime = Date.now();
  logger.taskStart(taskName);

  // Получаем конфигурацию для передачи переменных в Pug
  const config = getConfig();
  const googleFont = config.typography?.googleFont || '';

  return src([`${paths.src.pug}/pages/**/*.pug`, `!${paths.src.pug}/pages/**/_*.pug`])
    .pipe(
      plumber({
        errorHandler: function(err) {
          logger.error(err.message, taskName);
          this.emit('end');
        }
      })
    )
    .pipe(
      pug({
        pretty: true,
        verbose: true,
        basedir: paths.src.pug,
        doctype: 'html',
        locals: {
          googleFont: googleFont
        }
      })
    )
    .pipe(dest(paths.dist.html))
    .on('data', function(file) {
      if (file.extname === '.html') {
        const filePath = path.join(file.base, file.relative);
        const content = file.contents.toString('utf8');
        fs.writeFileSync(filePath, content, 'utf8');
      }
    })
    .on('end', () => {
      logger.taskEnd(taskName, startTime);
      logger.success('Pug файлы скомпилированы', taskName);
    });
}

module.exports = compilePug;

