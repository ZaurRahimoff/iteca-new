/**
 * References Load More Functionality
 * Показывает первые 3 карточки, остальные скрывает
 * Кнопка "Show all" появляется только если карточек больше 3
 */

export default function initReferencesLoadMore() {
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
