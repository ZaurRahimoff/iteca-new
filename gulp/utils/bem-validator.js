const fs = require('fs');
const path = require('path');
const logger = require('./logger');

// Регулярное выражение для BEM
const BEM_BLOCK_PATTERN = /^[a-z]([a-z0-9-]+)?$/;
const BEM_ELEMENT_PATTERN = /^[a-z]([a-z0-9-]+)?__[a-z]([a-z0-9-]+)?$/;
const BEM_MODIFIER_PATTERN = /^[a-z]([a-z0-9-]+)?(--[a-z]([a-z0-9-]+)?){1,2}$/;

function validateBemNaming(filePath, content) {
  const errors = [];
  const lines = content.split('\n');
  
  lines.forEach((line, index) => {
    // Проверка классов в Pug
    if (filePath.endsWith('.pug')) {
      const classMatches = line.match(/class=["']([^"']+)["']/g);
      if (classMatches) {
        classMatches.forEach(match => {
          const classes = match.match(/["']([^"']+)["']/)[1].split(/\s+/);
          classes.forEach(className => {
            if (className && !isValidBemName(className)) {
              errors.push({
                file: path.basename(filePath),
                line: index + 1,
                className,
                message: `Неправильное BEM имя: ${className}`
              });
            }
          });
        });
      }
    }
    
    // Проверка классов в SCSS
    if (filePath.endsWith('.scss')) {
      const classMatches = line.match(/\.([a-z0-9_-]+)/g);
      if (classMatches) {
        classMatches.forEach(match => {
          const className = match.substring(1);
          if (!isValidBemName(className) && !isScssSpecial(className)) {
            errors.push({
              file: path.basename(filePath),
              line: index + 1,
              className,
              message: `Неправильное BEM имя: ${className}`
            });
          }
        });
      }
    }
  });
  
  return errors;
}

function isValidBemName(name) {
  // Проверка блока
  if (BEM_BLOCK_PATTERN.test(name)) return true;
  
  // Проверка элемента
  if (BEM_ELEMENT_PATTERN.test(name)) return true;
  
  // Проверка модификатора
  if (BEM_MODIFIER_PATTERN.test(name)) return true;
  
  // Разрешаем специальные случаи
  if (name.includes('--')) {
    const parts = name.split('--');
    if (parts.length <= 3) {
      return BEM_MODIFIER_PATTERN.test(name);
    }
  }
  
  return false;
}

function isScssSpecial(name) {
  // Разрешаем специальные SCSS конструкции
  const specials = ['&', 'hover', 'active', 'focus', 'before', 'after', 'first', 'last', 'nth'];
  return specials.some(s => name.includes(s));
}

function validateProject(directory) {
  const errors = [];
  
  function walkDir(dir) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory() && !file.startsWith('.')) {
        walkDir(filePath);
      } else if ((file.endsWith('.pug') || file.endsWith('.scss')) && !file.startsWith('_')) {
        const content = fs.readFileSync(filePath, 'utf8');
        const fileErrors = validateBemNaming(filePath, content);
        errors.push(...fileErrors);
      }
    });
  }
  
  walkDir(directory);
  
  return errors;
}

module.exports = {
  validateBemNaming,
  validateProject,
  isValidBemName
};

