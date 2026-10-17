/*
 * タクマ塾システム共通: 処理中の表示(タクマ塾のロゴが回る)
 *
 * 登録・保存・送信などのボタンを押してから処理が終わるまでの間、画面中央にロゴを回して出す。
 * 各ページの処理には手を入れず、通信の部分(fetch と Firebase の保存・ログイン)を包んで自動で出す。
 *   - 出すのは、ボタンを押した直後(1.5秒以内)に始まった処理と、それに続く処理だけ(入力中の自動保存などには出さない)
 *   - 0.25秒以内に終わる処理では出さない(ちらつき防止)
 *   - 通信が切れて終わらない処理があっても、15秒で表示を消す(画面が固まらないように)
 * 読み込み方: Firebase の SDK の <script> の後に <script src="takuma-busy.js"></script>
 * 手動で出したいとき: takumaBusy.track(処理のPromise)
 * AI本部(ai-hq.html)は、同じ表示を自前で持っているので読み込まない。
 */
(function () {
  if (window.takumaBusy) return;
  var ACTION_WINDOW = 1500, SHOW_DELAY = 250, GIVE_UP = 15000;

  var css = '.tkb-busy{position:fixed;inset:0;z-index:2147483000;display:grid;place-items:center;background:rgba(246,250,250,.45);cursor:progress}'
    + '.tkb-busy[hidden]{display:none}'
    + '.tkb-box{display:grid;justify-items:center;gap:10px;padding:18px 22px;border-radius:18px;background:#fff;box-shadow:0 18px 40px -22px rgba(15,28,30,.45);font:700 12.5px/1.4 "Noto Sans JP","Hiragino Sans","Yu Gothic",sans-serif;color:#4D6264}'
    + '.tkb-box img{width:56px;height:56px;border-radius:50%;box-shadow:0 0 0 3px #DDF4F5;animation:tkb-spin 1.1s linear infinite}'
    + '@keyframes tkb-spin{to{transform:rotate(360deg)}}'
    + '@keyframes tkb-pulse{50%{opacity:.45}}'
    + '@media (prefers-reduced-motion:reduce){.tkb-box img{animation:tkb-pulse 1.4s ease-in-out infinite!important}}'
    + '@media (prefers-color-scheme:dark){.tkb-busy{background:rgba(8,16,18,.45)}.tkb-box{background:#14262A;color:#C9D7D8}.tkb-box img{box-shadow:0 0 0 3px #10383D}}';
  var el = null;
  function mount() {
    if (el || !document.body) return;
    var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    el = document.createElement('div');
    el.className = 'tkb-busy'; el.hidden = true; el.setAttribute('aria-live', 'polite');
    el.innerHTML = '<div class="tkb-box"><img src="icon-192.png" alt="" width="56" height="56"><span>処理しています…</span></div>';
    document.body.appendChild(el);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else mount();

  // ボタンを押した・選んだ時刻(この直後に始まった処理だけに表示を出す)
  var lastAct = 0;
  var mark = function () { lastAct = Date.now(); };
  document.addEventListener('click', function (e) {
    if (e.target.closest && e.target.closest('button, input[type=submit], input[type=button], a.btn, .btn, [role=button], label')) mark();
  }, true);
  document.addEventListener('change', function (e) {
    var t = e.target; if (t && (t.tagName === 'SELECT' || /^(checkbox|radio|date|file)$/.test(t.type || ''))) mark();
  }, true);
  document.addEventListener('submit', mark, true);

  var count = 0, timer = null;
  function setBusy(on) {
    count = Math.max(0, count + (on ? 1 : -1));
    mount();
    if (!el) return;
    if (count && !timer && el.hidden) timer = setTimeout(function () { timer = null; if (count) el.hidden = false; }, SHOW_DELAY);
    if (!count) { clearTimeout(timer); timer = null; el.hidden = true; }
  }
  /** 処理(Promise)が終わるまで表示を出す。15秒たっても終わらなければ表示だけ消す */
  function track(p) {
    if (!p || typeof p.then !== 'function') return p;
    var done = false;
    var end = function () { if (done) return; done = true; lastAct = Date.now(); setBusy(false); }; // 続けて始まる処理にも出す
    setBusy(true);
    var guard = setTimeout(end, GIVE_UP);
    p.then(function () { clearTimeout(guard); end(); }, function () { clearTimeout(guard); end(); });
    return p;
  }
  var active = function () { return Date.now() - lastAct < ACTION_WINDOW || count > 0; };
  function wrap(obj, name) {
    if (!obj || typeof obj[name] !== 'function' || obj[name].__tkb) return;
    var orig = obj[name];
    var f = function () { var r = orig.apply(this, arguments); return active() ? track(r) : r; };
    f.__tkb = true; obj[name] = f;
  }

  // 通信: fetch(LINE通知・Apps Script など)
  if (window.fetch) {
    var of = window.fetch;
    window.fetch = function () { var r = of.apply(this, arguments); return active() ? track(r) : r; };
  }
  // Firebase(compat): 保存・削除・まとめての保存・トランザクション・ログイン
  function wrapFirebase() {
    var fb = window.firebase; if (!fb) return;
    var fs = fb.firestore;
    if (fs) {
      if (fs.DocumentReference) ['set', 'update', 'delete'].forEach(function (n) { wrap(fs.DocumentReference.prototype, n); });
      if (fs.CollectionReference) wrap(fs.CollectionReference.prototype, 'add');
      if (fs.WriteBatch) wrap(fs.WriteBatch.prototype, 'commit');
      if (fs.Firestore) wrap(fs.Firestore.prototype, 'runTransaction');
    }
    var au = fb.auth && fb.auth.Auth;
    if (au) ['signInWithEmailAndPassword', 'createUserWithEmailAndPassword', 'sendPasswordResetEmail', 'signInAnonymously', 'signInWithPopup'].forEach(function (n) { wrap(au.prototype, n); });
  }
  wrapFirebase();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wrapFirebase);

  window.takumaBusy = { track: track, show: function () { setBusy(true); }, hide: function () { setBusy(false); } };
})();
