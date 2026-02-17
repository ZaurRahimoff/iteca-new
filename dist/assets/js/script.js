(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

var _slider = _interopRequireDefault(require("./modules/slider.js"));
var _navbar = _interopRequireDefault(require("./modules/navbar.js"));
var _newsDetailsSlider = _interopRequireDefault(require("./modules/news-details-slider.js"));
var _niceSelect = _interopRequireDefault(require("./modules/nice-select.js"));
var _fancybox = require("./modules/fancybox.js");
var _referencesLoadMore = _interopRequireDefault(require("./modules/references-load-more.js"));
var _heroSlider = _interopRequireDefault(require("./modules/hero-slider.js"));
require("./modules/swiper-auto.js");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
// Main JavaScript file
// Импорт модулей

// Автоматическая инициализация Swiper через data-атрибуты

// Инициализация всех модулей после загрузки DOM
document.addEventListener('DOMContentLoaded', function () {
  // Инициализация navbar (скролл, мобильное меню)
  (0, _navbar.default)();

  // Инициализация слайдеров (legacy - для testimonials и partners)
  if (typeof Swiper !== 'undefined') {
    (0, _heroSlider.default)(); // Hero slider с анимациями
    (0, _slider.default)();
    (0, _newsDetailsSlider.default)();
  }

  // Автоматическая инициализация Swiper слайдеров через data-атрибуты
  // Выполняется автоматически в swiper-auto.js при загрузке DOM

  // Автоматическая инициализация Nice Select для форм
  (0, _niceSelect.default)();

  // Инициализация Load More для страницы References
  (0, _referencesLoadMore.default)();

  // Инициализация Fancybox
  (0, _fancybox.initFancybox)();
});

},{"./modules/fancybox.js":2,"./modules/hero-slider.js":3,"./modules/navbar.js":4,"./modules/news-details-slider.js":5,"./modules/nice-select.js":6,"./modules/references-load-more.js":7,"./modules/slider.js":8,"./modules/swiper-auto.js":9}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.initFancybox = initFancybox;
/**
 * Модуль для инициализации Fancybox
 */
function initFancybox() {
  // Проверяем наличие Fancybox
  if (typeof Fancybox === 'undefined') {
    console.warn('Fancybox is not loaded');
    return;
  }

  // Проверяем, есть ли элементы с data-fancybox на странице
  const fancyboxElements = document.querySelectorAll('[data-fancybox]');
  if (fancyboxElements.length === 0) {
    return; // Нет элементов для инициализации
  }

  // Инициализация Fancybox для всех элементов с data-fancybox
  // Используем более простую конфигурацию для избежания конфликтов
  try {
    Fancybox.bind('[data-fancybox]', {
      // Базовые настройки
      Toolbar: {
        display: {
          left: ['infobar'],
          middle: [],
          right: ['slideshow', 'thumbs', 'close']
        }
      },
      Thumbs: {
        autoStart: false
      },
      Image: {
        zoom: true,
        wheel: 'slide'
      }
    });
  } catch (error) {
    console.error('Fancybox initialization error:', error);
  }
}

},{}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = initHeroSlider;
// Hero Slider Module
// Красивый анимированный слайдер для главного экрана с эффектами

