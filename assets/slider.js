
// 共通：見えているスライドに 1〜N の番号を振る
function updateVisibleIndex(swiper) {
  let count = 0;

  swiper.slides.forEach((slide) => {
    if (slide.classList.contains('swiper-slide-visible')) {
      count += 1;
      slide.dataset.visibleIndex = String(count);
    } else {
      slide.removeAttribute('data-visible-index');
    }
  });
}

/**
 * カードリスト系スライダー初期化
 * 対象: .c-card-list--slider .swiper
 */
export function initCardListSliders() {
  // Swiper が読み込まれてなければ何もしない
  if (typeof Swiper === 'undefined') return;

  const sliderEls = document.querySelectorAll('.c-card-list--slider .swiper');

  sliderEls.forEach((swiperEl) => {
    const root = swiperEl.closest('.c-card-list--slider');
    const isSliderSm = root && root.classList.contains('c-card-list--slider-sm');
    const isSliderAutoPlay = root && root.classList.contains('c-card-list--slider-autoplay');

    const sliderEl = swiperEl.closest('.c-slider');
    const prevEl = sliderEl.querySelector('.c-slider__button--prev');
    const nextEl = sliderEl.querySelector('.c-slider__button--next');

    const swiper = new Swiper(swiperEl, {
      //slidesPerView: isSliderSm ? 5 : 4,
      //initialSlide: isSliderSm ? 5 : 4,
      loop: true,
      watchSlidesProgress: true,
      speed: 500,

      navigation: {
        prevEl,
        nextEl,
      },

      breakpoints: {
        0: { //sm
          slidesPerView: isSliderSm ? 4 : 3,
          initialSlide: isSliderSm ? 4 : 3,
        },
        769: { //md以下
          slidesPerView: isSliderSm ? 4 : 4,
          initialSlide: isSliderSm ? 4 : 4,
        },
        1025: {
          slidesPerView: isSliderSm ? 5 : 4,
          initialSlide: isSliderSm ? 5 : 4,
        },
      },

      autoplay: isSliderAutoPlay
        ? {
            delay: 4000,
            disableOnInteraction: false,
          }
        : false,
      on: {
        init(swiper) {
          updateVisibleIndex(swiper);

          // 初期配置が終わったあとで transition を有効化
          if (root) {
            requestAnimationFrame(() => {
              root.classList.add('is-transition-ready');
            });
          }
        },
        slideChange(swiper) {
          updateVisibleIndex(swiper);
        },
        resize(swiper) {
          updateVisibleIndex(swiper);
        },
      },
    });
  });
}


/**
 * 商品詳細メイン画像スライダー初期化
 */
export function initProductImageSliders() {
  if (typeof Swiper === 'undefined') return;

  const sliderEls = document.querySelectorAll('.c-image-strip--shop-item.swiper');
  if (!sliderEls.length) return;

  sliderEls.forEach((swiperEl) => {
    const sliderEl = swiperEl.closest('.c-slider');
    const prevEl = sliderEl.querySelector('.c-slider__button--prev');
    const nextEl = sliderEl.querySelector('.c-slider__button--next');

    const swiper = new Swiper(swiperEl, {
      slidesPerView: 'auto',
      spaceBetween: 0,
      loop: false,
      speed: 500,
      allowTouchMove: true,

      navigation: {
        prevEl,
        nextEl,
      },
    });

    swiperEl.swiperInstance = swiper;
  });
}


/**
 * 横に流れ続けるギャラリー（帯画像）初期化
 */
export function initImageStripGallerySliders() {
  if (typeof Swiper === 'undefined') return;

  const galleryEls = document.querySelectorAll('.c-image-strip--gallery.swiper');
  if (!galleryEls.length) return;

  galleryEls.forEach((galleryEl) => {
    new Swiper(galleryEl, {
      slidesPerView: 'auto',
      spaceBetween: 0,
      loop: true,
      speed: 40000,
      allowTouchMove: false,
      autoplay: {
        delay: 0,
        disableOnInteraction: false,
      },
    });
  });
}