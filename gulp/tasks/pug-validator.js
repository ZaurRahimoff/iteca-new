const { src } = require('gulp');
const pugLint = require('pug-lint');
const { validate } = require('html-validator');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const glob = require('glob');
const logger = require('../utils/logger');
const paths = require('../utils/paths');

// Конфигурация pug-lint
const pugLintConfig = {
  disallowIdLiterals: false,
  disallowClassLiterals: false,
  disallowDuplicateAttributes: true,
  disallowHtmlText: false,
  disallowAttributeInterpolation: false,
  disallowBlockExpansion: false,
  disallowStringInterpolation: false,
  disallowSpacesInsideAttributeBrackets: false,
  disallowTrailingSpaces: true,
  disallowMultipleBlankLines: true,
  disallowStringConcatenation: false,
  requireClassLiteralsBeforeIdLiterals: false,
  requireStrictEqualityOperators: false,
  requireLowerCaseAttributes: true,
  requireLowerCaseTags: true,
  requireLineFeedAtFileEnd: true,
  requireSpaceAfterCodeOperator: true,
  requireSpecificAttributes: [],
  validateAttributeSeparator: ', ',
  validateAttributeQuoteMarks: '"',
  validateDivTags: true,
  validateIndentation: 2,
  validateExtensions: true,
  validateSelfClosingTags: true,
  validateTemplateString: true
};

function validatePugSyntax() {
  const taskName = 'Pug Syntax Validator';
  const startTime = Date.now();
  logger.taskStart(taskName);

  const pugFiles = glob.sync(`${paths.src.pug}/**/*.pug`, {
    ignore: ['**/node_modules/**', '**/dist/**']
  });

  let totalErrors = 0;
  let totalWarnings = 0;
  const errors = [];
  const warnings = [];

  pugFiles.forEach(filePath => {
    const fileName = path.relative(process.cwd(), filePath);
    
    try {
      const linter = new pugLint();
      linter.configure(pugLintConfig);
      const issues = linter.checkFile(filePath);

      if (issues && issues.length > 0) {
        logger.info(`Проверка файла: ${fileName}`, taskName);
        
        issues.forEach(issue => {
          // pug-lint возвращает ошибки в формате pug-error
          const isError = issue.code && issue.code.startsWith('PARSE');
          const icon = isError ? '❌' : '⚠️';
          const color = isError ? chalk.red : chalk.yellow;
          const type = isError ? 'ERROR' : 'WARNING';
          
          if (isError) {
            totalErrors++;
            errors.push({ file: fileName, issue });
          } else {
            totalWarnings++;
            warnings.push({ file: fileName, issue });
          }

          const line = issue.line || issue.lineNum || '?';
          const column = issue.column || issue.col || '?';
          const message = issue.message || issue.msg || 'Unknown error';
          const code = issue.code || 'UNKNOWN';
          console.log(`${icon} ${color(type)} ${chalk.blue(fileName)}:${chalk.gray(line)}:${chalk.gray(column)} - ${message}`);
          console.log(`   ${chalk.gray(`Правило: ${code}`)}`);
        });
      }
    } catch (err) {
      logger.error(`Ошибка при проверке ${fileName}: ${err.message}`, taskName);
      totalErrors++;
    }
  });

  logger.taskEnd(taskName, startTime);

  if (totalErrors === 0 && totalWarnings === 0) {
    logger.success(`✅ Синтаксис Pug файлов проверен успешно! (${pugFiles.length} файлов)`, taskName);
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

async function validatePugHtml() {
  const taskName = 'Pug HTML Validator';
  const startTime = Date.now();
  logger.taskStart(taskName);

  // Проверяем скомпилированные HTML файлы
  const htmlFiles = fs.readdirSync(paths.dist.html)
    .filter(file => file.endsWith('.html'))
    .map(file => path.join(paths.dist.html, file));

  let totalErrors = 0;
  let totalWarnings = 0;

  logger.info(`ℹ️ Проверка скомпилированных HTML файлов из Pug (${htmlFiles.length} файлов)`, taskName);

  for (const filePath of htmlFiles) {
    const fileName = path.basename(filePath);
    const content = fs.readFileSync(filePath, 'utf8');
    
    try {
      const options = {
        data: content,
        format: 'json'
      };

      const result = await validate(options);
      
      if (result.messages && result.messages.length > 0) {
        logger.info(`Проверка файла: ${fileName}`, taskName);
        
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
      totalErrors++;
    }
  }

  logger.taskEnd(taskName, startTime);
  
  if (totalErrors === 0 && totalWarnings === 0) {
    logger.success('✅ HTML валидация скомпилированных Pug файлов пройдена успешно!', taskName);
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

const pugValidator = {};
pugValidator.syntax = validatePugSyntax;
pugValidator.html = validatePugHtml;

module.exports = pugValidator;

