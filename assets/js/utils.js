
/**
 * 指定したY座標までスムーズにスクロール
 * @param {number} targetY - スクロール先のY座標
 * @param {number} duration - スクロールにかける時間（ms）
 * @param {string} easingName - イージングの種類
 */

export function smoothScrollTo(targetY, duration = 600, easingName = 'easeInOutCubic') {
  const startY = window.scrollY || window.pageYOffset;
  const distance = targetY - startY;
  const startTime = performance.now();

  const easingFunctions = {
    linear: t => t,
    easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
    easeInOutQuad: t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
    easeInOutQuart: t => t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2,
    easeInOutQuint: t => t < 0.5 ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2
  };

  const ease = easingFunctions[easingName] || easingFunctions.linear;

  function step(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = ease(progress);
    window.scrollTo(0, startY + distance * easedProgress);
    if (elapsed < duration) {
      requestAnimationFrame(step);
    }
  }

  requestAnimationFrame(step);
}



/**
 * ウィンドウリサイズを監視し、カスタムイベントを発火する
 * 横幅と高さを独立して監視
 * @param {object} options - オプション
 * @param {number} options.debounce - リサイズ終了判定までの遅延時間（ms）
 */

export function initResizeWatcher({ debounce = 300 } = {}) {
  let resizeTimeoutId;
  let isWidthResizing = false;
  let isHeightResizing = false;
  let prevWidth = window.innerWidth;
  let prevHeight = window.innerHeight;

  window.addEventListener('resize', () => {
    const currentWidth = window.innerWidth;
    const currentHeight = window.innerHeight;

    // 幅の変化を検知
    if (currentWidth !== prevWidth) {
      if (!isWidthResizing) {
        window.dispatchEvent(new CustomEvent('resizeStart'));
        isWidthResizing = true;
      }
    }

     // 高さの変化を検知
    if (currentHeight !== prevHeight) {
      if (!isHeightResizing) {
        window.dispatchEvent(new CustomEvent('resizeHeightStart'));
        isHeightResizing = true;
      }
    }

    // debounceタイマーでリサイズ終了を判定
    clearTimeout(resizeTimeoutId);
    resizeTimeoutId = setTimeout(() => {
      // 幅のリサイズ終了
      if (isWidthResizing) {
        window.dispatchEvent(new CustomEvent('resizeEnd'));
        isWidthResizing = false;
      }
      // 高さのリサイズ終了
      if (isHeightResizing) {
        window.dispatchEvent(new CustomEvent('resizeHeightEnd'));
        isHeightResizing = false;
      }

      prevWidth = currentWidth;
      prevHeight = currentHeight;
    }, debounce);
  });
}