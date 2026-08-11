// タクマ塾 管理システム用 Service Worker(最小構成)
// キャッシュは行わず、ホーム画面追加(PWA)の要件を満たすためだけに存在する。
// データの鮮度を優先し、すべてのリクエストは通常どおりネットワークへ流す。
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));
