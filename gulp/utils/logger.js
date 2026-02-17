const chalk = require('chalk');
const fancyLog = require('fancy-log');

const timestamp = () => {
  const now = new Date();
  return now.toLocaleTimeString('ru-RU');
};

const logger = {
  success: (message, taskName = '') => {
    fancyLog(chalk.green(`✓ [${timestamp()}] ${taskName ? `[${taskName}] ` : ''}${message}`));
  },
  
  error: (message, taskName = '') => {
    fancyLog(chalk.red(`✗ [${timestamp()}] ${taskName ? `[${taskName}] ` : ''}${message}`));
  },
  
  info: (message, taskName = '') => {
    fancyLog(chalk.blue(`ℹ [${timestamp()}] ${taskName ? `[${taskName}] ` : ''}${message}`));
  },
  
  warning: (message, taskName = '') => {
    fancyLog(chalk.yellow(`⚠ [${timestamp()}] ${taskName ? `[${taskName}] ` : ''}${message}`));
  },
  
  taskStart: (taskName) => {
    fancyLog(chalk.cyan(`▶ [${timestamp()}] Начало задачи: ${taskName}`));
  },
  
  taskEnd: (taskName, startTime) => {
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    fancyLog(chalk.green(`✓ [${timestamp()}] Задача завершена: ${taskName} (${duration}s)`));
  }
};

module.exports = logger;

