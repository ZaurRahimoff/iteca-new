const { dest, series } = require('gulp');
const del = require('del');
const logger = require('../utils/logger');
const paths = require('../utils/paths');

function cleanDist() {
  const taskName = 'Clean';
  const startTime = Date.now();
  logger.taskStart(taskName);

  return del([paths.dist.base]).then(() => {
    logger.taskEnd(taskName, startTime);
    logger.success('Папка dist очищена', taskName);
  });
}

module.exports = cleanDist;

