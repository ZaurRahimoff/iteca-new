const inquirer = require('inquirer');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const fancyLog = require('fancy-log');

let projectConfig = null;

const defaultConfig = {
  colors: {
    primary: '#007bff',
    secondary: '#6c757d',
    gray: '#adb5bd',
    background: '#ffffff',
    cardBackground: '#f8f9fa'
  },
  typography: {
    baseFont: 'Inter, sans-serif',
    fallbackFont: 'Arial, sans-serif'
  },
  borderRadius: '4px',
  containerWidth: '1200px',
  libraries: {
    bootstrap: false,
    fontAwesome: false,
    swiper: false,
    jquery: false,
    gsap: false
  },
  device: 'desktop'
};

async function initConfig() {
  const configPath = path.join(process.cwd(), 'gulp-config.json');
  
  // Проверка существующего конфига
  if (fs.existsSync(configPath)) {
    try {
      projectConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      fancyLog(chalk.green('✓ Конфигурация загружена из gulp-config.json'));
      return projectConfig;
    } catch (error) {
      fancyLog(chalk.yellow('⚠ Ошибка чтения конфига, создаём новый'));
    }
  }

  // Интерактивное меню для переменных проекта
  fancyLog(chalk.cyan('\n🎨 Настройка переменных проекта\n'));
  
  const colorAnswers = await inquirer.prompt([
    {
      type: 'input',
      name: 'primary',
      message: 'Основной цвет (primary):',
      default: defaultConfig.colors.primary
    },
    {
      type: 'input',
      name: 'secondary',
      message: 'Вторичный цвет (secondary):',
      default: defaultConfig.colors.secondary
    },
    {
      type: 'input',
      name: 'gray',
      message: 'Серый цвет (gray):',
      default: defaultConfig.colors.gray
    },
    {
      type: 'input',
      name: 'background',
      message: 'Цвет фона (background):',
      default: defaultConfig.colors.background
    },
    {
      type: 'input',
      name: 'cardBackground',
      message: 'Цвет фона карточки (cardBackground):',
      default: defaultConfig.colors.cardBackground
    }
  ]);

  const typographyAnswers = await inquirer.prompt([
    {
      type: 'input',
      name: 'baseFont',
      message: 'Основной шрифт:',
      default: defaultConfig.typography.baseFont
    },
    {
      type: 'input',
      name: 'fallbackFont',
      message: 'Fallback шрифт:',
      default: defaultConfig.typography.fallbackFont
    }
  ]);

  const otherAnswers = await inquirer.prompt([
    {
      type: 'input',
      name: 'borderRadius',
      message: 'Border-radius:',
      default: defaultConfig.borderRadius
    },
    {
      type: 'input',
      name: 'containerWidth',
      message: 'Ширина контейнера:',
      default: defaultConfig.containerWidth
    }
  ]);

  // Интерактивное меню для библиотек
  fancyLog(chalk.cyan('\n📦 Выбор библиотек для подключения\n'));
  
  const libraryAnswers = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'libraries',
      message: 'Выберите библиотеки:',
      choices: [
        { name: 'Bootstrap', value: 'bootstrap' },
        { name: 'Font Awesome', value: 'fontAwesome' },
        { name: 'Swiper', value: 'swiper' },
        { name: 'jQuery', value: 'jquery' },
        { name: 'GSAP', value: 'gsap' }
      ]
    }
  ]);

  const libraries = {};
  ['bootstrap', 'fontAwesome', 'swiper', 'jquery', 'gsap'].forEach(lib => {
    libraries[lib] = libraryAnswers.libraries.includes(lib);
  });

  // Определение устройства из аргументов
  const args = process.argv.slice(2);
  let device = 'desktop';
  if (args.includes('--mobile')) device = 'mobile';
  else if (args.includes('--tablet')) device = 'tablet';
  else if (args.includes('--desktop')) device = 'desktop';

  projectConfig = {
    colors: colorAnswers,
    typography: typographyAnswers,
    borderRadius: otherAnswers.borderRadius,
    containerWidth: otherAnswers.containerWidth,
    libraries,
    device
  };

  // Сохранение конфига
  fs.writeFileSync(configPath, JSON.stringify(projectConfig, null, 2));
  fancyLog(chalk.green('✓ Конфигурация сохранена в gulp-config.json'));

  // Создание файлов переменных
  await createVariableFiles(projectConfig);
  
  // Подключение библиотек
  await setupLibraries(projectConfig);

  return projectConfig;
}

