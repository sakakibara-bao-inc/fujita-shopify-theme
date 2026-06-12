/**
 * 商品詳細ページのフォームまわり初期化
 * - 数量の +/- ボタンで number を増減
 */
export function initProductControls() {
  // このページに複数あっても動くように、まずラッパーごとに処理
  const controlBlocks = document.querySelectorAll('.product-article__controls');

  controlBlocks.forEach((block) => {
    setupQuantityControl(block);
    setupProductOptionImageSlider(block);
  });
}


/**
 * 数量コントロール
 * - label クリックで input にフォーカス
 * - +/- ボタンで値を増減
 */
function setupQuantityControl(block) {
  const control  = block.querySelector('.c-product-quantity');
  if (!control) return;

  const label    = control.querySelector('.c-product-quantity__label');
  const input    = control.querySelector('input[type="number"]');
  const btnMinus = control.querySelector('.c-product-quantity__button--minus');
  const btnPlus  = control.querySelector('.c-product-quantity__button--plus');

  
  if (!input) return;

  const min = input.min !== '' ? Number(input.min) : null;
  const max = input.max !== '' ? Number(input.max) : null;

  const clampValue = () => {
    let value = Number(input.value || 0);

    if (Number.isFinite(min) && value < min) value = min;
    if (Number.isFinite(max) && value > max) value = max;

    input.value = String(value || (min ?? 1));
  };

  // ラベルクリック → input にフォーカス
  if (label) {
    label.addEventListener('click', (event) => {
      event.preventDefault();
      input.focus();
    });
  }

  // - ボタン
  if (btnMinus) {
    btnMinus.addEventListener('click', (event) => {
      event.preventDefault();

      if (typeof input.stepDown === 'function') {
        input.stepDown();
      } else {
        input.value = String(Number(input.value || 0) - 1);
      }

      clampValue();
      input.dispatchEvent(new Event('change', { bubbles: true }));
      input.focus();
    });
  }

  // + ボタン
  if (btnPlus) {
    btnPlus.addEventListener('click', (event) => {
      event.preventDefault();

      if (typeof input.stepUp === 'function') {
        input.stepUp();
      } else {
        input.value = String(Number(input.value || 0) + 1);
      }

      clampValue();
      input.dispatchEvent(new Event('change', { bubbles: true }));
      input.focus();
    });
  }
}


/**
 * 商品オプションと商品画像を連動
 * - オプション選択時に対応画像へスライド
 * - data-image-id がないオプションは無視
 */
function setupProductOptionImageSlider(block) {
  const form = block.querySelector('[data-product-form]');
  if (!form) return;

  const article = block.closest('.product-article');
  const gallery = article.querySelector('.c-image-strip--shop-item.swiper');
  const swiper = gallery.swiperInstance;
  const slides = Array.from(gallery.querySelectorAll('.swiper-slide'));

  form.querySelectorAll('[data-product-option]').forEach((input) => {
    input.addEventListener('change', () => {
      const imageId = input.dataset.imageId;
      if (!imageId) return;

      const targetIndex = slides.findIndex((slide) => {
        return slide.dataset.imageId === imageId;
      });

      if (targetIndex !== -1) {
        swiper.slideTo(targetIndex);
      }
    });
  });
}