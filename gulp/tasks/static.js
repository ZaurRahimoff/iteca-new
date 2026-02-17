const { src, dest } = require('gulp');
const logger = require('../utils/logger');
const paths = require('../utils/paths');

function copyStatic() {
  const taskName = 'Static';
  const startTime = Date.now();
  logger.taskStart(taskName);
  
  // Копируем статические файлы из src/static
  const staticStream = src('src/static/**/*')
    .pipe(dest(paths.dist.html));
  
  // Копируем control-panel из gulp/tools в dist напрямую
  const controlPanelStream = src('gulp/tools/control-panel/control-panel.html')
    .pipe(dest(paths.dist.html));

  // Возвращаем последний stream для завершения задачи
  return controlPanelStream.on('end', () => {
    logger.taskEnd(taskName, startTime);
    logger.success('Статические файлы и Control Panel скопированы', taskName);
  });
}

module.exports = copyStatic;

