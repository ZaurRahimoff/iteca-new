const { src } = require('gulp');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');
const paths = require('../utils/paths');

function validateSeo() {
  const taskName = 'SEO Validator';
  const startTime = Date.now();
  logger.taskStart(taskName);

  const htmlFiles = fs.readdirSync(paths.dist.html)
    .filter(file => file.endsWith('.html'))
    .map(file => path.join(paths.dist.html, file));

  let errors = [];
  let warnings = [];

  htmlFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    const $ = cheerio.load(content);
    const fileName = path.basename(file);

    // Проверка title
    const title = $('title').text();
    if (!title || title.trim().length === 0) {
      errors.push(`${fileName}: Отсутствует тег <title>`);
    } else if (title.length < 30 || title.length > 60) {
      warnings.push(`${fileName}: Длина title должна быть 30-60 символов (сейчас: ${title.length})`);
    }

    // Проверка description
    const description = $('meta[name="description"]').attr('content');
    if (!description) {
      errors.push(`${fileName}: Отсутствует meta description`);
    } else if (description.length < 120 || description.length > 160) {
      warnings.push(`${fileName}: Длина description должна быть 120-160 символов (сейчас: ${description.length})`);
    }

    // Проверка og:image
    const ogImage = $('meta[property="og:image"]').attr('content');
    if (!ogImage) {
      warnings.push(`${fileName}: Отсутствует og:image`);
    }

    // Проверка keywords
    const keywords = $('meta[name="keywords"]').attr('content');
    if (!keywords) {
      warnings.push(`${fileName}: Отсутствуют keywords`);
    }

    // Проверка canonical
    const canonical = $('link[rel="canonical"]').attr('href');
    if (!canonical) {
      warnings.push(`${fileName}: Отсутствует canonical`);
    }

    // Проверка h1 (единственный)
    const h1Count = $('h1').length;
    if (h1Count === 0) {
      errors.push(`${fileName}: Отсутствует тег <h1>`);
    } else if (h1Count > 1) {
      errors.push(`${fileName}: Найдено ${h1Count} тегов <h1>, должен быть только один`);
    }

    // Проверка alt у изображений
    $('img').each((index, img) => {
      const alt = $(img).attr('alt');
      if (alt === undefined || alt === '') {
        errors.push(`${fileName}: Изображение без атрибута alt (строка ${$(img).parent().index() + 1})`);
      }
    });
  });

  // Вывод результатов
  if (errors.length > 0) {
    logger.error(`Найдено ${errors.length} ошибок:`, taskName);
    errors.forEach(error => logger.error(`  - ${error}`, taskName));
  }

  if (warnings.length > 0) {
    logger.warning(`Найдено ${warnings.length} предупреждений:`, taskName);
    warnings.forEach(warning => logger.warning(`  - ${warning}`, taskName));
  }

  if (errors.length === 0 && warnings.length === 0) {
    logger.success('Все SEO проверки пройдены успешно!', taskName);
  }

  logger.taskEnd(taskName, startTime);
  
  return Promise.resolve();
}

function generateMeta() {
  const taskName = 'SEO Meta Generator';
  const startTime = Date.now();
  logger.taskStart(taskName);

  return new Promise((resolve) => {
    const inquirer = require('inquirer');
    
    inquirer.prompt([
      {
        type: 'input',
        name: 'title',
        message: 'Title страницы:',
        validate: (input) => {
          if (!input) return 'Title обязателен';
          if (input.length < 30 || input.length > 60) {
            return 'Длина title должна быть 30-60 символов';
          }
          return true;
        }
      },
      {
        type: 'input',
        name: 'description',
        message: 'Meta description:',
        validate: (input) => {
          if (!input) return 'Description обязателен';
          if (input.length < 120 || input.length > 160) {
            return 'Длина description должна быть 120-160 символов';
          }
          return true;
        }
      },
      {
        type: 'input',
        name: 'keywords',
        message: 'Keywords (через запятую):'
      },
      {
        type: 'input',
        name: 'ogImage',
        message: 'OG Image URL:'
      },
      {
        type: 'input',
        name: 'canonical',
        message: 'Canonical URL:'
      }
    ]).then(answers => {
      const metaContent = `// SEO Meta теги
// Используйте этот миксин в layout файлах

mixin meta-seo(title, description, keywords, ogImage, canonical)
  title= title
  meta(name="description" content=description)
  meta(name="keywords" content=keywords)
  meta(property="og:title" content=title)
  meta(property="og:description" content=description)
  meta(property="og:image" content=ogImage)
  meta(property="og:type" content="website")
  link(rel="canonical" href=canonical)

// Пример использования:
// +meta-seo('${answers.title}', '${answers.description}', '${answers.keywords}', '${answers.ogImage}', '${answers.canonical}')
`;

      const mixinsDir = path.join(process.cwd(), 'src/pug/mixins');
      if (!fs.existsSync(mixinsDir)) {
        fs.mkdirSync(mixinsDir, { recursive: true });
      }

      fs.writeFileSync(path.join(mixinsDir, '_meta-seo.pug'), metaContent);
      
      logger.taskEnd(taskName, startTime);
      logger.success('SEO миксин создан в src/pug/mixins/_meta-seo.pug', taskName);
      resolve();
    });
  });
}

const seoTask = validateSeo;
seoTask.generate = generateMeta;

module.exports = seoTask;

