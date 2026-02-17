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
    lg: 992,
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

  const parseJSON = (value) => {
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

    Object.keys(source).forEach((key) => {
      const sourceValue = source[key];
      if (
        sourceValue &&
        typeof sourceValue === "object" &&
        !Array.isArray(sourceValue)
      ) {
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

    return el
      ? {
          el,
          clickable,
        }
      : undefined;
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

    const nextEl =
      (nextSelector &&
        (slider.querySelector(nextSelector) || document.querySelector(nextSelector))) ||
      null;
    const prevEl =
      (prevSelector &&
        (slider.querySelector(prevSelector) || document.querySelector(prevSelector))) ||
      null;

    if (!nextEl && !prevEl) return undefined;

    return {
      nextEl,
      prevEl,
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
      speed: toNumber(dataset.swiperSpeed, 600),
    };

    const autoplayDelay = dataset.swiperAutoplay;
    if (autoplayDelay && autoplayDelay !== "false") {
      baseOptions.autoplay = {
        delay: toNumber(autoplayDelay, 5000),
        disableOnInteraction: toBool(
          dataset.swiperAutoplayDisable,
          false
        ),
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
  const getCurrentBreakpoint = (width) => {
    if (width >= BREAKPOINTS.lg) return "lg";
    if (width >= BREAKPOINTS.md) return "md";
    if (width >= BREAKPOINTS.sm) return "sm";
    return "xs";
  };

  /**
   * Check if grid mode should be used for current breakpoint
   */
  const shouldUseGrid = (slider) => {
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
  const hasGridAttributes = (dataset) => {
    return (
      dataset.grid !== undefined ||
      dataset.gridSm !== undefined ||
      dataset.gridMd !== undefined ||
      dataset.gridLg !== undefined
    );
  };

  /**
   * Save original classes before any modifications
   */
  const saveOriginalClasses = (slider) => {
    if (slider._originalClasses) return; // Already saved

    slider._originalClasses = {
      slider: slider.className,
      wrapper: null,
      slides: [],
    };

    const wrapper = slider.querySelector(".swiper-wrapper");
    if (wrapper) {
      slider._originalClasses.wrapper = wrapper.className;
    }

    const slides = slider.querySelectorAll(".swiper-slide");
    slides.forEach((slide) => {
      slider._originalClasses.slides.push({
        element: slide,
        className: slide.className,
      });
    });
  };

  /**
   * Remove Swiper classes from elements
   */
  const removeSwiperClasses = (slider) => {
    // Remove Swiper classes
    slider.classList.remove("swiper");
    
    const wrapper = slider.querySelector(".swiper-wrapper");
    if (wrapper) {
      wrapper.classList.remove("swiper-wrapper");
    }

    const slides = slider.querySelectorAll(".swiper-slide");
    slides.forEach((slide) => {
      slide.classList.remove("swiper-slide");
    });
  };

  /**
   * Remove Bootstrap grid classes from elements
   */
  const removeBootstrapClasses = (slider) => {
    // Bootstrap classes that should be removed in Swiper mode
    const bootstrapClassPatterns = [
      /^row$/,
      /^row-cols-/,
      /^col$/,
      /^col-/,
      /^g-/,
      /^gx-/,
      /^gy-/,
      /^w-auto$/,
      /^h-auto$/,
      /^h-100$/,
    ];

    const removeMatchingClasses = (element) => {
      const classes = Array.from(element.classList);
      classes.forEach((className) => {
        if (bootstrapClassPatterns.some((pattern) => pattern.test(className))) {
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
    slides.forEach((slide) => {
      removeMatchingClasses(slide);
    });
  };

  /**
   * Restore Swiper classes to elements and remove Bootstrap classes
   */
  const restoreSwiperClasses = (slider) => {
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
    slider._originalClasses.slides.forEach((savedSlide) => {
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
          
          slider._originalClasses.slides.forEach((savedSlide) => {
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
    const mediaQueries = [
      window.matchMedia(`(min-width: ${BREAKPOINTS.sm}px)`),
      window.matchMedia(`(min-width: ${BREAKPOINTS.md}px)`),
      window.matchMedia(`(min-width: ${BREAKPOINTS.lg}px)`),
    ];

    // Handler for media query changes
    const handleMediaChange = () => {
      updateSwiperState();
    };

    // Attach listeners to all media queries
    mediaQueries.forEach((mq) => {
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
      mediaQueries.forEach((mq) => {
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

    const handleMediaChange = (e) => {
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
    sliders.forEach((slider) => {
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
