const { src, dest } = require('gulp');
const imagemin = require('imagemin');
const imageminMozjpeg = require('imagemin-mozjpeg');
const imageminPngquant = require('imagemin-pngquant');
const sharp = require('sharp');
const chalk = require('chalk');
const inquirer = require('inquirer');
const logger = require('../utils/logger');
const paths = require('../utils/paths');
const path = require('path');
const fs = require('fs');
const glob = require('glob');

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function getFileSize(filePath) {
  try {
    return fs.statSync(filePath).size;
  } catch {
    return 0;
  }
}

async function optimizeImagesInteractive() {
  const taskName = 'Images Interactive';
  const startTime = Date.now();
  logger.taskStart(taskName);

  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'quality',
      message: 'Выберите степень сжатия:',
      choices: [
        { name: '50% - Максимальное сжатие', value: 50 },
        { name: '60% - Сильное сжатие', value: 60 },
        { name: '70% - Среднее сжатие', value: 70 },
        { name: '80% - Оптимальное (рекомендуется)', value: 80 },
        { name: '90% - Минимальное сжатие', value: 90 }
      ],
      default: 3
    },
    {
      type: 'checkbox',
      name: 'formats',
      message: 'Выберите форматы выходных изображений:',
      choices: [
        { name: 'WebP', value: 'webp', checked: true },
        { name: 'AVIF', value: 'avif' },
        { name: 'Original (JPEG/PNG)', value: 'original', checked: true }
      ]
    }
  ]);

  const quality = answers.quality;
  const formats = answers.formats;

  const distCompressed = path.join(process.cwd(), paths.dist.img, 'compressed');
  const distWebp = path.join(process.cwd(), paths.dist.img, 'webp');
  const distAvif = path.join(process.cwd(), paths.dist.img, 'avif');
  const srcImg = path.join(process.cwd(), paths.src.img);

  // Создаем папки если их нет
  [distCompressed, distWebp, distAvif].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  try {
    // Нормализуем путь для glob (заменяем обратные слеши на прямые)
    const srcImgPattern = path.join(srcImg, '**', '*.{jpg,jpeg,png}').replace(/\\/g, '/');
    const imageFiles = glob.sync(srcImgPattern, { absolute: true });
    let totalOriginalSize = 0;
    let totalCompressedSize = 0;
    let processedCount = 0;

    logger.info(`ℹ️ Обработка ${imageFiles.length} изображений...`, taskName);
    if (imageFiles.length === 0) {
      logger.info(`ℹ️ Путь поиска: ${srcImgPattern}`, taskName);
      logger.info(`ℹ️ Абсолютный путь: ${srcImg}`, taskName);
    }

    // Обработка оригинальных форматов
    if (formats.includes('original')) {
      logger.info('Оптимизация оригинальных форматов...', taskName);
      const srcImgPattern = path.join(srcImg, '**', '*.{jpg,jpeg,png}').replace(/\\/g, '/');
      const compressedFiles = await imagemin([srcImgPattern], {
        destination: distCompressed,
        plugins: [
          imageminMozjpeg({ quality }),
          imageminPngquant({ quality: [quality / 100, (quality + 10) / 100] })
        ]
      });

      compressedFiles.forEach(file => {
        const originalPath = path.join(srcImg, path.relative(distCompressed, file.destinationPath));
        const originalSize = getFileSize(originalPath);
        const compressedSize = getFileSize(file.destinationPath);
        const savings = ((1 - compressedSize / originalSize) * 100).toFixed(1);
        
        totalOriginalSize += originalSize;
        totalCompressedSize += compressedSize;
        processedCount++;

        const fileName = path.basename(file.destinationPath);
        const statusIcon = savings > 30 ? '✅' : savings > 15 ? '⚠️' : '❌';
        const statusColor = savings > 30 ? chalk.green : savings > 15 ? chalk.yellow : chalk.red;

        console.log(`${statusIcon} ${chalk.blue(fileName)}`);
        console.log(`   ${chalk.gray('Исходный:')} ${chalk.white(formatBytes(originalSize))}`);
        console.log(`   ${chalk.gray('Сжатый:')} ${chalk.white(formatBytes(compressedSize))}`);
        console.log(`   ${statusColor(`Сжатие: ${savings}%`)}`);
      });
    }

    // Генерация WebP
    if (formats.includes('webp')) {
      logger.info('Генерация WebP...', taskName);
      for (const imagePath of imageFiles) {
        try {
          const relativePath = path.relative(srcImg, imagePath);
          const webpFileName = relativePath.replace(/\.(jpg|jpeg|png)$/i, '.webp');
          const webpPath = path.join(distWebp, webpFileName);
          
          const dir = path.dirname(webpPath);
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }
          
          const originalSize = getFileSize(imagePath);
          await sharp(imagePath)
            .webp({ quality })
            .toFile(webpPath);
          
          const webpSize = getFileSize(webpPath);
          const savings = ((1 - webpSize / originalSize) * 100).toFixed(1);
          
          const fileName = path.basename(webpPath);
          const statusIcon = savings > 30 ? '✅' : savings > 15 ? '⚠️' : '❌';
          const statusColor = savings > 30 ? chalk.green : savings > 15 ? chalk.yellow : chalk.red;

          console.log(`${statusIcon} ${chalk.blue(fileName)} (WebP)`);
          console.log(`   ${chalk.gray('Исходный:')} ${chalk.white(formatBytes(originalSize))}`);
          console.log(`   ${chalk.gray('WebP:')} ${chalk.white(formatBytes(webpSize))}`);
          console.log(`   ${statusColor(`Сжатие: ${savings}%`)}`);
        } catch (err) {
          logger.warning(`Не удалось сконвертировать ${imagePath}: ${err.message}`, taskName);
        }
      }
    }

    // Генерация AVIF
    if (formats.includes('avif')) {
      logger.info('Генерация AVIF...', taskName);
      for (const imagePath of imageFiles) {
        try {
          const relativePath = path.relative(srcImg, imagePath);
          const avifFileName = relativePath.replace(/\.(jpg|jpeg|png)$/i, '.avif');
          const avifPath = path.join(distAvif, avifFileName);
          
          const dir = path.dirname(avifPath);
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }
          
          const originalSize = getFileSize(imagePath);
          await sharp(imagePath)
            .avif({ quality })
            .toFile(avifPath);
          
          const avifSize = getFileSize(avifPath);
          const savings = ((1 - avifSize / originalSize) * 100).toFixed(1);
          
          const fileName = path.basename(avifPath);
          const statusIcon = savings > 30 ? '✅' : savings > 15 ? '⚠️' : '❌';
          const statusColor = savings > 30 ? chalk.green : savings > 15 ? chalk.yellow : chalk.red;

          console.log(`${statusIcon} ${chalk.blue(fileName)} (AVIF)`);
          console.log(`   ${chalk.gray('Исходный:')} ${chalk.white(formatBytes(originalSize))}`);
          console.log(`   ${chalk.gray('AVIF:')} ${chalk.white(formatBytes(avifSize))}`);
          console.log(`   ${statusColor(`Сжатие: ${savings}%`)}`);
        } catch (err) {
          logger.warning(`Не удалось сконвертировать ${imagePath}: ${err.message}`, taskName);
        }
      }
    }

    // Копирование SVG файлов
    logger.info('Копирование SVG файлов...', taskName);
    const distImg = path.join(process.cwd(), paths.dist.img);
    if (!fs.existsSync(distImg)) {
      fs.mkdirSync(distImg, { recursive: true });
    }
    
    return new Promise((resolve, reject) => {
      src(`${srcImg}/**/*.svg`)
        .pipe(dest(distImg))
        .on('end', () => {
          logger.taskEnd(taskName, startTime);
          if (processedCount > 0) {
            const totalSavings = ((1 - totalCompressedSize / totalOriginalSize) * 100).toFixed(1);
            logger.success(`✅ Обработано изображений: ${processedCount}`, taskName);
            logger.info(`ℹ️ Общий размер: ${formatBytes(totalOriginalSize)} → ${formatBytes(totalCompressedSize)} (${totalSavings}% экономии)`, taskName);
          } else {
            logger.success('✅ Изображения обработаны', taskName);
          }
          logger.success('✅ SVG файлы скопированы', taskName);
          resolve();
        })
        .on('error', (err) => {
          logger.error(err.message, taskName);
          reject(err);
        });
    });
  } catch (err) {
    logger.error(err.message, taskName);
    throw err;
  }
}

