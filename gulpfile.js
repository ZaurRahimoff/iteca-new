const { src, dest, series, parallel, watch } = require('gulp');
const { initConfig, getConfig } = require('./gulp/config/config');
const browserSync = require('browser-sync').create();

// Импорт задач
const pugTask = require('./gulp/tasks/pug');
const scssTask = require('./gulp/tasks/scss');
const jsTask = require('./gulp/tasks/js');
const imagesTask = require('./gulp/tasks/images');
const svgTask = require('./gulp/tasks/svg');
const fontsTask = require('./gulp/tasks/fonts');
const cleanTask = require('./gulp/tasks/clean');
const serveTask = require('./gulp/tasks/serve');
const lintTask = require('./gulp/tasks/lint');
const bemTask = require('./gulp/tasks/bem');
const seoTask = require('./gulp/tasks/seo');
const staticTask = require('./gulp/tasks/static');
const pluginsTask = require('./gulp/tasks/plugins');
const htmlValidator = require('./gulp/tasks/html-validator');
const pugValidator = require('./gulp/tasks/pug-validator');
const lighthouseTask = require('./gulp/tasks/lighthouse');

// Инициализация конфигурации
async function init() {
  await initConfig();
  return Promise.resolve();
}

// Задачи с релоадом для BrowserSync
const pugReload = series(pugTask, (done) => {
  if (global.browserSync) {
    global.browserSync.reload();
  }
  done();
});

const scssReload = series(scssTask, (done) => {
  if (global.browserSync) {
    global.browserSync.reload('*.css');
  }
  done();
});

const jsReload = series(jsTask, (done) => {
  if (global.browserSync) {
    global.browserSync.reload();
  }
  done();
});

const imagesReload = series(imagesTask, (done) => {
  if (global.browserSync) {
    global.browserSync.reload();
  }
  done();
});

const svgReload = series(svgTask, (done) => {
  if (global.browserSync) {
    global.browserSync.reload();
  }
  done();
});

const pluginsReload = series(pluginsTask, (done) => {
  if (global.browserSync) {
    global.browserSync.reload();
  }
  done();
});

// Основные задачи
exports.pug = pugTask;
exports.scss = scssTask;
exports.js = jsTask;
exports.images = imagesTask;
exports.svg = svgTask;
exports.fonts = fontsTask;
exports.clean = cleanTask;
exports.lint = lintTask;
exports.lintFix = lintTask.fix;
exports.bem = bemTask;
exports.seo = seoTask;
exports.seoGenerate = seoTask.generate;
exports.static = staticTask;
exports.plugins = pluginsTask;

// HTML валидация
exports.validateHtmlHint = htmlValidator.hint;
exports.validateW3C = htmlValidator.w3c;
exports.validateHtml = htmlValidator;
exports.fixHtml = htmlValidator.fix;

// Pug валидация
exports.validatePugSyntax = pugValidator.syntax;
exports.validatePugHtml = pugValidator.html;

// Оптимизация изображений
exports.imagesInteractive = imagesTask.interactive;
exports.imagesStandard = imagesTask.standard;

// Lighthouse
exports.lighthouse = lighthouseTask;
exports.lighthouseConsole = lighthouseTask.console;
exports.lighthouseClean = lighthouseTask.clean;

// Сборка
exports.build = series(
  init,
  cleanTask,
  parallel(
    pugTask,
    scssTask,
    jsTask,
    imagesTask,
    svgTask,
    fontsTask,
    staticTask,
    pluginsTask
  ),
  seoTask
);

// Режим разработки
exports.dev = series(
  init,
  cleanTask,
  parallel(
    pugTask,
    scssTask,
    jsTask,
    imagesTask, // Запускается только один раз в начале
    svgTask,
    fontsTask,
    staticTask,
    pluginsTask
  ),
  serveTask,
  function watchFiles() {
    watch('src/pug/**/*.pug', pugReload);
    watch('src/scss/**/*.scss', scssReload);
    watch('src/js/**/*.js', jsReload);
    // Изображения не отслеживаются в watch - обрабатываются только один раз при старте
    watch('src/img/**/*.svg', imagesReload);
    watch('src/icons/**/*.svg', svgReload);
    watch('src/fonts/**/*', fontsTask);
    watch('src/static/**/*', staticTask);
    watch('src/plugins/**/*', pluginsReload);
    watch('gulp/tools/**/*', staticTask);
  }
);

// Дефолтная задача
exports.default = exports.dev;

