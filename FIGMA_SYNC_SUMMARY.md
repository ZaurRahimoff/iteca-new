# Синхронизация проекта Iteca с макетом Figma

## Выполненные изменения

### 1. Дизайн-токены (Design Tokens)

#### Цвета (`src/scss/variables/_colors.scss`)
- ✅ **Primary**: `#000000` → `#293892` (синий)
- ✅ **Secondary**: `#6c757d` → `#EB6A05` (оранжевый)
- ✅ **Text**: добавлен `#00093E` (основной текст)
- ✅ **Text-2**: добавлен `#08051D` (вторичный текст)
- ✅ **Gray**: `#adb5bd` → `#999999`
- ✅ **Background**: `#ffffff` → `#F8F9FA`
- ✅ **Card**: добавлен `#F3F3F3`
- ✅ **Line**: добавлен `#EEEEEE` (границы)
- ✅ **Shadow-30**: добавлен `rgba(0, 0, 0, 0.3)`
- ✅ **Shadow-70**: добавлен `rgba(0, 0, 0, 0.7)`

#### Типографика (`src/scss/variables/_typography.scss`)
- ✅ **Шрифт**: `Montserrat` → `Poppins` (уже подключен через Google Fonts)
- ✅ **Desktop размеры**:
  - Body 1: 12px
  - Body: 14px
  - Title 1: 16px
  - Title: 18px
  - H6: 20px
  - H5: 22px
  - H4: 24px
  - H3: 28px
  - H2: 30px
  - H1: 40px
- ✅ **Mobile размеры**: добавлены адаптивные размеры шрифтов
- ✅ **Font weights**: добавлены Medium (500), SemiBold (600)

### 2. Header / Navbar (`src/pug/components/_navbar.pug`, `src/scss/components/_navbar.scss`)

#### Структура
- ✅ `ABOUT US` → `WHO WE ARE`
- ✅ `PARTNERS` → `OUR PARTNERS`
- ✅ Обновлены названия в мобильном меню

#### Стили
- ✅ Фон: `rgba(0, 0, 0, 0.3)` с использованием CSS-переменной `var(--shadow-30)`
- ✅ Закругление: добавлено `border-radius: 20px`
- ✅ Высота: `90px` (desktop), `80px` (mobile)
- ✅ Padding: `14px 50px` (desktop)
- ✅ Margin: `25px 100px 0` (отступ от краёв экрана)
- ✅ Шрифт ссылок: Poppins Medium 16px с `line-height: normal`
- ✅ Размер иконок: `16px`

### 3. Hero Slider (`src/scss/components/_hero-slider.scss`)
- ✅ Высота: `600px` → `740px` (согласно макету)
- ✅ Сохранена мобильная версия: `450px`

### 4. Кнопки (`src/scss/components/_button.scss`)
- ✅ Обновлены тени для **Primary** кнопок: `rgba(228, 10, 102, 0.3)` → `rgba(41, 56, 146, 0.3)`
- ✅ Обновлены тени для **Secondary** кнопок: `rgba(31, 57, 128, 0.3)` → `rgba(235, 106, 5, 0.3)`
- ✅ Комментарий: "темно-синяя" → "оранжевая"

### 5. CSS-переменные (Auto-generated)
- ✅ Создана карта `$colors-map` для автоматической генерации CSS-переменных
- ✅ Создана карта `$typography-map` для типографики
- ✅ Все компоненты теперь используют `var(--primary)`, `var(--secondary)` и т.д.

## Структура проекта

### Страницы (Pug)
- ✅ `index.pug` - главная страница
- ✅ `about-company.pug` - о компании
- ✅ `contact.pug` - контакты
- ✅ `news.pug` - новости
- ✅ `partners.pug` - партнёры
- ✅ `media.pug` - мы в медиа
- ✅ `photo-gallery.pug`, `video-gallery.pug` - галереи
- ✅ `photo-albums.pug`, `video-albums.pug` - альбомы
- ✅ `newspaper.pug` - газета
- ✅ `references.pug`, `sponsors.pug` - референсы и спонсоры
- ✅ `career.pug` - карьера
- ✅ `news-details.pug` - детали новости
- ✅ `form.pug`, `form2.pug` - формы

### Компоненты (Common Blocks)
- ✅ `_navbar.pug` - навигация
- ✅ `_footer.pug` - подвал
- ✅ `_head-assets.pug` - метатеги и подключение стилей/скриптов
- ✅ `_header.pug` - header компонент

### Миксины (Pug Mixins)
- ✅ `_button.pug` - кнопки
- ✅ `_title.pug` - заголовки секций
- ✅ `_exhibition-card.pug` - карточки выставок
- ✅ `_news-card.pug` - карточки новостей
- ✅ `_partner-card.pug` - карточки партнёров
- ✅ `_testimonial-card.pug` - карточки отзывов
- ✅ `_contact-item.pug` - элементы контактов
- ✅ `_year-select.pug` - селектор года
- ✅ Формы: `_form-input.pug`, `_form-select.pug`, `_form-textarea.pug`, etc.

## Ключевые секции главной страницы

1. **Hero Slider** (740px высота)
2. **Statistics** (50+, 70+, 250+) - накладывается на hero
3. **Exhibition Calendar** (События)
4. **About** (О компании)
5. **Testimonials** (Отзывы)
6. **News** (Новости)
7. **Photo** (Фото галерея)
8. **Accredited members of** (Proud members of)
9. **Partners** (Партнёры)
10. **Contact** (Контакты с картой)
11. **Footer**

## Технологии

- **Шаблонизатор**: Pug
- **Стили**: SCSS (BEM методология)
- **Шрифт**: Poppins (через Google Fonts)
- **Иконки**: Font Awesome 7 Pro
- **Слайдер**: Swiper.js
- **Сетка**: Bootstrap 5
- **Флаги**: Flag Icons
- **Модальные окна**: Fancybox
- **Селекты**: Nice Select
- **Телефоны**: Intl Tel Input

## Следующие шаги (рекомендации)

1. **Проверить компиляцию**: Запустить `gulp` и убедиться, что все стили корректно компилируются
2. **Тестирование в браузере**: Открыть `index.html` и проверить визуальное соответствие макету
3. **Детализация секций**: Для точной пиксель-перфект вёрстки может понадобиться дополнительная настройка отступов и размеров в отдельных секциях
4. **Responsive проверка**: Протестировать на разных разрешениях (mobile, tablet, desktop)
5. **Footer обновление**: Синхронизировать footer с макетом Figma (если требуется)
6. **Остальные страницы**: Применить обновлённые стили ко всем внутренним страницам

## Figma Design System

**URL Design System**: https://www.figma.com/design/WzmV5bl32Ih2DXTAFmaenW/Iteca?node-id=345-1820&m=dev

**URL Макет**: https://www.figma.com/design/WzmV5bl32Ih2DXTAFmaenW/Iteca?node-id=0-1&m=dev

Все дизайн-токены были извлечены из официальной Design System в Figma и применены к проекту.
