/* 保護者ページ: 「LINEで控えを受け取る」(最初の1回だけ、タクマ塾のLINEに連携コードを送ってつなぐ) */
(function(){
  var OA = '@524fmbmg';
  function code6(){ return String(Math.floor(Math.random() * 900000) + 100000); }
  async function linked(){
    var u = firebase.auth().currentUser; if (!u) return null;
    try { return (await firebase.firestore().collection('parentLineLinks').doc(u.uid).get()).exists; } catch(e){ return null; }
  }
  function css(){
    if (document.getElementById('ll-css')) return;
    var s = document.createElement('style'); s.id = 'll-css';
    s.textContent =
      '.ll-ov{position:fixed;inset:0;z-index:9999;background:rgba(10,24,26,.55);display:flex;align-items:flex-end;justify-content:center;padding:0;}'
      + '.ll-sheet{width:100%;max-width:480px;background:#fff;border-radius:24px 24px 0 0;padding:22px 20px calc(20px + env(safe-area-inset-bottom));max-height:92vh;overflow:auto;box-shadow:0 -12px 40px rgba(0,0,0,.2);}'
      + '.ll-h{font-size:18px;font-weight:900;margin:0 0 4px;text-align:center;}'
      + '.ll-sub{font-size:13px;color:#586E70;text-align:center;margin:0 0 16px;line-height:1.6;}'
      + '.ll-step{display:flex;gap:12px;align-items:flex-start;margin:0 0 12px;}'
      + '.ll-n{flex:none;width:28px;height:28px;border-radius:50%;background:#06C755;color:#fff;font-weight:800;font-size:14px;display:flex;align-items:center;justify-content:center;}'
      + '.ll-t{font-size:14.5px;line-height:1.6;margin:0;padding-top:2px;}'
      + '.ll-t b{font-weight:800;}'
      + '.ll-mock{margin:6px 0 14px;padding:12px;border-radius:14px;background:#EEF3F3;}'
      + '.ll-bubble{display:inline-block;max-width:92%;background:#fff;border:1px solid #CBD8D8;border-radius:14px;padding:9px 12px;font-size:13px;line-height:1.55;color:#12181A;}'
      + '.ll-send{display:flex;justify-content:flex-end;margin-top:8px;}'
      + '.ll-send span{display:inline-flex;align-items:center;gap:6px;font-size:12px;font-weight:700;color:#06A648;}'
      + '.ll-send i{display:inline-flex;width:30px;height:30px;border-radius:50%;background:#06C755;color:#fff;align-items:center;justify-content:center;font-style:normal;font-size:15px;box-shadow:0 0 0 4px rgba(6,199,85,.22);}'
      + '.ll-safe{font-size:12px;color:#586E70;background:#F0FBF4;border-radius:10px;padding:10px 12px;line-height:1.6;margin:0 0 14px;}'
      + '.ll-go{width:100%;padding:16px;border:none;border-radius:14px;background:#06C755;color:#fff;font-size:16px;font-weight:800;font-family:inherit;cursor:pointer;}'
      + '.ll-go:disabled{opacity:.6;}'
      + '.ll-cancel{display:block;margin:12px auto 0;background:none;border:none;color:#586E70;font-family:inherit;font-size:13.5px;font-weight:600;cursor:pointer;padding:6px 12px;}'
      + '.ll-msg{font-size:12.5px;color:#C24B41;text-align:center;margin:8px 0 0;min-height:16px;}';
    document.head.appendChild(s);
  }
  function openSheet(){
    css();
    var ov = document.createElement('div'); ov.className = 'll-ov';
    ov.innerHTML =
      '<div class="ll-sheet" role="dialog" aria-modal="true">'
      + '<p class="ll-h">LINEで控えを受け取る</p>'
      + '<p class="ll-sub">最初の1回だけ、かんたんな設定です(30秒ほど)。</p>'
      + '<div class="ll-step"><span class="ll-n">1</span><p class="ll-t">下の<b>「LINEを開く」</b>を押します。</p></div>'
      + '<div class="ll-step"><span class="ll-n">2</span><p class="ll-t">LINEのトークに、次のような文章が、<b>最初から入力されています</b>。</p></div>'
      + '<div class="ll-mock"><div class="ll-bubble">連携コード 482193<br><small>(保護者ページの控えをLINEで受け取る登録です。このまま送信してください)</small></div>'
      + '<div class="ll-send"><span>この ▶ を押す<i>➤</i></span></div></div>'
      + '<div class="ll-step"><span class="ll-n">3</span><p class="ll-t">文章は<b>そのまま、右下の送信ボタン</b>を押してください。「つながりました」と返信が届けば完了です。</p></div>'
      + '<p class="ll-safe">🔒 送られるのは「連携コード」の数字だけです。お名前や内容を、入力する必要はありません。次回からは、ご連絡を送るだけで、控えがLINEに届きます。</p>'
      + '<button type="button" class="ll-go">LINEを開く</button>'
      + '<p class="ll-msg"></p>'
      + '<button type="button" class="ll-cancel">あとで</button>'
      + '</div>';
    document.body.appendChild(ov);
    var go = ov.querySelector('.ll-go'), msg = ov.querySelector('.ll-msg');
    ov.querySelector('.ll-cancel').onclick = function(){ ov.remove(); };
    ov.addEventListener('click', function(e){ if (e.target === ov) ov.remove(); });
    go.onclick = async function(){
      go.disabled = true; msg.textContent = '';
      try {
        var u = firebase.auth().currentUser, db = firebase.firestore(), code = '';
        for (var i = 0; i < 5 && !code; i++) {
          var c = code6();
          try { await db.collection('lineLinkCodes').doc(c).set({ uid: u.uid, createdAt: Date.now() }); code = c; } catch(e){ if (i === 4) throw e; }
        }
        location.href = 'https://line.me/R/oaMessage/' + OA + '/?' + encodeURIComponent('連携コード ' + code + '\n(保護者ページの控えをLINEで受け取る登録です。このまま送信してください)');
        setTimeout(function(){ go.disabled = false; }, 4000);
      } catch(e){ console.error(e); msg.textContent = 'うまくいきませんでした。もう一度お試しください。'; go.disabled = false; }
    };
  }
  window.lineLinkRender = async function(box){
    if (!box) return;
    var ok = await linked();
    if (ok === null) return;
    if (ok) { box.innerHTML = '<p class="line-ok">✓ 受付の控えは、LINEにもお送りしています。</p>'; return; }
    box.innerHTML = '<div class="line-box"><p class="line-tt">LINEでも控えを受け取れます</p><p class="line-ds">最初の1回だけ、かんたんな設定をすると、次回からは、ご連絡を送るだけで、控えがLINEに届きます。</p><button type="button" class="line-btn">LINEで控えを受け取る</button></div>';
    box.querySelector('.line-btn').onclick = openSheet;
  };
})();