function initHeroSlider() {
  const heroSlider = document.querySelector('.hero-slider');
  if (!heroSlider) return;

  // Проверка наличия Swiper
  if (typeof Swiper === 'undefined') {
    console.warn('Swiper is not loaded');
    return;
  }

  // Инициализация Hero Swiper с эффектом Creative
  const swiperHero = new Swiper('.hero-slider', {
    // Эффект creative для плавных 3D-переходов
    effect: 'fade',
    creativeEffect: {
      prev: {
        // Предыдущий слайд
        translate: ['-120%', 0, -500],
        rotate: [0, 0, -15],
        opacity: 0
      },
      next: {
        // Следующий слайд
        translate: ['120%', 0, -500],
        rotate: [0, 0, 15],
        opacity: 0
      }
    },
    // Основные параметры
    speed: 1200,
    loop: true,
    grabCursor: true,
    watchSlidesProgress: true,
    // Автопроигрывание
    autoplay: {
      delay: 5000,
      disableOnInteraction: false,
      pauseOnMouseEnter: true
    },
    // Навигация
    navigation: {
      nextEl: '.hero-slider__nav-next',
      prevEl: '.hero-slider__nav-prev'
    },
    // Пагинация
    pagination: {
      el: '.hero-slider__pagination',
      clickable: true,
      dynamicBullets: false,
      renderBullet: function (index, className) {
        return '<span class="' + className + '"></span>';
      }
    },
    // Keyboard control
    keyboard: {
      enabled: true,
      onlyInViewport: true
    },
    // Параллакс эффект для контента
    parallax: true,
    // События
    on: {
      init: function () {
        // Анимация появления первого слайда
        animateSlideContent(this.slides[this.activeIndex]);
      },
      slideChange: function () {
        // Анимация при смене слайда
        animateSlideContent(this.slides[this.activeIndex]);
      },
      slideChangeTransitionStart: function () {
        // Скрытие контента предыдущего слайда
        hideSlideContent(this.slides[this.previousIndex]);
      }
    }
  });

  // Функция анимации появления контента слайда
  function animateSlideContent(slide) {
    if (!slide) return;
    const title = slide.querySelector('.hero-slider__title');
    const subtitle = slide.querySelector('.hero-slider__subtitle');
    const description = slide.querySelector('.hero-slider__description');
    const button = slide.querySelector('.hero-slider__button');

    // Сброс и анимация заголовка
    if (title) {
      title.style.opacity = '0';
      title.style.transform = 'translateY(30px)';
      setTimeout(() => {
        title.style.transition = 'all 0.8s ease 0.2s';
        title.style.opacity = '1';
        title.style.transform = 'translateY(0)';
      }, 100);
    }

    // Анимация подзаголовка
    if (subtitle) {
      subtitle.style.opacity = '0';
      subtitle.style.transform = 'translateY(30px)';
      setTimeout(() => {
        subtitle.style.transition = 'all 0.8s ease 0.4s';
        subtitle.style.opacity = '1';
        subtitle.style.transform = 'translateY(0)';
      }, 100);
    }

    // Анимация описания
    if (description) {
      description.style.opacity = '0';
      description.style.transform = 'translateY(30px)';
      setTimeout(() => {
        description.style.transition = 'all 0.8s ease 0.6s';
        description.style.opacity = '1';
        description.style.transform = 'translateY(0)';
      }, 100);
    }

    // Анимация кнопки
    if (button) {
      button.style.opacity = '0';
      button.style.transform = 'translateY(30px)';
      setTimeout(() => {
        button.style.transition = 'all 0.8s ease 0.8s';
        button.style.opacity = '1';
        button.style.transform = 'translateY(0)';
      }, 100);
    }
  }

  // Функция скрытия контента слайда
  function hideSlideContent(slide) {
    if (!slide) return;
    const elements = slide.querySelectorAll('.hero-slider__title, .hero-slider__subtitle, .hero-slider__description, .hero-slider__button');
    elements.forEach(el => {
      el.style.transition = 'all 0.3s ease';
      el.style.opacity = '0';
      el.style.transform = 'translateY(-20px)';
    });
  }

  // Прогресс бар для автопроигрывания (опционально)
  const progressBar = document.querySelector('.hero-slider__progress-bar');
  if (progressBar && swiperHero.autoplay.running) {
    swiperHero.on('autoplayTimeLeft', function (swiper, time, progress) {
      progressBar.style.transform = `scaleX(${1 - progress})`;
    });
  }
  return swiperHero;
}

},{}],4:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = initNavbar;
// Navbar functionality
// Обработка скролла, мобильного меню и подменю

