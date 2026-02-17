const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const logger = require('../utils/logger');
const paths = require('../utils/paths');
const http = require('http');

function startServer(port = 3000) {
  return new Promise((resolve, reject) => {
    // Проверяем доступность порта, если занят - пробуем другой
    let currentPort = port;
    let attempts = 0;
    const maxAttempts = 5;
    
    const tryStartServer = () => {
      const server = http.createServer((req, res) => {
        const filePath = path.join(process.cwd(), paths.dist.base, req.url === '/' ? 'index.html' : req.url);
        
        fs.readFile(filePath, (err, data) => {
          if (err) {
            res.writeHead(404);
            res.end('File not found');
            return;
          }
          
          const ext = path.extname(filePath);
          const contentType = {
            '.html': 'text/html',
            '.css': 'text/css',
            '.js': 'application/javascript',
            '.json': 'application/json',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.gif': 'image/gif',
            '.svg': 'image/svg+xml',
            '.webp': 'image/webp'
          }[ext] || 'text/plain';
          
          res.writeHead(200, { 'Content-Type': contentType });
          res.end(data);
        });
      });

      server.listen(currentPort, () => {
        logger.info(`Сервер запущен на http://localhost:${currentPort}`, 'Lighthouse');
        resolve({ server, port: currentPort });
      });

      server.on('error', (err) => {
        if (err.code === 'EADDRINUSE' && attempts < maxAttempts) {
          attempts++;
          currentPort++;
          logger.info(`Порт ${currentPort - 1} занят, пробуем ${currentPort}...`, 'Lighthouse');
          tryStartServer();
        } else {
          reject(err);
        }
      });
    };
    
    tryStartServer();
  });
}

function getScoreColor(score) {
  if (score >= 90) return chalk.green;
  if (score >= 50) return chalk.yellow;
  return chalk.red;
}

