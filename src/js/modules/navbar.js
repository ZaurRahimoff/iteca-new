// Navbar functionality
// Обработка скролла, мобильного меню и подменю

export default function initNavbar() {
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
  window.addEventListener('scroll', handleScroll, { passive: true });

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
    mobileMenu.addEventListener('click', (e) => {
      if (e.target === mobileMenu) {
        mobileMenu.classList.remove('navbar__mobile--open');
        document.body.style.overflow = '';
      }
    });
  }

  // Обработчик раскрытия подменю в мобильной версии
  mobileDropdowns.forEach((dropdown) => {
    const toggle = dropdown.querySelector('.navbar__mobile-toggle');
    
    if (toggle) {
      toggle.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Закрываем все остальные dropdown
        mobileDropdowns.forEach((otherDropdown) => {
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
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu?.classList.contains('navbar__mobile--open')) {
      mobileMenu.classList.remove('navbar__mobile--open');
      document.body.style.overflow = '';
    }
  });

  // Инициализация начального состояния при загрузке
  handleScroll();
}
