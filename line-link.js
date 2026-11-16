/* 保護者ページ: 「LINEで控えを受け取る」(最初の1回だけ、タクマ塾のLINEに連携コードを送ってつなぐ) */
(function(){
  var OA = '@524fmbmg';
  function code6(){ return String(Math.floor(Math.random() * 900000) + 100000); }
  async function linked(){
    var u = firebase.auth().currentUser; if (!u) return null;
    try { return (await firebase.firestore().collection('parentLineLinks').doc(u.uid).get()).exists; } catch(e){ return null; }
  }
  async function start(btn, status){
    btn.disabled = true; status.textContent = 'LINEを開いています…';
    try {
      var u = firebase.auth().currentUser, db = firebase.firestore(), code = '';
      for (var i = 0; i < 5 && !code; i++) {
        var c = code6();
        try { await db.collection('lineLinkCodes').doc(c).set({ uid: u.uid, createdAt: Date.now() }); code = c; } catch(e){ if (i === 4) throw e; }
      }
      location.href = 'https://line.me/R/oaMessage/' + OA + '/?' + encodeURIComponent('連携コード ' + code);
      status.textContent = 'LINEで「送信」を押すと、つながります。';
      setTimeout(function(){ btn.disabled = false; }, 4000);
    } catch(e){ console.error(e); status.textContent = 'うまくいきませんでした。もう一度お試しください。'; btn.disabled = false; }
  }
  window.lineLinkRender = async function(box){
    if (!box) return;
    var ok = await linked();
    if (ok === null) return;
    if (ok) { box.innerHTML = '<p class="line-ok">✓ 受付の控えは、LINEにもお送りしています。</p>'; return; }
    box.innerHTML = '<div class="line-box"><p class="line-tt">LINEでも控えを受け取れます</p><p class="line-ds">最初の1回だけ、LINEで「送信」を押してください。次回からは、連絡を送るだけで、控えがLINEに届きます。</p><button type="button" class="line-btn">LINEで控えを受け取る</button><p class="line-st"></p></div>';
    var btn = box.querySelector('.line-btn'), st = box.querySelector('.line-st');
    btn.onclick = function(){ start(btn, st); };
  };
})();