async function optimizeImagesStandard() {
  const taskName = 'Images Standard';
  const startTime = Date.now();
  logger.taskStart(taskName);

  const distCompressed = path.join(process.cwd(), paths.dist.img, 'compressed');
  const distWebp = path.join(process.cwd(), paths.dist.img, 'webp');
  const srcImg = path.join(process.cwd(), paths.src.img);

  // Создаем папки если их нет
  if (!fs.existsSync(distCompressed)) {
    fs.mkdirSync(distCompressed, { recursive: true });
  }
  if (!fs.existsSync(distWebp)) {
    fs.mkdirSync(distWebp, { recursive: true });
  }

  try {
    // Нормализуем путь для glob (заменяем обратные слеши на прямые)
    const srcImgPattern = path.join(srcImg, '**', '*.{jpg,jpeg,png}').replace(/\\/g, '/');
    
    // Оптимизация JPG/PNG
    logger.info('Оптимизация изображений (80% качество)...', taskName);
    const compressedFiles = await imagemin([srcImgPattern], {
      destination: distCompressed,
      plugins: [
        imageminMozjpeg({ quality: 80 }),
        imageminPngquant({ quality: [0.8, 0.9] })
      ]
    });

    let totalOriginalSize = 0;
    let totalCompressedSize = 0;
    
    compressedFiles.forEach(file => {
      const originalPath = path.join(srcImg, path.relative(distCompressed, file.destinationPath));
      const originalSize = getFileSize(originalPath);
      const compressedSize = getFileSize(file.destinationPath);
      totalOriginalSize += originalSize;
      totalCompressedSize += compressedSize;
    });

    // Генерация WebP
    logger.info('Генерация WebP (80% качество)...', taskName);
    const imageFiles = glob.sync(srcImgPattern, { absolute: true });
    
    for (const imagePath of imageFiles) {
      try {
        const relativePath = path.relative(srcImg, imagePath);
        const webpFileName = relativePath.replace(/\.(jpg|jpeg|png)$/i, '.webp');
        const webpPath = path.join(distWebp, webpFileName);
        
        const dir = path.dirname(webpPath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        
        await sharp(imagePath)
          .webp({ quality: 80 })
          .toFile(webpPath);
      } catch (err) {
        logger.warning(`Не удалось сконвертировать ${imagePath}: ${err.message}`, taskName);
      }
    }

    // Копирование SVG файлов
    logger.info('Копирование SVG файлов...', taskName);
    const distImg = path.join(process.cwd(), paths.dist.img);
    if (!fs.existsSync(distImg)) {
      fs.mkdirSync(distImg, { recursive: true });
    }
    
    return new Promise((resolve, reject) => {
      src(`${srcImg}/**/*.svg`)
        .pipe(dest(distImg))
        .on('end', () => {
          logger.taskEnd(taskName, startTime);
          
          if (compressedFiles.length > 0 && totalOriginalSize > 0) {
            const totalSavings = ((1 - totalCompressedSize / totalOriginalSize) * 100).toFixed(1);
            logger.success(`✅ Обработано изображений: ${compressedFiles.length}`, taskName);
            logger.info(`ℹ️ Общий размер: ${formatBytes(totalOriginalSize)} → ${formatBytes(totalCompressedSize)} (${totalSavings}% экономии)`, taskName);
          } else {
            logger.success(`✅ Обработано изображений: ${compressedFiles.length}`, taskName);
            logger.info(`ℹ️ Изображения для обработки не найдены`, taskName);
          }
          logger.success('✅ Изображения оптимизированы (compressed и webp версии)', taskName);
          logger.success('✅ SVG файлы скопированы', taskName);
          resolve();
        })
        .on('error', (err) => {
          logger.error(err.message, taskName);
          reject(err);
        });
    });
  } catch (err) {
    logger.error(err.message, taskName);
    throw err;
  }
}

// Экспортируем стандартную функцию для обратной совместимости
const optimizeImages = optimizeImagesStandard;

optimizeImages.interactive = optimizeImagesInteractive;
optimizeImages.standard = optimizeImagesStandard;

module.exports = optimizeImages;
