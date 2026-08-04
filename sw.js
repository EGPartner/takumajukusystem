// タクマ塾 管理システム - Service Worker
// 目的: ホーム画面への追加(PWAインストール)を可能にすること。
// データはFirestoreとのリアルタイム通信が前提のため、
// アプリの入口(index.html)は常にネットワークを優先し、更新が反映されない問題を避けます。

const CACHE_NAME = 'takuma-juku-shell-v1';
const STATIC_ASSETS = [
  './icon-192.png',
  './icon-512.png',
  './icon-512-maskable.png',
  './manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  // ページ本体(HTML)は常にネットワークを優先。オフライン時のみキャッシュを使う。
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).catch(() => caches.match('./index.html'))
    );
    return;
  }

  // アイコンなどの静的ファイルはキャッシュ優先、なければネットワーク。
  if (STATIC_ASSETS.some((a) => req.url.endsWith(a.replace('./', '')))) {
    event.respondWith(
      caches.match(req).then((cached) => cached || fetch(req))
    );
    return;
  }

  // それ以外(Firestore通信など)はService Workerを介さず、通常通りネットワークへ。
});