async function createVariableFiles(config) {
  const scssPath = path.join(process.cwd(), 'src/scss');
  
  // Создание _colors.scss
  const colorsContent = `// Цвета проекта
// Автоматически сгенерировано

$primary: ${config.colors.primary};
$secondary: ${config.colors.secondary};
$gray: ${config.colors.gray};
$background: ${config.colors.background};
$card-background: ${config.colors.cardBackground};

// Дополнительные цвета
$white: #ffffff;
$black: #000000;
$error: #dc3545;
$success: #28a745;
$warning: #ffc107;
$info: #17a2b8;
`;

  // Создание _typography.scss
  const googleFont = config.typography?.googleFont || '';
  const baseFont = config.typography?.baseFont || config.typography?.baseFont || 'Arial, sans-serif';
  const fallbackFont = config.typography?.fallbackFont || 'Arial, sans-serif';
  
  const typographyContent = `// Типографика проекта
// Автоматически сгенерировано

$font-base: ${baseFont};
$font-fallback: ${fallbackFont};
$font-family: $font-base, $font-fallback;

// Размеры шрифтов
$font-size-xs: 0.75rem;   // 12px
$font-size-sm: 0.875rem;  // 14px
$font-size-base: 1rem;    // 16px
$font-size-lg: 1.125rem;  // 18px
$font-size-xl: 1.25rem;   // 20px
$font-size-2xl: 1.5rem;   // 24px
$font-size-3xl: 1.875rem; // 30px
$font-size-4xl: 2.25rem;  // 36px

// Межстрочный интервал
$line-height-tight: 1.25;
$line-height-normal: 1.5;
$line-height-relaxed: 1.75;
`;

  // Создание _variables.scss
  const variablesContent = `// Основные переменные проекта
// Автоматически сгенерировано

$border-radius: ${config.borderRadius};
$container-width: ${config.containerWidth};

// Breakpoints
$breakpoint-mobile: 375px;
$breakpoint-tablet: 768px;
$breakpoint-desktop: 1440px;

// Transitions
$transition-base: 0.3s ease;
$transition-fast: 0.15s ease;
$transition-slow: 0.5s ease;

// Z-index
$z-index-dropdown: 1000;
$z-index-sticky: 1020;
$z-index-fixed: 1030;
$z-index-modal-backdrop: 1040;
$z-index-modal: 1050;
$z-index-popover: 1060;
$z-index-tooltip: 1070;
`;

  // Создание папок если их нет
  const variablesDir = path.join(scssPath, 'variables');
  if (!fs.existsSync(variablesDir)) {
    fs.mkdirSync(variablesDir, { recursive: true });
  }

  fs.writeFileSync(path.join(variablesDir, '_colors.scss'), colorsContent);
  fs.writeFileSync(path.join(variablesDir, '_typography.scss'), typographyContent);
  fs.writeFileSync(path.join(variablesDir, '_variables.scss'), variablesContent);

  fancyLog(chalk.green('✓ Файлы переменных созданы'));
}

