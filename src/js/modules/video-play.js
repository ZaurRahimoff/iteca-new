/**
 * Модуль для YouTube видео
 * 
 * ВАЖНО: Проект использует lite-youtube компонент.
 * JavaScript не требуется, так как lite-youtube работает автоматически.
 * 
 * Этот модуль оставлен для обратной совместимости со старым кодом.
 */

export function initVideoPlay() {
  // lite-youtube работает автоматически, JavaScript не требуется
  
  // Обработка старых элементов (для обратной совместимости)
  initLegacyVideoElements();
}

/**
 * Создает элементы видео
 */
function initVideoElements(container, videoId, posterSrc, autoplay = false) {
  // Создаем постер
  if (posterSrc) {
    const poster = document.createElement('img');
    poster.className = 'yt-video__poster';
    poster.src = posterSrc;
    poster.alt = '';
    poster.setAttribute('aria-hidden', 'true');
    container.appendChild(poster);
  }

  // Создаем iframe
  const iframe = document.createElement('iframe');
  iframe.className = 'yt-video__iframe';
  iframe.src = `https://www.youtube.com/embed/${videoId}?enablejsapi=1&rel=0`;
  iframe.width = '100%';
  iframe.height = '100%';
  iframe.frameBorder = '0';
  iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
  iframe.referrerPolicy = 'strict-origin-when-cross-origin';
  iframe.allowFullscreen = true;
  iframe.title = 'YouTube video player';
  container.appendChild(iframe);

  // Создаем кнопку play (если не autoplay)
  if (!autoplay) {
    const playBtn = document.createElement('button');
    playBtn.className = 'yt-video__play-btn';
    playBtn.setAttribute('aria-label', 'Play video');
    playBtn.innerHTML = '<i class="fal fa-circle-play"></i>';
    container.appendChild(playBtn);
  } else {
    // Автоматический запуск
    setTimeout(() => playVideo(container), 100);
  }
}

/**
 * Запускает воспроизведение видео
 */
function playVideo(container) {
  const iframe = container.querySelector('.yt-video__iframe');
  const poster = container.querySelector('.yt-video__poster');
  const playBtn = container.querySelector('.yt-video__play-btn');

  if (!iframe) return;

  // Добавляем autoplay к URL
  const src = iframe.src;
  if (!src.includes('autoplay=1')) {
    const separator = src.includes('?') ? '&' : '?';
    iframe.src = src + separator + 'autoplay=1&mute=0';
  }

  // Показываем iframe
  iframe.classList.add('yt-video__iframe--visible');

  // Скрываем постер и кнопку
  if (poster) {
    poster.classList.add('yt-video__poster--hidden');
  }
  if (playBtn) {
    playBtn.classList.add('yt-video__play-btn--hidden');
  }
}

/**
 * Инициализация старых элементов (обратная совместимость)
 */
function initLegacyVideoElements() {
  const legacyButtons = document.querySelectorAll('.hero__play-btn, .video-section__play-btn');

  legacyButtons.forEach(btn => {
    // Проверяем, что обработчик еще не добавлен
    if (btn.dataset.initialized) return;
    btn.dataset.initialized = 'true';

    btn.addEventListener('click', function(e) {
      e.preventDefault();

      const videoWrapper = this.closest('.hero, .video-section');
      if (!videoWrapper) return;

      const iframe = videoWrapper.querySelector('iframe.hero__video, iframe');
      const video = videoWrapper.querySelector('video');

      if (iframe) {
        const src = iframe.src;
        const isPlaying = src.includes('autoplay=1');

        if (!isPlaying) {
          const separator = src.includes('?') ? '&' : '?';
          iframe.src = src + separator + 'autoplay=1&mute=0';
          iframe.style.opacity = '1';
          iframe.style.zIndex = '3';
          this.style.display = 'none';

          const videoImage = videoWrapper.querySelector('.hero__video-image');
          if (videoImage) {
            videoImage.style.opacity = '0';
          }
        }
      } else if (video) {
        if (video.paused) {
          video.play();
          this.style.display = 'none';
        } else {
          video.pause();
          this.style.display = 'flex';
        }
      }
    });
  });
}
