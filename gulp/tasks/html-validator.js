const { src } = require('gulp');
const htmlhint = require('gulp-htmlhint');
const validate = require('html-validator');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');
const paths = require('../utils/paths');
const { series } = require('gulp');

// Конфигурация htmlhint
const htmlhintConfig = {
  'tagname-lowercase': true,
  'attr-lowercase': true,
  'attr-value-double-quotes': true,
  'doctype-first': true,
  'tag-pair': true,
  'spec-char-escape': true,
  'id-unique': true,
  'src-not-empty': true,
  'attr-no-duplication': true,
  'title-require': true,
  'alt-require': true
};

function formatHtmlHintResult(result) {
  const icon = result.type === 'error' ? '❌' : '⚠️';
  const color = result.type === 'error' ? chalk.red : chalk.yellow;
  const file = path.relative(process.cwd(), result.file);
  return `${icon} ${color(result.type.toUpperCase())} ${chalk.blue(file)}:${chalk.gray(result.line)}:${chalk.gray(result.col)} - ${result.message} ${chalk.gray(`(${result.rule.id})`)}`;
}

function validateHtmlHint() {
  const taskName = 'HTML Hint Validator';
  const startTime = Date.now();
  logger.taskStart(taskName);

  let errorCount = 0;
  let warningCount = 0;

  return src(`${paths.dist.html}/**/*.html`)
    .pipe(htmlhint(htmlhintConfig))
    .pipe(htmlhint.reporter((file, fileCollection, resultCollection) => {
      if (resultCollection.length > 0) {
        logger.info(`Проверка файла: ${path.relative(process.cwd(), file.path)}`, taskName);
        
        resultCollection.forEach(result => {
          if (result.type === 'error') {
            errorCount++;
          } else {
            warningCount++;
          }
          console.log(formatHtmlHintResult({ ...result, file: file.path }));
        });
      }
    }))
    .on('end', () => {
      logger.taskEnd(taskName, startTime);
      
      if (errorCount === 0 && warningCount === 0) {
        logger.success('✅ HTML валидация пройдена успешно!', taskName);
      } else {
        if (errorCount > 0) {
          logger.error(`❌ Найдено ошибок: ${errorCount}`, taskName);
        }
        if (warningCount > 0) {
          logger.warning(`⚠️ Найдено предупреждений: ${warningCount}`, taskName);
        }
      }
    });
}

async function validateW3C() {
  const taskName = 'W3C HTML Validator';
  const startTime = Date.now();
  logger.taskStart(taskName);

  const htmlFiles = fs.readdirSync(paths.dist.html)
    .filter(file => file.endsWith('.html'))
    .map(file => path.join(paths.dist.html, file));

  let totalErrors = 0;
  let totalWarnings = 0;

  for (const filePath of htmlFiles) {
    const fileName = path.basename(filePath);
    const content = fs.readFileSync(filePath, 'utf8');
    
    try {
      logger.info(`ℹ️ Проверка через W3C Validator: ${fileName}`, taskName);
      
      const options = {
        data: content,
        format: 'json'
      };

      const result = await validate(options);
      
      if (result.messages && result.messages.length > 0) {
        result.messages.forEach(msg => {
          const icon = msg.type === 'error' ? '❌' : '⚠️';
          const color = msg.type === 'error' ? chalk.red : chalk.yellow;
          
          if (msg.type === 'error') {
            totalErrors++;
          } else {
            totalWarnings++;
          }

          const location = msg.lastLine ? `:${chalk.gray(msg.lastLine)}:${chalk.gray(msg.lastColumn || 0)}` : '';
          console.log(`${icon} ${color(msg.type.toUpperCase())} ${chalk.blue(fileName)}${location} - ${msg.message}`);
          
          if (msg.extract) {
            console.log(`   ${chalk.gray('Код:')} ${chalk.gray(msg.extract.trim())}`);
          }
        });
      } else {
        logger.success(`✅ ${fileName} - валидация пройдена`, taskName);
      }
    } catch (err) {
      logger.error(`Ошибка при проверке ${fileName}: ${err.message}`, taskName);
    }
  }

  logger.taskEnd(taskName, startTime);
  
  if (totalErrors === 0 && totalWarnings === 0) {
    logger.success('✅ W3C валидация пройдена успешно!', taskName);
  } else {
    if (totalErrors > 0) {
      logger.error(`❌ Найдено ошибок: ${totalErrors}`, taskName);
    }
    if (totalWarnings > 0) {
      logger.warning(`⚠️ Найдено предупреждений: ${totalWarnings}`, taskName);
    }
  }

  return Promise.resolve();
}

function validateHtml(done) {
  return series(validateHtmlHint, validateW3C)(done);
}

function fixHtml() {
  const taskName = 'HTML Fix';
  const startTime = Date.now();
  logger.taskStart(taskName);

  // htmlhint не имеет встроенного автофикса, но можно использовать htmlhint CLI
  // Для простоты просто запускаем валидацию с предупреждениями
  logger.info('ℹ️ HTML автофикс: проверка и рекомендации', taskName);
  
  return src(`${paths.dist.html}/**/*.html`)
    .pipe(htmlhint(htmlhintConfig))
    .pipe(htmlhint.reporter((file, fileCollection, resultCollection) => {
      if (resultCollection.length > 0) {
        const fileName = path.relative(process.cwd(), file.path);
        logger.info(`Файл: ${fileName}`, taskName);
        logger.info(`Рекомендации по исправлению:`, taskName);
        
        resultCollection.forEach(result => {
          const icon = result.type === 'error' ? '❌' : '⚠️';
          const color = result.type === 'error' ? chalk.red : chalk.yellow;
          console.log(`${icon} ${color(result.rule.id)}: ${result.message}`);
          console.log(`   ${chalk.gray(`Строка ${result.line}, колонка ${result.col}`)}`);
        });
      }
    }))
    .on('end', () => {
      logger.taskEnd(taskName, startTime);
      logger.success('✅ Рекомендации по исправлению HTML выведены', taskName);
      logger.info('ℹ️ Исправьте ошибки вручную на основе рекомендаций выше', taskName);
    });
}

const htmlValidator = validateHtml;
htmlValidator.hint = validateHtmlHint;
htmlValidator.w3c = validateW3C;
htmlValidator.fix = fixHtml;

module.exports = htmlValidator;

