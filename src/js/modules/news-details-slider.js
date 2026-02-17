// Модуль для инициализации связанных слайдеров на странице news-details
// Главный слайдер изображений + слайдер превью (thumbs)

export default function initNewsDetailsSlider() {
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
        freeMode: false,
      },
      992: {
        direction: 'vertical',
        spaceBetween: 20,
        slidesPerView: 4,
        freeMode: false,
      },
    },
  });

  // Инициализация главного слайдера
  const swiperMain = new Swiper('.news-details__slider-main', {
    spaceBetween: 0,
    slidesPerView: 1,
    loop: false,
    navigation: {
      nextEl: '#news-details-main__nav-next',
      prevEl: '#news-details-main__nav-prev',
    },
    thumbs: {
      swiper: swiperThumbs,
      slideThumbActiveClass: 'swiper-slide-thumb-active',
      thumbsContainerClass: 'swiper-wrapper',
      autoScrollOffset: 1,
    },
  });
}
