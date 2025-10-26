self.addEventListener('install', event => {
	event.waitUntil(
		caches.open('swiftfacture-v1').then(cache => {
			return cache.addAll([
				'/',
				'/index.html',
				'/logo/SwiftFactureLogo.png',
				'/manifest.json',
				// Add main JS/CSS bundles if known, e.g. '/assets/main.js', '/assets/main.css'
			]);
		})
	);
});

self.addEventListener('activate', event => {
	event.waitUntil(
		caches.keys().then(keys =>
			Promise.all(keys.filter(k => k !== 'swiftfacture-v1').map(k => caches.delete(k)))
		)
	);
});

self.addEventListener('fetch', event => {
	event.respondWith(
		caches.match(event.request).then(response => {
			return response || fetch(event.request).catch(() => {
				if (event.request.mode === 'navigate') {
					return caches.match('/offline.html');
				}
			});
		})
	);
});
