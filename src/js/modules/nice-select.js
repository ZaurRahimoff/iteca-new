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
  const selectors = [
    '.form-select',           // Селекты в формах
    '.year-select',           // Выбор года (exhibition calendar, photo albums)
    '[data-nice-select]'      // Элементы с data-атрибутом
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
    $selects.each(function() {
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
export default initNiceSelect;
export { updateNiceSelect, destroyNiceSelect };
