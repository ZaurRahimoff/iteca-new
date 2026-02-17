/**
 * Модуль для инициализации Fancybox
 */
export function initFancybox() {
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
          right: ['slideshow', 'thumbs', 'close'],
        },
      },
      Thumbs: {
        autoStart: false,
      },
      Image: {
        zoom: true,
        wheel: 'slide',
      },
    });
  } catch (error) {
    console.error('Fancybox initialization error:', error);
  }
}
