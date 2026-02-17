const inquirer = require('inquirer');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const argv = yargs(hideBin(process.argv)).argv;

function generateBemComponent() {
  const taskName = 'BEM Generator';
  const startTime = Date.now();
  logger.taskStart(taskName);

  return new Promise(async (resolve) => {
    let blockName = argv.block;
    let elemName = argv.elem;
    let snippetType = argv.snippet || '';

    // Интерактивный режим если нет аргументов
    if (!blockName && !elemName) {
      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'blockName',
          message: 'Имя блока:',
          validate: (input) => {
            if (!input) return 'Имя блока обязательно';
            if (!/^[a-z]([a-z0-9-]+)?$/.test(input)) {
              return 'Имя должно быть в нижнем регистре, без пробелов';
            }
            return true;
          }
        },
        {
          type: 'list',
          name: 'type',
          message: 'Тип:',
          choices: [
            { name: 'Блок', value: 'block' },
            { name: 'Элемент', value: 'elem' }
          ]
        },
        {
          type: 'input',
          name: 'elemName',
          message: 'Имя элемента:',
          when: (answers) => answers.type === 'elem',
          validate: (input) => {
            if (!input) return 'Имя элемента обязательно';
            if (!/^[a-z]([a-z0-9-]+)?$/.test(input)) {
              return 'Имя должно быть в нижнем регистре, без пробелов';
            }
            return true;
          }
        },
        {
          type: 'list',
          name: 'snippet',
          message: 'Выберите сниппет:',
          choices: [
            { name: 'Базовый', value: '' },
            { name: 'Секция', value: 'section' },
            { name: 'Кнопка', value: 'button' },
            { name: 'Карточка', value: 'card' },
            { name: 'Grid', value: 'grid' },
            { name: 'Modal', value: 'modal' },
            { name: 'Header', value: 'header' },
            { name: 'Footer', value: 'footer' }
          ]
        }
      ]);

      blockName = answers.blockName;
      elemName = answers.type === 'elem' ? answers.elemName : null;
      snippetType = answers.snippet;
    }

    const baseDir = path.join(process.cwd(), 'src');
    
    if (elemName) {
      // Генерация элемента
      await createBemElement(blockName, elemName, baseDir);
    } else {
      // Генерация блока
      await createBemBlock(blockName, snippetType, baseDir);
    }

    logger.taskEnd(taskName, startTime);
    logger.success(`BEM компонент создан: ${blockName}${elemName ? `__${elemName}` : ''}`, taskName);
    resolve();
  });
}

// Экспортируемая функция для прямого вызова из API
async function createBemBlockDirect(blockName, snippetType, baseDir) {
  return await createBemBlock(blockName, snippetType, baseDir);
}