function getScoreIcon(score) {
  if (score >= 90) return '✅';
  if (score >= 50) return '⚠️';
  return '❌';
}

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function extractRecommendations(lhr) {
  const recommendations = [];
  
  const categories = ['performance', 'accessibility', 'best-practices', 'seo'];
  
  // Маппинг аудитов для Performance, которые содержат детали
  const performanceDiagnostics = {
    'first-contentful-paint': ['render-blocking-resources', 'unminified-css', 'unminified-javascript', 'uses-text-compression', 'uses-optimized-images', 'offscreen-images'],
    'largest-contentful-paint': ['render-blocking-resources', 'unminified-css', 'unminified-javascript', 'uses-optimized-images', 'preload-lcp-image', 'efficient-animated-content'],
    'speed-index': ['render-blocking-resources', 'unminified-css', 'unminified-javascript', 'uses-text-compression', 'uses-optimized-images', 'offscreen-images', 'preload-key-requests']
  };
  
  categories.forEach(category => {
    const categoryData = lhr.categories[category];
    if (!categoryData) return;
    
    const audits = categoryData.auditRefs
      .filter(ref => ref.weight > 0 && lhr.audits[ref.id])
      .map(ref => lhr.audits[ref.id])
      .filter(audit => audit.score !== null && audit.score < 0.9);
    
    if (audits.length > 0) {
      recommendations.push(`\n=== ${categoryData.title} ===`);
      audits.forEach(audit => {
        const score = Math.round(audit.score * 100);
        recommendations.push(`\n${audit.title} (${score}/100)`);
        recommendations.push(`  Описание: ${audit.description}`);
        
        if (audit.displayValue) {
          recommendations.push(`  Текущее значение: ${audit.displayValue}`);
        }
        
        // Для Performance метрик добавляем целевые значения
        if (audit.scoringOptions && category === 'performance') {
          const target = audit.scoringOptions.p10 || audit.scoringOptions.median;
          if (target) {
            recommendations.push(`  Целевое значение: ${(target / 1000).toFixed(1)}s (или меньше)`);
          }
        }
        
        // Для Performance метрик ищем связанные диагностические аудиты
        if (category === 'performance' && performanceDiagnostics[audit.id]) {
          const relatedAudits = performanceDiagnostics[audit.id];
          const actionableItems = [];
          
          relatedAudits.forEach(auditId => {
            const relatedAudit = lhr.audits[auditId];
            if (relatedAudit && relatedAudit.score !== null && relatedAudit.score < 1) {
              if (relatedAudit.details && relatedAudit.details.items && relatedAudit.details.items.length > 0) {
                actionableItems.push({
                  title: relatedAudit.title,
                  items: relatedAudit.details.items.slice(0, 5),
                  savings: relatedAudit.displayValue || relatedAudit.wastedBytes
                });
              }
            }
          });
          
          if (actionableItems.length > 0) {
            recommendations.push(`\n  🔧 Конкретные действия для улучшения:`);
            actionableItems.forEach(action => {
              recommendations.push(`\n    ${action.title}:`);
              if (action.savings) {
                recommendations.push(`      Потенциальная экономия: ${action.savings}`);
              }
              
              action.items.forEach(item => {
                // Обработка разных типов элементов
                if (item.url) {
                  const url = item.url.replace(/^http:\/\/localhost:\d+\//, '');
                  const size = item.totalBytes ? ` (${formatBytes(item.totalBytes)})` : '';
                  const wasted = item.wastedBytes ? ` - можно сэкономить ${formatBytes(item.wastedBytes)}` : '';
                  recommendations.push(`      • Файл: ${url}${size}${wasted}`);
                  
                  // Специфичные рекомендации по типу файла
                  if (url.endsWith('.css')) {
                    recommendations.push(`        → Минифицируйте CSS файл (gulp-clean-css или cssnano)`);
                    recommendations.push(`        → Удалите неиспользуемые CSS правила`);
                  } else if (url.endsWith('.js')) {
                    recommendations.push(`        → Минифицируйте JavaScript файл (gulp-terser)`);
                    recommendations.push(`        → Удалите неиспользуемый код (tree-shaking)`);
                  } else if (/\.(jpg|jpeg|png|gif|webp)$/i.test(url)) {
                    recommendations.push(`        → Используйте WebP формат (npm run images:optimize)`);
                    recommendations.push(`        → Добавьте lazy loading: <img loading="lazy" src="...">`);
                    recommendations.push(`        → Оптимизируйте размер изображения под его отображаемый размер`);
                  }
                } else if (item.node) {
                  const selector = item.node.selector || item.node.snippet || item.node.type;
                  recommendations.push(`      • Элемент: ${selector}`);
                  if (item.node.explanation) {
                    recommendations.push(`        Проблема: ${item.node.explanation.split('\n')[0]}`);
                  }
                } else if (item.label || item.text) {
                  recommendations.push(`      • ${item.label || item.text}`);
                }
              });
            });
          }
        }
        
        // Обработка деталей для других категорий
        if (audit.details && audit.details.items && audit.details.items.length > 0) {
          recommendations.push(`\n  🔍 Проблемные элементы:`);
          audit.details.items.slice(0, 10).forEach(item => {
            if (item.node) {
              const selector = item.node.selector || item.node.snippet || item.node.nodeLabel;
              recommendations.push(`    • ${selector}`);
              if (item.node.explanation) {
                const explanation = item.node.explanation.split('\n')[0];
                recommendations.push(`      Проблема: ${explanation}`);
                recommendations.push(`      Решение: Добавьте aria-label или текст внутри элемента`);
              }
            } else if (item.url) {
              recommendations.push(`    • URL: ${item.url}`);
            } else if (typeof item === 'string') {
              recommendations.push(`    • ${item}`);
            } else if (item.label) {
              recommendations.push(`    • ${item.label}`);
            }
          });
        }
      });
    }
  });
  
  return recommendations.join('\n');
}

async function runLighthouse(url, options = {}) {
  // Динамический импорт для ES модулей
  const lighthouse = await import('lighthouse');
  const chromeLauncherModule = await import('chrome-launcher');
  // chrome-launcher может экспортировать по-разному, проверяем оба варианта
  const chromeLauncher = chromeLauncherModule.default || chromeLauncherModule;
  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });
  options.port = chrome.port;

  try {
    const lighthouseModule = lighthouse.default || lighthouse;
    const runnerResult = await lighthouseModule(url, options);
    await chrome.kill();
    return runnerResult;
  } catch (err) {
    await chrome.kill();
    throw err;
  }
}

