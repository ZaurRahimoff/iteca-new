// Hero Slider Module
// Красивый анимированный слайдер для главного экрана с эффектами

export default function initHeroSlider() {
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
        opacity: 0,
      },
      next: {
        // Следующий слайд
        translate: ['120%', 0, -500],
        rotate: [0, 0, 15],
        opacity: 0,
      },
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
      pauseOnMouseEnter: true,
    },

    // Навигация
    navigation: {
      nextEl: '.hero-slider__nav-next',
      prevEl: '.hero-slider__nav-prev',
    },

    // Пагинация
    pagination: {
      el: '.hero-slider__pagination',
      clickable: true,
      dynamicBullets: false,
      renderBullet: function (index, className) {
        return '<span class="' + className + '"></span>';
      },
    },

    // Keyboard control
    keyboard: {
      enabled: true,
      onlyInViewport: true,
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
      },
    },
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

    const elements = slide.querySelectorAll(
      '.hero-slider__title, .hero-slider__subtitle, .hero-slider__description, .hero-slider__button'
    );

    elements.forEach((el) => {
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
