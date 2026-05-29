import { initResizeWatcher } from './utils.js';
import { initHeader } from './header.js';
import { initCardListSliders, initGallerySliders } from './slider.js';
import { initProductControls } from './product.js';


/* -----------------------------------------------------------------------------------------
  ウィンドウリサイズ監視の初期化
  - 横幅・高さの変化を監視し、必要に応じてカスタムイベントを発火
  - resizeStart / resizeEnd / resizeHeightStart / resizeHeightEnd を全ページで利用可能
----------------------------------------------------------------------------------------- */

initResizeWatcher();

/* ----------------------------------------------------------------------------------------------------------
  DOMContentLoaded / window.load 初期処理
---------------------------------------------------------------------------------------------------------- */

document.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('_loaded');
});

window.addEventListener('load', () => {
  clearTimeout(window.__splashTimer); //head 内で開始されたスプラッシュゲートを解除する。
  document.body.classList.add('_allloaded');

  //headerの初期高さを取得
  initHeader();

  //　swiper系コンポーネントの初期化
  initCardListSliders();
  initGallerySliders();

  if ( document.querySelector('.product-article') ) {
    initProductControls();
  }
});


// bfcache 復帰時だけ
window.addEventListener('pageshow', (e) => {
  if (e.persisted) {
    clearTimeout(window.__splashTimer);
    document.body.classList.add('_allloaded');
    // ここでは重複初期化を避けるため、必要最低限の処理だけ
  }
});
