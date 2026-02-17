const browserSync = require('browser-sync').create();
const logger = require('../utils/logger');
const { getConfig } = require('../config/config');
const { startApiServer, getApiApp } = require('./api-server');

function serve(done) {
  const taskName = 'Serve';
  const startTime = Date.now();
  logger.taskStart(taskName);

  const config = getConfig();
  
  // Определение размера экрана в зависимости от устройства
  let viewportWidth = 1440;
  let viewportHeight = 900;
  
  if (config.device === 'mobile') {
    viewportWidth = 375;
    viewportHeight = 667;
  } else if (config.device === 'tablet') {
    viewportWidth = 768;
    viewportHeight = 1024;
  }

  // Запуск API сервера (синхронно, но не блокируем)
  startApiServer(3002);
  
  // Небольшая задержка для инициализации API сервера
  setTimeout(() => {
    
    browserSync.init({
      server: {
        baseDir: './dist',
        middleware: [
          // Проксирование API запросов на Express сервер
          function(req, res, next) {
            if (req.url.startsWith('/api')) {
              // Если это API запрос, используем Express app напрямую
              const app = getApiApp();
              app(req, res, next);
            } else {
              next();
            }
          }
        ]
      },
    port: 3000,
    open: false, // Не открывать автоматически, откроем control-panel
    notify: false,
    ui: {
      port: 3001
    },
    ghostMode: {
      clicks: true,
      forms: true,
      scroll: true
    },
      watchOptions: {
        ignoreInitial: true
      }
    }, () => {
      logger.taskEnd(taskName, startTime);
      logger.info(`BrowserSync запущен на http://localhost:3000 (${config.device}: ${viewportWidth}x${viewportHeight})`, taskName);
      logger.info(`API Server: http://localhost:3002`, taskName);
      logger.info(`Control Panel: http://localhost:3000/control-panel.html`, taskName);
      
      // Открываем control-panel вместо главной страницы
      setTimeout(async () => {
        try {
          const open = require('open');
          await open('http://localhost:3000/control-panel.html');
        } catch (err) {
          // Игнорируем ошибки открытия браузера
          logger.info('Откройте Control Panel вручную: http://localhost:3000/control-panel.html', taskName);
        }
      }, 500);
    });

    // Экспорт для использования в watch
    global.browserSync = browserSync;
  }, 300); // Задержка 300ms для инициализации API сервера

  done();
}

module.exports = serve;

