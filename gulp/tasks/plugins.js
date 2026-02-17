const { src, dest } = require('gulp');
const logger = require('../utils/logger');
const paths = require('../utils/paths');

function copyPlugins() {
  const taskName = 'Plugins';
  const startTime = Date.now();
  logger.taskStart(taskName);
  
  return src(`${paths.src.plugins}/**/*`)
    .pipe(dest(paths.dist.plugins))
    .on('end', () => {
      logger.taskEnd(taskName, startTime);
      logger.success('Плагины скопированы', taskName);
    });
}

module.exports = copyPlugins;