async function setupLibraries(config) {
  const vendorsDir = path.join(process.cwd(), 'src/scss/vendors');
  const jsVendorDir = path.join(process.cwd(), 'src/js/vendor');
  
  if (!fs.existsSync(vendorsDir)) {
    fs.mkdirSync(vendorsDir, { recursive: true });
  }
  if (!fs.existsSync(jsVendorDir)) {
    fs.mkdirSync(jsVendorDir, { recursive: true });
  }
  
  // Bootstrap
  if (config.libraries.bootstrap) {
    const bootstrapScss = `// Bootstrap подключение
// Установите Bootstrap через npm: npm install bootstrap
// @import '~bootstrap/scss/bootstrap';
`;
    fs.writeFileSync(path.join(vendorsDir, '_bootstrap.scss'), bootstrapScss);
    fancyLog(chalk.blue('ℹ Bootstrap: установите через npm install bootstrap'));
  }
  
  // Font Awesome
  if (config.libraries.fontAwesome) {
    const faScss = `// Font Awesome подключение
// @import '~@fortawesome/fontawesome-free/scss/fontawesome';
// @import '~@fortawesome/fontawesome-free/scss/solid';
// @import '~@fortawesome/fontawesome-free/scss/brands';
`;
    fs.writeFileSync(path.join(vendorsDir, '_fontawesome.scss'), faScss);
    fancyLog(chalk.blue('ℹ Font Awesome: установите через npm install @fortawesome/fontawesome-free'));
  }
  
  // Swiper
  if (config.libraries.swiper) {
    const swiperScss = `// Swiper подключение
// @import '~swiper/swiper-bundle';
`;
    fs.writeFileSync(path.join(vendorsDir, '_swiper.scss'), swiperScss);
    
    const swiperJs = `// Swiper JavaScript
// import Swiper from 'swiper';
// import { Navigation, Pagination } from 'swiper/modules';
// Swiper.use([Navigation, Pagination]);
// export default Swiper;
`;
    fs.writeFileSync(path.join(jsVendorDir, 'swiper.js'), swiperJs);
    fancyLog(chalk.blue('ℹ Swiper: установите через npm install swiper'));
  }
  
  // jQuery
  if (config.libraries.jquery) {
    const jqueryJs = `// jQuery подключение
// import $ from 'jquery';
// window.$ = window.jQuery = $;
// export default $;
`;
    fs.writeFileSync(path.join(jsVendorDir, 'jquery.js'), jqueryJs);
    fancyLog(chalk.blue('ℹ jQuery: установите через npm install jquery'));
  }
  
  // GSAP
  if (config.libraries.gsap) {
    const gsapJs = `// GSAP подключение
// import { gsap } from 'gsap';
// window.gsap = gsap;
// export default gsap;
`;
    fs.writeFileSync(path.join(jsVendorDir, 'gsap.js'), gsapJs);
    fancyLog(chalk.blue('ℹ GSAP: установите через npm install gsap'));
  }
  
  // Обновление main.scss для импорта библиотек
  await updateMainScss(config);
}

async function updateMainScss(config) {
  const mainScssPath = path.join(process.cwd(), 'src/scss/main.scss');
  let content = fs.existsSync(mainScssPath) 
    ? fs.readFileSync(mainScssPath, 'utf8') 
    : '';
  
  // Проверяем наличие импортов библиотек
  const vendorImports = [];
  if (config.libraries.bootstrap && !content.includes('vendors/bootstrap')) {
    vendorImports.push("// @import 'vendors/bootstrap';");
  }
  if (config.libraries.fontAwesome && !content.includes('vendors/fontawesome')) {
    vendorImports.push("// @import 'vendors/fontawesome';");
  }
  if (config.libraries.swiper && !content.includes('vendors/swiper')) {
    vendorImports.push("// @import 'vendors/swiper';");
  }
  
  if (vendorImports.length > 0 && content.includes('// Вендоры')) {
    const vendorSection = `// Вендоры (если подключены библиотеки)\n${vendorImports.join('\n')}\n`;
    content = content.replace(/\/\/ Вендоры[\s\S]*?\/\/ @import 'vendors\/swiper';/, vendorSection);
    fs.writeFileSync(mainScssPath, content);
  }
}

function getConfig() {
  if (!projectConfig) {
    const configPath = path.join(process.cwd(), 'gulp-config.json');
    if (fs.existsSync(configPath)) {
      projectConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    } else {
      projectConfig = defaultConfig;
    }
  }
  return projectConfig;
}

async function updateConfig(newConfig) {
  const configPath = path.join(process.cwd(), 'gulp-config.json');
  projectConfig = { ...projectConfig, ...newConfig };
  fs.writeFileSync(configPath, JSON.stringify(projectConfig, null, 2));
  
  // Обновление файлов переменных
  await createVariableFiles(projectConfig);
  
  // Обновление библиотек
  await setupLibraries(projectConfig);
  
  return projectConfig;
}

module.exports = {
  initConfig,
  getConfig,
  updateConfig
};

