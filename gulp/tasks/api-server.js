const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const logger = require('../utils/logger');
const { getConfig, updateConfig } = require('../config/config');
const paths = require('../utils/paths');

const execAsync = promisify(exec);

let apiApp = null;
let apiServer = null;

function createApiServer() {
  if (apiApp) {
    return apiApp;
  }

  apiApp = express();
  apiApp.use(cors());
  apiApp.use(bodyParser.json());
  apiApp.use(bodyParser.urlencoded({ extended: true }));

  // Root endpoint для проверки работоспособности
  apiApp.get('/', (req, res) => {
    res.json({ 
      status: 'ok', 
      message: 'Gulp Control Panel API',
      version: '1.0.0'
    });
  });

  // Получить список страниц проекта
  apiApp.get('/api/pages', (req, res) => {
    try {
      const distDir = path.join(process.cwd(), paths.dist.html);
      if (!fs.existsSync(distDir)) {
        return res.json({ pages: [] });
      }

      const files = fs.readdirSync(distDir);
      const htmlPages = files
        .filter(file => file.endsWith('.html') && file !== 'control-panel.html') // Исключаем control-panel из списка страниц проекта
        .map(file => ({
          name: file.replace('.html', ''),
          url: `/${file}`,
          path: file
        }));

      res.json({ pages: htmlPages });
    } catch (err) {
      logger.error(err.message, 'API Server');
      res.status(500).json({ error: err.message });
    }
  });

  // Получить текущую конфигурацию
  apiApp.get('/api/config', (req, res) => {
    try {
      const config = getConfig();
      res.json(config);
    } catch (err) {
      logger.error(err.message, 'API Server');
      res.status(500).json({ error: err.message });
    }
  });

  // Обновить конфигурацию
  apiApp.post('/api/config', async (req, res) => {
    try {
      const newConfig = req.body;
      await updateConfig(newConfig);
      res.json({ success: true, config: newConfig });
    } catch (err) {
      logger.error(err.message, 'API Server');
      res.status(500).json({ error: err.message });
    }
  });

  // Получить список Google Fonts
  apiApp.get('/api/fonts', async (req, res) => {
    try {
      // Популярные Google Fonts без API ключа (можно использовать публичный API)
      const popularFonts = [
        'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Oswald', 'Raleway',
        'Poppins', 'Source Sans Pro', 'Playfair Display', 'Merriweather',
        'PT Sans', 'Ubuntu', 'Dosis', 'Nunito', 'Crimson Text', 'Bitter',
        'Arimo', 'Titillium Web', 'Lora', 'Fjalla One', 'Noto Sans',
        'Dancing Script', 'Indie Flower', 'Pacifico', 'Amatic SC', 'Bebas Neue',
        'Anton', 'Cabin', 'Droid Sans', 'Droid Serif', 'Josefin Sans',
        'Libre Baskerville', 'Oxygen', 'Quicksand', 'Slabo 27px', 'Varela Round'
      ];
      
      const fonts = popularFonts.map(font => ({
        family: font,
        category: 'sans-serif',
        variants: ['400', '700'],
        files: {}
      }));
      
      res.json({ fonts });
    } catch (err) {
      logger.error(err.message, 'API Server');
      res.status(500).json({ error: err.message });
    }
  });

  // Сохранить выбранный Google Font
  apiApp.post('/api/font', async (req, res) => {
    try {
      const { fontFamily } = req.body;
      
      if (!fontFamily) {
        return res.status(400).json({ error: 'Имя шрифта обязательно' });
      }
      
      // Обновляем конфигурацию
      const config = getConfig();
      if (!config.typography) config.typography = {};
      config.typography.googleFont = fontFamily;
      config.typography.baseFont = `${fontFamily}, sans-serif`;
      
      await updateConfig(config);
      
      res.json({ success: true, message: `Шрифт ${fontFamily} сохранен. Перезапустите сборку для применения.` });
    } catch (err) {
      logger.error(err.message, 'API Server');
      res.status(500).json({ error: err.message });
    }
  });

  // Установить/удалить библиотеку
  apiApp.post('/api/library/:name', async (req, res) => {
    try {
      const libName = req.params.name;
      const action = req.body.action; // 'install' or 'uninstall'
      
      // Маппинг имен библиотек для npm
      const libMap = {
        'bootstrap': 'bootstrap',
        'fontAwesome': '@fortawesome/fontawesome-free',
        'swiper': 'swiper',
        'jquery': 'jquery',
        'gsap': 'gsap'
      };
      
      const npmName = libMap[libName] || libName;

      if (action === 'install') {
        logger.info(`Установка библиотеки: ${npmName}...`, 'API Server');
        
        // Проверяем, установлена ли уже
        try {
          require.resolve(npmName);
          logger.info(`Библиотека ${npmName} уже установлена`, 'API Server');
        } catch (e) {
          await execAsync(`npm install ${npmName} --save-dev`, { cwd: process.cwd() });
        }
        
        // Обновить конфигурацию
        const config = getConfig();
        if (!config.libraries) config.libraries = {};
        config.libraries[libName] = true;
        await updateConfig(config);
        
        res.json({ success: true, message: `Библиотека ${npmName} установлена` });
      } else if (action === 'uninstall') {
        logger.info(`Удаление библиотеки: ${npmName}...`, 'API Server');
        
        try {
          await execAsync(`npm uninstall ${npmName}`, { cwd: process.cwd() });
        } catch (e) {
          // Игнорируем ошибки если библиотека не установлена
        }
        
        const config = getConfig();
        if (!config.libraries) config.libraries = {};
        config.libraries[libName] = false;
        await updateConfig(config);
        
        res.json({ success: true, message: `Библиотека ${npmName} удалена` });
      } else {
        res.status(400).json({ error: 'Неверное действие' });
      }
    } catch (err) {
      logger.error(err.message, 'API Server');
      res.status(500).json({ error: err.message });
    }
  });

  // Генерация компонента
  apiApp.post('/api/component', async (req, res) => {
    try {
      const { blockName, snippetType } = req.body;
      
      if (!blockName) {
        return res.status(400).json({ error: 'Имя компонента обязательно' });
      }
      
      // Импортируем функцию генерации напрямую
      const bemTask = require('./bem');
      const path = require('path');
      const fs = require('fs');
      
      // Вызываем функцию создания блока напрямую
      const baseDir = path.join(process.cwd(), 'src');
      await bemTask.createBemBlockDirect(blockName, snippetType || '', baseDir);
      
      res.json({ success: true, message: `Компонент ${blockName} создан` });
    } catch (err) {
      logger.error(err.message, 'API Server');
      res.status(500).json({ error: err.message });
    }
  });

  // Изменить viewport размер
  apiApp.post('/api/viewport', async (req, res) => {
    try {
      const { device } = req.body;
      const config = getConfig();
      config.device = device;
      await updateConfig(config);
      
      res.json({ success: true, device, config });
    } catch (err) {
      logger.error(err.message, 'API Server');
      res.status(500).json({ error: err.message });
    }
  });

  // Получить сниппеты компонентов
  apiApp.get('/api/snippets', (req, res) => {
    const snippets = {
      navbar: {
        name: 'Navbar',
        variants: ['mobile', 'desktop', 'sticky'],
        description: 'Навигационная панель'
      },
      card: {
        name: 'Card',
        variants: ['basic', 'image', 'action', 'hover'],
        description: 'Карточка контента'
      },
      button: {
        name: 'Button',
        variants: ['primary', 'secondary', 'outline', 'ghost'],
        description: 'Кнопка'
      },
      header: {
        name: 'Header',
        variants: ['simple', 'with-menu', 'centered'],
        description: 'Шапка сайта'
      },
      footer: {
        name: 'Footer',
        variants: ['simple', 'columns', 'social'],
        description: 'Подвал сайта'
      }
    };
    
    res.json({ snippets });
  });

  // Получить детали сниппета
  apiApp.get('/api/snippet/:type/:variant', (req, res) => {
    const { type, variant } = req.params;
    // Здесь можно вернуть детали конкретного сниппета
    res.json({ type, variant, data: {} });
  });

  return apiApp;
}

function startApiServer(port = 3002) {
  if (apiServer) {
    return apiServer;
  }

  const app = createApiServer();
  apiServer = app.listen(port, () => {
    logger.info(`API Server запущен на http://localhost:${port}`, 'API Server');
  });

  return apiServer;
}

function stopApiServer() {
  if (apiServer) {
    apiServer.close();
    apiServer = null;
  }
}

module.exports = {
  createApiServer,
  startApiServer,
  stopApiServer,
  getApiApp: () => apiApp || createApiServer()
};