function initNavbar() {
  const header = document.querySelector('.header');
  const burger = document.querySelector('.navbar__burger');
  const mobileMenu = document.querySelector('.navbar__mobile');
  const mobileClose = document.querySelector('.navbar__mobile-close');
  const mobileDropdowns = document.querySelectorAll('.navbar__mobile-item--dropdown');

  // Обработчик скролла для добавления класса scrolled
  let lastScrollY = window.scrollY;
  function handleScroll() {
    const currentScrollY = window.scrollY;
    if (currentScrollY > 0) {
      header.classList.add('header--scrolled');
    } else {
      header.classList.remove('header--scrolled');
    }
    lastScrollY = currentScrollY;
  }

  // Инициализация скролла
  window.addEventListener('scroll', handleScroll, {
    passive: true
  });

  // Scroll to top button
  const scrollTopBtn = document.querySelector('.footer__scroll-top');
  if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // Обработчик открытия мобильного меню
  if (burger) {
    burger.addEventListener('click', () => {
      mobileMenu?.classList.add('navbar__mobile--open');
      document.body.style.overflow = 'hidden';
    });
  }

  // Обработчик закрытия мобильного меню
  if (mobileClose) {
    mobileClose.addEventListener('click', () => {
      mobileMenu?.classList.remove('navbar__mobile--open');
      document.body.style.overflow = '';
    });
  }

  // Обработчик закрытия при клике на backdrop
  if (mobileMenu) {
    mobileMenu.addEventListener('click', e => {
      if (e.target === mobileMenu) {
        mobileMenu.classList.remove('navbar__mobile--open');
        document.body.style.overflow = '';
      }
    });
  }

  // Обработчик раскрытия подменю в мобильной версии
  mobileDropdowns.forEach(dropdown => {
    const toggle = dropdown.querySelector('.navbar__mobile-toggle');
    if (toggle) {
      toggle.addEventListener('click', e => {
        e.preventDefault();

        // Закрываем все остальные dropdown
        mobileDropdowns.forEach(otherDropdown => {
          if (otherDropdown !== dropdown) {
            otherDropdown.classList.remove('active');
          }
        });

        // Toggle текущий dropdown
        dropdown.classList.toggle('active');
      });
    }
  });

  // Обработчик клавиши Escape для закрытия мобильного меню
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && mobileMenu?.classList.contains('navbar__mobile--open')) {
      mobileMenu.classList.remove('navbar__mobile--open');
      document.body.style.overflow = '';
    }
  });

  // Инициализация начального состояния при загрузке
  handleScroll();
}

},{}],5:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = initNewsDetailsSlider;
// Модуль для инициализации связанных слайдеров на странице news-details
// Главный слайдер изображений + слайдер превью (thumbs)

function initNewsDetailsSlider() {
  const mainSlider = document.querySelector('.news-details__slider-main');
  const thumbsSlider = document.querySelector('.news-details__slider-thumbs');
  if (!mainSlider || !thumbsSlider) return;

  // Инициализация слайдера превью (thumbs)
  const swiperThumbs = new Swiper('.news-details__slider-thumbs', {
    spaceBetween: 20,
    slidesPerView: 4,
    direction: 'vertical',
    freeMode: false,
    watchSlidesProgress: true,
    watchSlidesVisibility: true,
    slideToClickedSlide: true,
    breakpoints: {
      0: {
        direction: 'horizontal',
        spaceBetween: 21,
        slidesPerView: 'auto',
        freeMode: false
      },
      992: {
        direction: 'vertical',
        spaceBetween: 20,
        slidesPerView: 4,
        freeMode: false
      }
    }
  });

  // Инициализация главного слайдера
  const swiperMain = new Swiper('.news-details__slider-main', {
    spaceBetween: 0,
    slidesPerView: 1,
    loop: false,
    navigation: {
      nextEl: '#news-details-main__nav-next',
      prevEl: '#news-details-main__nav-prev'
    },
    thumbs: {
      swiper: swiperThumbs,
      slideThumbActiveClass: 'swiper-slide-thumb-active',
      thumbsContainerClass: 'swiper-wrapper',
      autoScrollOffset: 1
    }
  });
}

},{}],6:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
exports.destroyNiceSelect = destroyNiceSelect;
exports.updateNiceSelect = updateNiceSelect;
// Nice Select Module
// Автоматическая инициализация кастомных селектов

/**
 * Инициализация Nice Select для форм
 * Автоматически применяется к элементам с классом .form-select или data-nice-select
 */