async function lighthouseReport() {
  const taskName = 'Lighthouse Report';
  const startTime = Date.now();
  logger.taskStart(taskName);

  const lighthouseDir = path.join(process.cwd(), 'lighthouse');
  if (!fs.existsSync(lighthouseDir)) {
    fs.mkdirSync(lighthouseDir, { recursive: true });
  }

  let serverInfo;
  try {
    // Запускаем сервер
    serverInfo = await startServer(3000);
    const server = serverInfo.server;
    const serverPort = serverInfo.port;
    
    // Ждем немного для стабилизации
    await new Promise(resolve => setTimeout(resolve, 1000));

    logger.info('Запуск Lighthouse...', taskName);

    const options = {
      logLevel: 'info',
      output: ['html', 'json'],
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo']
    };

    const runnerResult = await runLighthouse(`http://localhost:${serverPort}`, options);
    const { lhr, report } = runnerResult;

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const jsonPath = path.join(lighthouseDir, `report-${timestamp}.json`);
    const htmlPath = path.join(lighthouseDir, `report-${timestamp}.html`);
    const recommendationsPath = path.join(lighthouseDir, 'recommendations.txt');

    // Сохраняем JSON отчет
    fs.writeFileSync(jsonPath, JSON.stringify(lhr, null, 2));
    
    // Сохраняем HTML отчет
    // report может быть массивом или строкой в зависимости от версии Lighthouse
    const htmlReport = Array.isArray(report) ? report.find(r => typeof r === 'string') || report[0] : report;
    if (typeof htmlReport === 'string') {
      fs.writeFileSync(htmlPath, htmlReport);
    } else {
      // Если это объект, попробуем использовать report метод
      const lighthouseModule = await import('lighthouse');
      const htmlReportString = lighthouseModule.default.generateReport(lhr, 'html');
      fs.writeFileSync(htmlPath, htmlReportString);
    }
    
    // Сохраняем рекомендации
    const recommendations = extractRecommendations(lhr);
    fs.writeFileSync(recommendationsPath, recommendations);

    logger.taskEnd(taskName, startTime);
    logger.success('✅ Lighthouse отчет создан', taskName);
    logger.info(`ℹ️ JSON отчет: ${path.relative(process.cwd(), jsonPath)}`, taskName);
    logger.info(`ℹ️ HTML отчет: ${path.relative(process.cwd(), htmlPath)}`, taskName);
    logger.info(`ℹ️ Рекомендации: ${path.relative(process.cwd(), recommendationsPath)}`, taskName);

    // Показываем основные метрики
    const categories = ['performance', 'accessibility', 'best-practices', 'seo'];
    categories.forEach(cat => {
      const score = Math.round(lhr.categories[cat].score * 100);
      const color = getScoreColor(score);
      const icon = getScoreIcon(score);
      logger.info(`${icon} ${lhr.categories[cat].title}: ${color(score)}/100`, taskName);
    });

    server.close();
  } catch (err) {
    if (serverInfo && serverInfo.server) {
      serverInfo.server.close();
    }
    logger.error(`Ошибка: ${err.message}`, taskName);
    throw err;
  }
}

async function lighthouseConsole() {
  const taskName = 'Lighthouse Console';
  const startTime = Date.now();
  logger.taskStart(taskName);

  let serverInfo;
  try {
    // Запускаем сервер
    serverInfo = await startServer(3000);
    const server = serverInfo.server;
    const serverPort = serverInfo.port;
    
    // Ждем немного для стабилизации
    await new Promise(resolve => setTimeout(resolve, 1000));

    logger.info('Запуск Lighthouse...', taskName);

    const options = {
      logLevel: 'silent',
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo']
    };

    const runnerResult = await runLighthouse(`http://localhost:${serverPort}`, options);
    const { lhr } = runnerResult;

    logger.taskEnd(taskName, startTime);
    
    console.log('\n' + chalk.bold('📊 Lighthouse Metrics:\n'));
    
    const categories = ['performance', 'accessibility', 'best-practices', 'seo'];
    categories.forEach(cat => {
      const categoryData = lhr.categories[cat];
      const score = Math.round(categoryData.score * 100);
      const color = getScoreColor(score);
      const icon = getScoreIcon(score);
      
      console.log(`${icon} ${chalk.bold(categoryData.title)}: ${color(score)}/100`);
    });

    // Показываем топ проблем
    console.log('\n' + chalk.bold('🔍 Top Issues:\n'));
    
    categories.forEach(cat => {
      const categoryData = lhr.categories[cat];
      const audits = categoryData.auditRefs
        .filter(ref => ref.weight > 0 && lhr.audits[ref.id])
        .map(ref => lhr.audits[ref.id])
        .filter(audit => audit.score !== null && audit.score < 0.9)
        .sort((a, b) => (a.score || 0) - (b.score || 0))
        .slice(0, 3);
      
      if (audits.length > 0) {
        console.log(chalk.cyan(`\n${categoryData.title}:`));
        audits.forEach(audit => {
          const score = Math.round((audit.score || 0) * 100);
          const color = getScoreColor(score);
          const icon = getScoreIcon(score);
          console.log(`  ${icon} ${color(score)}/100 - ${audit.title}`);
        });
      }
    });

    console.log('');
    logger.success('✅ Lighthouse анализ завершен', taskName);

    server.close();
  } catch (err) {
    if (serverInfo && serverInfo.server) {
      serverInfo.server.close();
    }
    logger.error(`Ошибка: ${err.message}`, taskName);
    throw err;
  }
}

function cleanLighthouse() {
  const taskName = 'Clean Lighthouse';
  const startTime = Date.now();
  logger.taskStart(taskName);

  const del = require('del');
  const lighthouseDir = path.join(process.cwd(), 'lighthouse');

  return del([lighthouseDir]).then(() => {
    logger.taskEnd(taskName, startTime);
    logger.success('✅ Папка lighthouse очищена', taskName);
  });
}

const lighthouseTask = lighthouseReport;
lighthouseTask.console = lighthouseConsole;
lighthouseTask.clean = cleanLighthouse;

module.exports = lighthouseTask;