async function createBemBlock(blockName, snippetType, baseDir) {
  const snippets = {
    section: {
      pug: `section(class="${blockName}")
  .container
    .${blockName}__wrapper
      h2.${blockName}__title Заголовок секции
      .${blockName}__content
        p.${blockName}__text Текст секции
`,
      scss: `.${blockName} {
  padding: 60px 0;
  
  &__wrapper {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
  }
  
  &__title {
    margin-bottom: 30px;
  }
  
  &__content {
    // Контент секции
  }
  
  &__text {
    // Текст
  }
}
`,
      js: `// ${blockName} блок
export default class ${capitalize(blockName)} {
  constructor(element) {
    this.element = element;
    this.init();
  }
  
  init() {
    // Инициализация блока
  }
}
`
    },
    button: {
      pug: `button(class="${blockName}" type="button") Кнопка
`,
      scss: `.${blockName} {
  display: inline-block;
  padding: 12px 24px;
  border: none;
  border-radius: 4px;
  background-color: $primary;
  color: $white;
  cursor: pointer;
  transition: $transition-base;
  
  &:hover {
    opacity: 0.9;
  }
  
  &:active {
    transform: translateY(1px);
  }
}
`,
      js: `// ${blockName} блок
export default class ${capitalize(blockName)} {
  constructor(element) {
    this.element = element;
    this.init();
  }
  
  init() {
    this.element.addEventListener('click', this.handleClick.bind(this));
  }
  
  handleClick(e) {
    // Обработчик клика
  }
}
`
    },
    card: {
      pug: `div(class="${blockName}")
  .${blockName}__image
    img(src="#" alt="")
  .${blockName}__content
    h3.${blockName}__title Заголовок карточки
    p.${blockName}__text Текст карточки
    a.${blockName}__link(href="#") Ссылка
`,
      scss: `.${blockName} {
  border-radius: $border-radius;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  
  &__image {
    width: 100%;
    height: 200px;
    overflow: hidden;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
  
  &__content {
    padding: 20px;
  }
  
  &__title {
    margin-bottom: 10px;
  }
  
  &__text {
    margin-bottom: 15px;
    color: $gray;
  }
  
  &__link {
    color: $primary;
    text-decoration: none;
  }
}
`,
      js: `// ${blockName} блок
export default class ${capitalize(blockName)} {
  constructor(element) {
    this.element = element;
    this.init();
  }
  
  init() {
    // Инициализация карточки
  }
}
`
    },
    grid: {
      pug: `div(class="${blockName}")
  .${blockName}__item Item 1
  .${blockName}__item Item 2
  .${blockName}__item Item 3
`,
      scss: `.${blockName} {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  
  &__item {
    // Элемент сетки
  }
}
`,
      js: `// ${blockName} блок
export default class ${capitalize(blockName)} {
  constructor(element) {
    this.element = element;
    this.init();
  }
  
  init() {
    // Инициализация сетки
  }
}
`
    },
    modal: {
      pug: `div(class="${blockName}")
  .${blockName}__overlay
  .${blockName}__wrapper
    .${blockName}__header
      h3.${blockName}__title Заголовок модального окна
      button.${blockName}__close(type="button") ×
    .${blockName}__body
      p.${blockName}__text Содержимое модального окна
    .${blockName}__footer
      button.${blockName}__button Отмена
      button.${blockName}__button Подтвердить
`,
      scss: `.${blockName} {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: $z-index-modal;
  display: none;
  
  &--active {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  &__overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
  }
  
  &__wrapper {
    position: relative;
    z-index: 1;
    background: $white;
    border-radius: $border-radius;
    max-width: 500px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
  }
  
  &__header {
    padding: 20px;
    border-bottom: 1px solid $gray;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  &__close {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
  }
  
  &__body {
    padding: 20px;
  }
  
  &__footer {
    padding: 20px;
    border-top: 1px solid $gray;
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  }
}
`,
      js: `// ${blockName} блок
export default class ${capitalize(blockName)} {
  constructor(element) {
    this.element = element;
    this.overlay = this.element.querySelector('.${blockName}__overlay');
    this.closeBtn = this.element.querySelector('.${blockName}__close');
    this.init();
  }
  
  init() {
    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.close());
    }
    if (this.overlay) {
      this.overlay.addEventListener('click', () => this.close());
    }
  }
  
  open() {
    this.element.classList.add('${blockName}--active');
  }
  
  close() {
    this.element.classList.remove('${blockName}--active');
  }
}
`
    },
    header: {
      pug: `header(class="${blockName}")
  .container
    .${blockName}__wrapper
      .${blockName}__logo Logo
      nav.${blockName}__nav
        a.${blockName}__link(href="#") Ссылка 1
        a.${blockName}__link(href="#") Ссылка 2
        a.${blockName}__link(href="#") Ссылка 3
      button.${blockName}__menu(type="button") Меню
`,
      scss: `.${blockName} {
  padding: 20px 0;
  background: $white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  
  &__wrapper {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  &__logo {
    font-size: 24px;
    font-weight: bold;
  }
  
  &__nav {
    display: flex;
    gap: 20px;
  }
  
  &__link {
    text-decoration: none;
    color: $black;
    
    &:hover {
      color: $primary;
    }
  }
  
  &__menu {
    display: none;
    background: none;
    border: none;
    cursor: pointer;
    
    @media (max-width: $breakpoint-tablet) {
      display: block;
    }
  }
}
`,
      js: `// ${blockName} блок
export default class ${capitalize(blockName)} {
  constructor(element) {
    this.element = element;
    this.menuBtn = this.element.querySelector('.${blockName}__menu');
    this.nav = this.element.querySelector('.${blockName}__nav');
    this.init();
  }
  
  init() {
    if (this.menuBtn) {
      this.menuBtn.addEventListener('click', () => this.toggleMenu());
    }
  }
  
  toggleMenu() {
    this.nav.classList.toggle('${blockName}__nav--active');
  }
}
`
    },
    footer: {
      pug: `footer(class="${blockName}")
  .container
    .${blockName}__wrapper
      .${blockName}__copyright © 2024 Все права защищены
      .${blockName}__links
        a.${blockName}__link(href="#") Ссылка 1
        a.${blockName}__link(href="#") Ссылка 2
`,
      scss: `.${blockName} {
  padding: 40px 0;
  background: $gray;
  color: $white;
  
  &__wrapper {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  &__links {
    display: flex;
    gap: 20px;
  }
  
  &__link {
    color: $white;
    text-decoration: none;
    
    &:hover {
      opacity: 0.8;
    }
  }
}
`,
      js: `// ${blockName} блок
export default class ${capitalize(blockName)} {
  constructor(element) {
    this.element = element;
    this.init();
  }
  
  init() {
    // Инициализация футера
  }
}
`
    }
  };

  const defaultSnippet = {
    pug: `div(class="${blockName}")
  // Контент блока
`,
    scss: `.${blockName} {
  // Стили блока
}
`,
    js: `// ${blockName} блок
export default class ${capitalize(blockName)} {
  constructor(element) {
    this.element = element;
    this.init();
  }
  
  init() {
    // Инициализация блока
  }
}
`
  };

  const snippet = snippets[snippetType] || defaultSnippet;

  // Создание файлов
  const pugDir = path.join(baseDir, 'pug', 'components');
  const scssDir = path.join(baseDir, 'scss', 'components');
  const jsDir = path.join(baseDir, 'js', 'modules');

  [pugDir, scssDir, jsDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  fs.writeFileSync(path.join(pugDir, `_${blockName}.pug`), snippet.pug);
  fs.writeFileSync(path.join(scssDir, `_${blockName}.scss`), snippet.scss);
  fs.writeFileSync(path.join(jsDir, `${blockName}.js`), snippet.js);

  logger.info(`Созданы файлы для блока ${blockName}`, 'BEM Generator');
}

async function createBemElement(blockName, elemName, baseDir) {
  const elemPug = `${blockName}__${elemName}`;
  const elemScss = `&__${elemName}`;

  const pugContent = `span(class="${blockName}__${elemName}") Элемент ${elemName}
`;
  const scssContent = `.${blockName} {
  ${elemScss} {
    // Стили элемента ${elemName}
  }
}
`;
  const jsContent = `// ${blockName}__${elemName} элемент
// Добавьте методы для работы с элементом в класс блока ${blockName}
`;

  const pugDir = path.join(baseDir, 'pug', 'components');
  const scssDir = path.join(baseDir, 'scss', 'components');
  const jsDir = path.join(baseDir, 'js', 'modules');

  // Обновление существующего файла блока или создание нового
  const scssFile = path.join(scssDir, `_${blockName}.scss`);
  if (fs.existsSync(scssFile)) {
    const content = fs.readFileSync(scssFile, 'utf8');
    if (!content.includes(elemScss)) {
      const updatedContent = content.replace(
        /^\.([a-z-]+)\s*\{/m,
        `.$1 {
  ${elemScss} {
    // Стили элемента ${elemName}
  }
`
      );
      fs.writeFileSync(scssFile, updatedContent);
    }
  } else {
    fs.writeFileSync(scssFile, scssContent);
  }

  logger.info(`Создан элемент ${blockName}__${elemName}`, 'BEM Generator');
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1).replace(/-([a-z])/g, (g) => g[1].toUpperCase());
}

module.exports = generateBemComponent;
module.exports.createBemBlockDirect = createBemBlockDirect;