function initNiceSelect() {
  // Проверяем наличие jQuery и плагина
  if (typeof $ === 'undefined' || !$.fn.niceSelect) {
    console.warn('Nice Select: jQuery или плагин niceSelect не найден');
    return;
  }

  // Селекторы для автоматической инициализации
  const selectors = ['.form-select',
  // Селекты в формах
  '.year-select',
  // Выбор года (exhibition calendar, photo albums)
  '[data-nice-select]' // Элементы с data-атрибутом
  ];

  // Объединяем селекторы
  const selector = selectors.join(', ');
  const $selects = $(selector);

  // Проверяем наличие элементов
  if ($selects.length === 0) {
    return;
  }

  // Инициализируем Nice Select
  try {
    $selects.each(function () {
      const $select = $(this);

      // Пропускаем уже инициализированные
      if ($select.next('.nice-select').length > 0) {
        return;
      }

      // Инициализируем
      $select.niceSelect();
    });
    console.log(`Nice Select: инициализировано ${$selects.length} элемент(ов)`);
  } catch (error) {
    console.error('Nice Select: ошибка инициализации', error);
  }
}

/**
 * Обновление Nice Select
 * Используется после динамического добавления селектов
 */
function updateNiceSelect() {
  if (typeof $ === 'undefined' || !$.fn.niceSelect) {
    return;
  }
  try {
    $('.form-select, .year-select, [data-nice-select]').niceSelect('update');
    console.log('Nice Select: обновлено');
  } catch (error) {
    console.error('Nice Select: ошибка обновления', error);
  }
}

/**
 * Уничтожение Nice Select
 * Используется перед удалением элемента из DOM
 */
function destroyNiceSelect(selector) {
  if (typeof $ === 'undefined' || !$.fn.niceSelect) {
    return;
  }
  try {
    $(selector).niceSelect('destroy');
    console.log('Nice Select: уничтожен');
  } catch (error) {
    console.error('Nice Select: ошибка уничтожения', error);
  }
}

// Экспорт функций
var _default = exports.default = initNiceSelect;

},{}],7:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = initReferencesLoadMore;
/**
 * References Load More Functionality
 * Показывает первые 3 карточки, остальные скрывает
 * Кнопка "Show all" появляется только если карточек больше 3
 */

function initReferencesLoadMore() {
  const cards = document.querySelectorAll('.ref-card');
  const loadMoreBtn = document.querySelector('.ref-action__btn');
  const loadMoreSection = document.querySelector('.ref-action');
  if (!cards.length || !loadMoreBtn || !loadMoreSection) return;
  const VISIBLE_COUNT = 3;

  // Если карточек 3 или меньше, скрываем кнопку и секцию
  if (cards.length <= VISIBLE_COUNT) {
    loadMoreSection.style.display = 'none';
    return;
  }

  // Скрываем все карточки после 3-й
  cards.forEach((card, index) => {
    if (index >= VISIBLE_COUNT) {
      card.parentElement.style.display = 'none';
    }
  });

  // Обработчик клика на кнопку
  loadMoreBtn.addEventListener('click', () => {
    // Показываем все скрытые карточки
    cards.forEach((card, index) => {
      if (index >= VISIBLE_COUNT) {
        card.parentElement.style.display = 'block';
      }
    });

    // Скрываем кнопку после загрузки всех карточек
    loadMoreSection.style.display = 'none';
  });
}

},{}],8:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = initSliders;
// Модуль для инициализации Swiper слайдеров
// LEGACY: Все слайдеры теперь инициализируются автоматически через swiper-auto.js
// с использованием data-атрибутов в разметке

