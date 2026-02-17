const path = require('path');

const paths = {
  src: {
    pug: 'src/pug',
    scss: 'src/scss',
    js: 'src/js',
    img: 'src/img',
    icons: 'src/icons',
    fonts: 'src/fonts',
    plugins: 'src/plugins'
  },
  dist: {
    base: 'dist',
    html: 'dist',
    css: 'dist/assets/css',
    js: 'dist/assets/js',
    img: 'dist/assets/img',
    plugins: 'dist/assets/plugins',
    icons: 'dist/assets/icons',
    fonts: 'dist/assets/fonts'
  },
  watch: {
    pug: 'src/pug/**/*.pug',
    scss: 'src/scss/**/*.scss',
    js: 'src/js/**/*.js',
    img: 'src/img/**/*.{jpg,jpeg,png,gif,webp,svg}',
    svg: 'src/icons/**/*.svg',
    fonts: 'src/fonts/**/*',
    plugins: 'src/plugins/**/*'
  }
};

module.exports = paths;

