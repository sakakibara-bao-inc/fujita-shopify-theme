/**
 * 商品詳細ページのフォームまわり初期化
 * - サイズの label / アイコンクリックで select を開く
 * - 数量の +/- ボタンで number を増減
 */
export function initProductControls() {
  // このページに複数あっても動くように、まずラッパーごとに処理
  const controlBlocks = document.querySelectorAll('.product-article__controls');

  controlBlocks.forEach((block) => {
    setupSizeControl(block);
    setupQuantityControl(block);
  });
}

/**
 * サイズ選択の制御
 * - .c-control--size 内の label / アイコンクリックで select を開く
 */
function setupSizeControl(block) {
  const control = block.querySelector('.c-control--size');
  if (!control) return;

  const label  = control.querySelector('.c-control__label');
  const icon   = control.querySelector('.c-control__field-icon');
  const select = control.querySelector('select');

  if (!select) return;

  const openSelect = () => {
    select.focus();

    // 対応しているブラウザならネイティブのピッカーを開く
    if (typeof select.showPicker === 'function') {
      select.showPicker();
    } else {
      // 一部ブラウザ向けフォールバック（効かないブラウザもある）
      select.click();
    }
  };

  if (label) {
    label.addEventListener('click', (event) => {
      event.preventDefault(); // デフォルトのフォーカスだけにしない
      openSelect();
    });
  }

  if (icon) {
    icon.addEventListener('click', (event) => {
      event.preventDefault();
      openSelect();
    });
  }
}

/**
 * 数量コントロール
 * - label クリックで input にフォーカス
 * - +/- ボタンで値を増減
 */
function setupQuantityControl(block) {
  const control  = block.querySelector('.c-control--quantity');
  if (!control) return;

  const label    = control.querySelector('.c-control__label');
  const input    = control.querySelector('input[type="number"]');
  const btnMinus = control.querySelector('.c-control__field-button--minus');
  const btnPlus  = control.querySelector('.c-control__field-button--plus');

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