/**
 * header.js
 *
 * ヘッダーの状態管理
 *
 * 機能:
 * - スクロール位置に応じて body に is-scrolled を付与
 * - ヘッダーの「初期高さ」を取得して CSS変数にセット
 * - resizeEnd 時に高さを再計測
 * - ONLINESHOP メニューの開閉状態と高さを管理
 *
 * 前提:
 * - header は position: fixed
 * - main 側で padding-top に --header-height-initial を使う
 * - ショップメニューには .h-shopnav / .h-shopnav__inner を付ける
 */

export function initHeader() {
  const body = document.body;
  const root = document.documentElement;
  const header = document.querySelector('.h-header');

  if (!header) return;

  // ==============================
  // 共通ブレイクポイント
  // ==============================

  const BREAKPOINT_SM = 768;


  // ==============================
  // ヘッダー状態設定（調整ポイント）
  // ==============================

  const SCROLLED_CLASS = 'is-scrolled'; // スクロール後の状態クラス
  const MEASURING_CLASS = 'is-measuring-header'; // 高さ計測中に transition を無効化するためのクラス

  const SHOPNAV_OPEN_CLASS = 'is-shopnav-open'; // ショップナビ展開中の状態クラス

  const DRAWER_OPEN_CLASS = 'is-drawer-open'; // ドロワー表示中の状態クラス
  const DRAWER_LOCK_CLASS = 'is-drawer-lock'; // ドロワー中はヘッダー状態を固定するためのクラス

  const INITIAL_HEIGHT_CSS_VAR_NAME = '--header-height-initial'; // 初期header高さ
  const CURRENT_HEIGHT_CSS_VAR_NAME = '--header-height-current'; // 現在のheader高さ

  const SCROLL_THRESHOLD = 30; // このpx数を超えたらヘッダー縮小状態にする

  // ==============================
  // スクロール状態更新
  // ==============================

  function updateScrolledState() {
    if (body.classList.contains(DRAWER_LOCK_CLASS)) return;

    if (window.scrollY > SCROLL_THRESHOLD) {
      body.classList.add(SCROLLED_CLASS);
    } else {
      body.classList.remove(SCROLLED_CLASS);
    }
  }

  // ==============================
  // ヘッダー初期高さの計測
  // ==============================

  function updateHeaderInitialHeight() {
    if (body.classList.contains(DRAWER_LOCK_CLASS)) return;

    const wasScrolled = body.classList.contains(SCROLLED_CLASS);

    // 計測中はCSS側で transition を止める
    root.classList.add(MEASURING_CLASS);

    // 縮小中でも「初期状態の高さ」を測るため、一時的に縮小状態を解除
    if (wasScrolled) {
      body.classList.remove(SCROLLED_CLASS);
    }

    const height = header.getBoundingClientRect().height;
    root.style.setProperty(INITIAL_HEIGHT_CSS_VAR_NAME, `${height}px`);

    // 計測前の状態に戻す
    if (wasScrolled) {
      body.classList.add(SCROLLED_CLASS);
    }

    root.classList.remove(MEASURING_CLASS);
  }

  // ==============================
  // 現在のヘッダー高さを更新
  // ==============================

  function updateHeaderCurrentHeight() {
    if (body.classList.contains(DRAWER_LOCK_CLASS)) return;

    const height = header.getBoundingClientRect().height;

    root.style.setProperty(CURRENT_HEIGHT_CSS_VAR_NAME, `${height}px`);
  }


  // ==============================
  // ONLINESHOP メニュー開閉
  // ==============================

  function initShopNav() {
    const wrapper = document.querySelector('.h-header__wrapper');
    const trigger = document.querySelector('.h-mainnav__link--shop');
    const shopNav = document.querySelector('.h-shopnav');
    const inner = document.querySelector('.h-shopnav__inner');

    if (!wrapper || !trigger || !shopNav || !inner) return;

    // ==============================
    // ショップナビ設定（調整ポイント）
    // ==============================

    const CLOSE_DELAY = 120; // trigger ⇄ nav 間を移動するときの閉じ遅延（ms）
    const FAST_CLOSE_DELAY = 20; // header wrapper 外に出たときの閉じ遅延（ms）

    const CAN_HOVER = window.matchMedia('(hover: hover) and (pointer: fine)').matches; // hover可能な環境のみmouseenterで開閉

    // ==============================

    let isOpen = false;
    let closeTimerId = 0;

    function getInnerHeight() {
      // innerの実寸高さを取得。paddingを含めたいので inner 側を測る
      return inner.getBoundingClientRect().height;
    }

    function clearCloseTimer() {
      if (closeTimerId) {
        clearTimeout(closeTimerId);
        closeTimerId = 0;
      }
    }

    function open() {
      clearCloseTimer();

      const height = getInnerHeight();

      shopNav.style.height = `${height}px`;
      body.classList.add(SHOPNAV_OPEN_CLASS);
      trigger.setAttribute('aria-expanded', 'true');

      isOpen = true;
    }

    function close() {
      clearCloseTimer();

      if (!isOpen) return;

      shopNav.style.height = '0px';
      body.classList.remove(SHOPNAV_OPEN_CLASS);
      trigger.setAttribute('aria-expanded', 'false');

      isOpen = false;
    }

    function toggle() {
      if (isOpen) {
        close();
      } else {
        open();
      }
    }

    function delayedClose() {
      // ONLINESHOPリンクからメニューへ移動するときに閉じにくくする
      clearCloseTimer();
      closeTimerId = window.setTimeout(close, CLOSE_DELAY);
    }

    function fastClose() {
      // ヘッダー領域から完全に外れたときは素早く閉じる
      clearCloseTimer();
      closeTimerId = window.setTimeout(close, FAST_CLOSE_DELAY);
    }

    // アクセシビリティ用の状態
    trigger.setAttribute('aria-haspopup', 'true');
    trigger.setAttribute('aria-expanded', 'false');

    if (CAN_HOVER) {
      // ==============================
      // hover操作：PC想定
      // ==============================

      trigger.addEventListener('mouseenter', open, false);
      shopNav.addEventListener('mouseenter', open, false);

      trigger.addEventListener('mouseleave', delayedClose, false);
      shopNav.addEventListener('mouseleave', delayedClose, false);

      wrapper.addEventListener('mouseleave', fastClose, false);

      // キーボード操作
      trigger.addEventListener('focus', open, false);

      wrapper.addEventListener('focusout', (e) => {
        if (!wrapper.contains(e.relatedTarget)) {
          close();
        }
      }, false);
    } else {
      // ==============================
      // click操作：hover非対応環境想定
      // ==============================

      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        toggle();
      }, false);

      document.addEventListener('click', (e) => {
        if (!trigger.contains(e.target) && !shopNav.contains(e.target)) {
          close();
        }
      }, false);
    }

    // ESCキーで閉じる
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        close();
      }
    }, false);

    // メニュー展開中にリサイズされた場合のみ、高さを再計算
    window.addEventListener('resizeEnd', () => {
      // mq-down(sm) の領域 = 768px未満になったらPC用shopnavは閉じる
      if (window.innerWidth < BREAKPOINT_SM) {
        close();
        return;
      }

      if (!isOpen) return;

      const height = getInnerHeight();
      shopNav.style.height = `${height}px`;
    });
  }


  // ==============================
  // スマホドロワー開閉
  // ==============================

  function initDrawer() {
    // ==============================
    // ドロワー設定（調整ポイント）
    // ==============================

    const CLOSE_FALLBACK_DELAY = 350; // transitionend が拾えなかった時の保険時間

    // ==============================

    const wrapper = document.querySelector('.l-wrapper');
    const drawer = document.querySelector('.c-drawer');
    const triggers = document.querySelectorAll('.c-drawer__trigger');

    // 必須要素がないページでは何もしない
    if (!wrapper || !drawer || triggers.length === 0) return;

    // スクロールしている主体（ブラウザ差吸収）
    const scrollElm = document.scrollingElement || document.documentElement || document.body;

    // ==============================
    // 状態管理
    // ==============================

    // false = 閉
    // true  = 開
    // null  = 遷移中
    let flag = false;

    // 開く直前のスクロール位置
    let savedScrollY = 0;

    // close 用の保険タイマー
    let closeTimerId = 0;

    // ==============================
    // スクロールロック
    // ==============================

    function lockScroll() {
      // 現在のスクロール位置を保存
      savedScrollY = window.pageYOffset || window.scrollY || scrollElm.scrollTop || 0;

      // wrapper を固定して見た目位置を維持
      wrapper.style.position = 'fixed';
      wrapper.style.top = `${-savedScrollY}px`;

      // scroll主体は0へ
      scrollElm.scrollTop = 0;
    }

    function unlockScroll() {
      // wrapper固定解除
      wrapper.style.position = '';
      wrapper.style.top = '';

      // 元位置へ戻す
      scrollElm.scrollTop = savedScrollY;
    }

    // ==============================
    // 開く
    // ==============================

    function openDrawer() {
      // 開いてる or 遷移中なら何もしない
      if (flag !== false) return;

      flag = null;

      // ドロワーを開く直前の現在のheader高さを固定
      updateHeaderCurrentHeight();

      body.classList.add(DRAWER_OPEN_CLASS);
      body.classList.add(DRAWER_LOCK_CLASS);

      // 1フレーム待ってスクロール固定
      requestAnimationFrame(() => {
        lockScroll();
        flag = true;
      });
    }

    // ==============================
    // 閉じる
    // ==============================

    function closeDrawer() {
      // すでに閉じてるなら何もしない
      if (flag === false) return;

      flag = null;

      body.classList.remove(DRAWER_OPEN_CLASS);

      // 既存タイマー解除
      if (closeTimerId) {
        clearTimeout(closeTimerId);
        closeTimerId = 0;
      }

      // transitionend の重複防止
      drawer.removeEventListener('transitionend', onCloseEnd, false);
      drawer.addEventListener('transitionend', onCloseEnd, false);

      // transitionend が来ない場合の保険
      closeTimerId = window.setTimeout(closeEnd, CLOSE_FALLBACK_DELAY);
    }

    function onCloseEnd(evt) {
      // drawer自身以外は無視
      if (evt.target !== drawer) return;

      // visibility transition 完了時のみ
      if (evt.propertyName !== 'visibility') return;

      closeEnd();
    }

    function closeEnd() {
      unlockScroll();

      body.classList.remove(DRAWER_LOCK_CLASS);

      flag = false;

      drawer.removeEventListener('transitionend', onCloseEnd, false);

      if (closeTimerId) {
        clearTimeout(closeTimerId);
        closeTimerId = 0;
      }
    }

    // ==============================
    // トグル
    // ==============================

    function toggleDrawer() {
      // 遷移中は何もしない
      if (flag === true) {
        closeDrawer();
      } else if (flag === false) {
        openDrawer();
      }
    }

    // ==============================
    // 即時強制クローズ
    // ==============================

    function forceCloseImmediate() {
      if (flag === false) return;

      body.classList.remove(DRAWER_OPEN_CLASS);
      body.classList.remove(DRAWER_LOCK_CLASS);

      if (closeTimerId) {
        clearTimeout(closeTimerId);
        closeTimerId = 0;
      }

      drawer.removeEventListener('transitionend', onCloseEnd, false);

      unlockScroll();

      flag = false;
    }

    // ==============================
    // イベント登録
    // ==============================

    triggers.forEach((trigger) => {
      trigger.addEventListener('click', toggleDrawer, false);
    });

    // ESCキーで閉じる
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeDrawer();
      }
    }, false);

    // md以上になったら強制クローズ
    window.addEventListener('resizeEnd', () => {
      if (window.innerWidth >= BREAKPOINT_SM) {
        forceCloseImmediate();
      }
    });

    // 初回ロード時チェック
    if (window.innerWidth >= BREAKPOINT_SM) {
      forceCloseImmediate();
    }
  }


  // ==============================
  // 初期化
  // ==============================

  updateScrolledState();
  updateHeaderInitialHeight();
  updateHeaderCurrentHeight();
  initShopNav();
  initDrawer();

  // スクロールでヘッダー縮小状態を更新
  window.addEventListener('scroll', () => {
    updateScrolledState();
    updateHeaderCurrentHeight();
  }, { passive: true });

  // リサイズ完了時に、現在幅での初期ヘッダー高さを再計測
  window.addEventListener('resizeEnd', () => {
    updateHeaderInitialHeight();
    updateScrolledState();
    updateHeaderCurrentHeight();
  });

  // bfcache復帰時の状態復元
  window.addEventListener('pageshow', (e) => {
    if (e.persisted) {
      updateScrolledState();
      updateHeaderInitialHeight();
      updateHeaderCurrentHeight();
    }
  });
}