function initSliders() {
  // Все слайдеры (testimonials, partners, news и т.д.) теперь инициализируются
  // через swiper-auto.js при наличии атрибута data-swiper.
  // Этот модуль оставлен для обратной совместимости, но больше не выполняет инициализацию.
}

},{}],9:[function(require,module,exports){
"use strict";

// Автоматическая инициализация Swiper слайдеров через data-атрибуты
// Основано на примере из jalal-ecommerce проекта

(function () {
  /**
   * Breakpoint constants (Bootstrap 5 style)
   */
  const BREAKPOINTS = {
    xs: 0,
    sm: 576,
    md: 768,
    lg: 992
  };

  /**
   * Helpers
   */
  const toBool = (value, fallback = false) => {
    if (value === undefined) return fallback;
    if (typeof value === "boolean") return value;
    const normalized = value.toString().toLowerCase().trim();
    if (["false", "0", "no", "off"].includes(normalized)) return false;
    if (["true", "1", "yes", "on", ""].includes(normalized)) return true;
    return fallback;
  };
  const toNumber = (value, fallback) => {
    const parsed = parseFloat(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  };
  const parseJSON = value => {
    if (!value) return undefined;
    try {
      return JSON.parse(value);
    } catch (error) {
      console.warn("Invalid JSON in data-swiper attribute:", value);
      return undefined;
    }
  };
  const mergeDeep = (target, source) => {
    if (!source || typeof source !== "object") {
      return target;
    }
    Object.keys(source).forEach(key => {
      const sourceValue = source[key];
      if (sourceValue && typeof sourceValue === "object" && !Array.isArray(sourceValue)) {
        if (!target[key] || typeof target[key] !== "object") {
          target[key] = {};
        }
        mergeDeep(target[key], sourceValue);
      } else {
        target[key] = sourceValue;
      }
    });
    return target;
  };
  const buildPagination = (slider, dataset) => {
    const selector = dataset.swiperPagination;
    const clickable = toBool(dataset.swiperPaginationClickable, true);
    let el;
    if (selector) {
      el = slider.querySelector(selector) || document.querySelector(selector);
    } else {
      el = slider.querySelector(".swiper-pagination");
    }
    return el ? {
      el,
      clickable
    } : undefined;
  };
  const buildNavigation = (slider, dataset) => {
    // First, try to get navigation from data-swiper-navigation attribute
    const navData = parseJSON(dataset.swiperNavigation);
    let nextSelector = null;
    let prevSelector = null;
    if (navData) {
      // Use manual navigation selectors if provided
      nextSelector = navData.next;
      prevSelector = navData.prev;
    } else {
      // Auto-generate navigation selectors based on slider ID
      const sliderId = slider.id;
      if (sliderId) {
        nextSelector = `#${sliderId}__nav-next`;
        prevSelector = `#${sliderId}__nav-prev`;
      }
    }
    if (!nextSelector && !prevSelector) return undefined;
    const nextEl = nextSelector && (slider.querySelector(nextSelector) || document.querySelector(nextSelector)) || null;
    const prevEl = prevSelector && (slider.querySelector(prevSelector) || document.querySelector(prevSelector)) || null;
    if (!nextEl && !prevEl) return undefined;
    return {
      nextEl,
      prevEl
    };
  };

  /**
   * Build Swiper options from data attributes
   */
  const buildSwiperOptions = (slider, dataset) => {
    const baseOptions = {
      slidesPerView: toNumber(dataset.swiperSlides, 1),
      spaceBetween: toNumber(dataset.swiperSpace, 0),
      loop: toBool(dataset.swiperLoop, false),
      speed: toNumber(dataset.swiperSpeed, 600)
    };
    const autoplayDelay = dataset.swiperAutoplay;
    if (autoplayDelay && autoplayDelay !== "false") {
      baseOptions.autoplay = {
        delay: toNumber(autoplayDelay, 5000),
        disableOnInteraction: toBool(dataset.swiperAutoplayDisable, false)
      };
    }
    const pagination = buildPagination(slider, dataset);
    if (pagination) {
      baseOptions.pagination = pagination;
    }
    const navigation = buildNavigation(slider, dataset);
    if (navigation) {
      baseOptions.navigation = navigation;
    }
    const breakpoints = parseJSON(dataset.swiperBreakpoints);
    if (breakpoints) {
      baseOptions.breakpoints = breakpoints;
    }
    const extraOptions = parseJSON(dataset.swiperOptions);
    if (extraOptions) {
      mergeDeep(baseOptions, extraOptions);
    }
    return baseOptions;
  };

  /**
   * Initialize a single Swiper instance
   */
  const initSingleSwiper = (slider, options) => {
    try {
      const swiperInstance = new Swiper(slider, options);

      // Store instance for potential future use
      slider.swiperInstance = swiperInstance;
      return swiperInstance;
    } catch (error) {
      console.error("Error initializing Swiper:", error, slider);
      return null;
    }
  };

  /**
   * Get current breakpoint based on window width
   */
  const getCurrentBreakpoint = width => {
    if (width >= BREAKPOINTS.lg) return "lg";
    if (width >= BREAKPOINTS.md) return "md";
    if (width >= BREAKPOINTS.sm) return "sm";
    return "xs";
  };

  /**
   * Check if grid mode should be used for current breakpoint
   */
  const shouldUseGrid = slider => {
    const dataset = slider.dataset;
    const width = window.innerWidth;
    const breakpoint = getCurrentBreakpoint(width);

    // Check data-grid-* attributes for current breakpoint
    switch (breakpoint) {
      case "lg":
        return toBool(dataset.gridLg, false);
      case "md":
        return toBool(dataset.gridMd, false);
      case "sm":
        return toBool(dataset.gridSm, false);
      case "xs":
        return toBool(dataset.grid, false);
      default:
        return false;
    }
  };

  /**
   * Check if any grid attribute is defined
   */
  const hasGridAttributes = dataset => {
    return dataset.grid !== undefined || dataset.gridSm !== undefined || dataset.gridMd !== undefined || dataset.gridLg !== undefined;
  };

  /**
   * Save original classes before any modifications
   */
  const saveOriginalClasses = slider => {
    if (slider._originalClasses) return; // Already saved

    slider._originalClasses = {
      slider: slider.className,
      wrapper: null,
      slides: []
    };
    const wrapper = slider.querySelector(".swiper-wrapper");
    if (wrapper) {
      slider._originalClasses.wrapper = wrapper.className;
    }
    const slides = slider.querySelectorAll(".swiper-slide");
    slides.forEach(slide => {
      slider._originalClasses.slides.push({
        element: slide,
        className: slide.className
      });
    });
  };

  /**
   * Remove Swiper classes from elements
   */
  const removeSwiperClasses = slider => {
    // Remove Swiper classes
    slider.classList.remove("swiper");
    const wrapper = slider.querySelector(".swiper-wrapper");
    if (wrapper) {
      wrapper.classList.remove("swiper-wrapper");
    }
    const slides = slider.querySelectorAll(".swiper-slide");
    slides.forEach(slide => {
      slide.classList.remove("swiper-slide");
    });
  };

  /**
   * Remove Bootstrap grid classes from elements
   */
  const removeBootstrapClasses = slider => {
    // Bootstrap classes that should be removed in Swiper mode
    const bootstrapClassPatterns = [/^row$/, /^row-cols-/, /^col$/, /^col-/, /^g-/, /^gx-/, /^gy-/, /^w-auto$/, /^h-auto$/, /^h-100$/];
    const removeMatchingClasses = element => {
      const classes = Array.from(element.classList);
      classes.forEach(className => {
        if (bootstrapClassPatterns.some(pattern => pattern.test(className))) {
          element.classList.remove(className);
        }
      });
    };

    // Remove from wrapper
    const wrapper = slider.querySelector('[class*="wrapper"]');
    if (wrapper) {
      removeMatchingClasses(wrapper);
    }

    // Remove from slides
    const slides = slider.querySelectorAll('[class*="slide"]');
    slides.forEach(slide => {
      removeMatchingClasses(slide);
    });
  };

  /**
   * Restore Swiper classes to elements and remove Bootstrap classes
   */
  const restoreSwiperClasses = slider => {
    if (!slider._originalClasses) {
      // If no saved classes, just remove Bootstrap classes
      removeBootstrapClasses(slider);
      return;
    }

    // Restore slider class
    slider.className = slider._originalClasses.slider;

    // Restore wrapper class
    const wrapper = slider.querySelector('[class*="wrapper"]');
    if (wrapper && slider._originalClasses.wrapper) {
      wrapper.className = slider._originalClasses.wrapper;
    }

    // Restore slide classes
    slider._originalClasses.slides.forEach(savedSlide => {
      if (savedSlide.element && savedSlide.element.parentNode) {
        savedSlide.element.className = savedSlide.className;
      }
    });

    // Remove Bootstrap classes after restoring Swiper classes
    removeBootstrapClasses(slider);
  };

  /**
   * Setup responsive Swiper with grid mode support
   */
  const setupResponsiveSwiper = (slider, options) => {
    // Save original classes before any modifications
    saveOriginalClasses(slider);

    // Track current mode to detect changes
    let currentMode = null;
    const updateSwiperState = () => {
      const useGrid = shouldUseGrid(slider);
      const newMode = useGrid ? "grid" : "swiper";

      // Only update if mode has changed
      if (currentMode === newMode && currentMode !== null) {
        return;
      }
      currentMode = newMode;
      if (useGrid) {
        // Grid mode: destroy Swiper and remove Swiper classes
        if (slider.swiperInstance) {
          slider.swiperInstance.destroy(true, true);
          slider.swiperInstance = null;
        }

        // Restore original classes first (to get Bootstrap back)
        if (slider._originalClasses) {
          slider.className = slider._originalClasses.slider;
          const wrapper = slider.querySelector('[class*="wrapper"]');
          if (wrapper && slider._originalClasses.wrapper) {
            wrapper.className = slider._originalClasses.wrapper;
          }
          slider._originalClasses.slides.forEach(savedSlide => {
            if (savedSlide.element && savedSlide.element.parentNode) {
              savedSlide.element.className = savedSlide.className;
            }
          });
        }

        // Then remove only Swiper classes
        removeSwiperClasses(slider);
      } else {
        // Swiper mode: restore Swiper classes and remove Bootstrap
        restoreSwiperClasses(slider);
        if (!slider.swiperInstance) {
          initSingleSwiper(slider, options);
        }
      }
    };

    // Initial setup
    updateSwiperState();

    // Create media queries for all breakpoints
    const mediaQueries = [window.matchMedia(`(min-width: ${BREAKPOINTS.sm}px)`), window.matchMedia(`(min-width: ${BREAKPOINTS.md}px)`), window.matchMedia(`(min-width: ${BREAKPOINTS.lg}px)`)];

    // Handler for media query changes
    const handleMediaChange = () => {
      updateSwiperState();
    };

    // Attach listeners to all media queries
    mediaQueries.forEach(mq => {
      mq.addEventListener("change", handleMediaChange);
    });

    // Also listen to resize event for smoother detection
    let resizeTimeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        updateSwiperState();
      }, 150);
    };
    window.addEventListener("resize", handleResize);

    // Store cleanup function
    slider._responsiveCleanup = () => {
      mediaQueries.forEach(mq => {
        mq.removeEventListener("change", handleMediaChange);
      });
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimeout);
      if (slider.swiperInstance) {
        slider.swiperInstance.destroy(true, true);
        slider.swiperInstance = null;
      }
    };
  };

  /**
   * Setup mobile-only Swiper with responsive destroy/init
   */
  const setupMobileOnlySwiper = (slider, options) => {
    const mobileBreakpoint = 991; // lg-down: max-width 991px
    const mediaQuery = window.matchMedia(`(max-width: ${mobileBreakpoint}px)`);
    const handleMediaChange = e => {
      if (e.matches) {
        // Mobile: initialize Swiper if not already initialized
        if (!slider.swiperInstance) {
          initSingleSwiper(slider, options);
        }
      } else {
        // Desktop: destroy Swiper if initialized
        if (slider.swiperInstance) {
          slider.swiperInstance.destroy(true, true);
          slider.swiperInstance = null;
        }
      }
    };

    // Initial check
    if (mediaQuery.matches) {
      initSingleSwiper(slider, options);
    }

    // Listen for changes
    mediaQuery.addEventListener("change", handleMediaChange);

    // Store cleanup function
    slider._mobileOnlyCleanup = () => {
      mediaQuery.removeEventListener("change", handleMediaChange);
      if (slider.swiperInstance) {
        slider.swiperInstance.destroy(true, true);
        slider.swiperInstance = null;
      }
    };
  };

  /**
   * Swiper initialisation
   */
  const initSwipers = () => {
    if (typeof Swiper === "undefined") {
      console.warn("Swiper is not loaded");
      return;
    }
    const sliders = document.querySelectorAll("[data-swiper]");
    sliders.forEach(slider => {
      const dataset = slider.dataset;
      const options = buildSwiperOptions(slider, dataset);

      // Check if any grid attributes are defined
      if (hasGridAttributes(dataset)) {
        // Use responsive grid/swiper mode
        setupResponsiveSwiper(slider, options);
      } else {
        // Check if mobile-only mode is enabled
        const isMobileOnly = toBool(dataset.swiperMobileOnly, false);
        if (isMobileOnly) {
          setupMobileOnlySwiper(slider, options);
        } else {
          initSingleSwiper(slider, options);
        }
      }
    });
  };

  // Initialize on DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initSwipers);
  } else {
    initSwipers();
  }

  // Export for manual initialization if needed
  if (typeof window !== "undefined") {
    window.initSwipers = initSwipers;
  }
})();

},{}]},{},[1])

//# sourceMappingURL=script.js.map
