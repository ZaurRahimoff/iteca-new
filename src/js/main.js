// Main JavaScript file
// Импорт модулей
import initSliders from './modules/slider.js';
import initNavbar from './modules/navbar.js';
import initNewsDetailsSlider from './modules/news-details-slider.js';
import initNiceSelect from './modules/nice-select.js';
import { initFancybox } from './modules/fancybox.js';
import initReferencesLoadMore from './modules/references-load-more.js';
import { initVideoPlay } from './modules/video-play';
import initHeroSlider from './modules/hero-slider.js';
import './modules/swiper-auto.js'; // Автоматическая инициализация Swiper через data-атрибуты

// Инициализация всех модулей после загрузки DOM
document.addEventListener('DOMContentLoaded', function() {
  // Инициализация navbar (скролл, мобильное меню)
  initNavbar();
  
  // Инициализация слайдеров (legacy - для testimonials и partners)
  if (typeof Swiper !== 'undefined') {
    initHeroSlider(); // Hero slider с анимациями
    initSliders();
    initNewsDetailsSlider();
  }

  // Инициализация видео
  initVideoPlay();
  // Автоматическая инициализация Swiper слайдеров через data-атрибуты
  // Выполняется автоматически в swiper-auto.js при загрузке DOM
  
  // Автоматическая инициализация Nice Select для форм
  initNiceSelect();
  
  // Инициализация Load More для страницы References
  initReferencesLoadMore();

  // Инициализация Fancybox
  initFancybox();
});

