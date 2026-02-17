const { src, dest, series } = require('gulp');
const eslint = require('gulp-eslint');
const stylelint = require('stylelint');
const prettier = require('prettier');
const logger = require('../utils/logger');
const paths = require('../utils/paths');
const { validateProject } = require('../utils/bem-validator');
const through2 = require('through2');
const fs = require('fs');

function lintJs() {
  const taskName = 'Lint JS';
  const startTime = Date.now();
  logger.taskStart(taskName);

  return src([`${paths.src.js}/**/*.js`, `!${paths.src.js}/vendor/**/*.js`])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError())
    .on('end', () => {
      logger.taskEnd(taskName, startTime);
      logger.success('JavaScript линтинг завершён', taskName);
    });
}

function lintScss() {
  const taskName = 'Lint SCSS';
  const startTime = Date.now();
  logger.taskStart(taskName);

  return stylelint
    .lint({
      files: [`${paths.src.scss}/**/*.scss`, `!${paths.src.scss}/**/*.map`, `!${paths.dist.css}/**/*`],
      formatter: 'string',
      ignorePath: '.stylelintignore'
    })
    .then(function(data) {
      if (data.output) {
        logger.error(data.output, taskName);
      } else {
        logger.taskEnd(taskName, startTime);
        logger.success('SCSS линтинг завершён', taskName);
      }
    })
    .catch(function(err) {
      logger.error(err.message, taskName);
    });
}

function fixJs() {
  const taskName = 'Fix JS';
  const startTime = Date.now();
  logger.taskStart(taskName);

  return src([`${paths.src.js}/**/*.js`, `!${paths.src.js}/vendor/**/*.js`])
    .pipe(
      eslint({
        fix: true
      })
    )
    .pipe(eslint.format())
    .pipe(dest(paths.src.js))
    .on('end', () => {
      logger.taskEnd(taskName, startTime);
      logger.success('JavaScript автофикс завершён', taskName);
    });
}

function fixScss() {
  const taskName = 'Fix SCSS';
  const startTime = Date.now();
  logger.taskStart(taskName);

  return src(`${paths.src.scss}/**/*.scss`)
    .pipe(
      through2.obj(function(file, enc, cb) {
        if (file.isNull()) {
          return cb(null, file);
        }
        
        const content = file.contents.toString();
        
        prettier.format(content, {
          parser: 'scss',
          singleQuote: true,
          printWidth: 100,
          tabWidth: 2
        })
          .then((formatted) => {
            file.contents = Buffer.from(formatted);
            cb(null, file);
          })
          .catch((err) => {
            logger.warning(`Не удалось отформатировать ${file.path}: ${err.message}`, taskName);
            cb(null, file);
          });
      })
    )
    .pipe(dest(paths.src.scss))
    .on('end', () => {
      logger.taskEnd(taskName, startTime);
      logger.success('SCSS автофикс завершён', taskName);
    });
}

function lintBem() {
  const taskName = 'Lint BEM';
  const startTime = Date.now();
  logger.taskStart(taskName);

  const errors = validateProject(paths.src.pug);
  
  if (errors.length > 0) {
    logger.warning(`Найдено ${errors.length} нарушений BEM:`, taskName);
    errors.slice(0, 20).forEach(error => {
      logger.warning(`  ${error.file}:${error.line} - ${error.message}`, taskName);
    });
    if (errors.length > 20) {
      logger.warning(`  ... и еще ${errors.length - 20} нарушений`, taskName);
    }
  } else {
    logger.success('BEM валидация пройдена!', taskName);
  }

  logger.taskEnd(taskName, startTime);
  
  return Promise.resolve();
}

const lintAll = series(lintJs, lintScss, lintBem);

lintAll.js = lintJs;
lintAll.scss = lintScss;
lintAll.bem = lintBem;
lintAll.fix = series(fixJs, fixScss);

module.exports = lintAll;

