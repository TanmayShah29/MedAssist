/**
 * MedAssist Service Worker
 *
 * SECURITY NOTE: Authenticated routes (/dashboard, /results, etc.) are
 * intentionally excluded from caching. Caching these would leave sensitive
 * health data on-device after sign-out and violate our privacy commitments.
 *
 * Only public, non-sensitive assets are cached.
 */

const CACHE_NAME = 'medassist-static-v2';

// Only cache public, unauthenticated assets
const ASSETS_TO_PRECACHE = [
    '/',
    '/manifest.json',
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_PRECACHE);
        }).then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            );
        }).then(() => self.clients.claim())
    );
});

// Routes that should NEVER be served from cache (auth-protected or dynamic)
const NEVER_CACHE = [
    '/dashboard',
    '/results',
    '/assistant',
    '/profile',
    '/settings',
    '/onboarding',
    '/auth',
    '/api/',
];

function shouldNeverCache(url) {
    const pathname = new URL(url).pathname;
    return NEVER_CACHE.some((route) => pathname.startsWith(route));
}

self.addEventListener('fetch', (event) => {
    const { request } = event;

    // Always skip non-GET requests and auth-protected routes
    if (request.method !== 'GET' || shouldNeverCache(request.url)) {
        event.respondWith(fetch(request));
        return;
    }

    // Network-first for HTML navigation (ensures fresh content)
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    // Cache the landing page for offline fallback
                    if (response.ok && new URL(request.url).pathname === '/') {
                        caches.open(CACHE_NAME).then((cache) => cache.put(request, response.clone()));
                    }
                    return response;
                })
                .catch(() => caches.match('/').then((cached) => cached || new Response(
                    '<h1>You are offline</h1><p>MedAssist requires an internet connection.</p>',
                    { headers: { 'Content-Type': 'text/html' } }
                )))
        );
        return;
    }

    // Cache-first for static assets (_next/static, icons, fonts)
    if (
        request.url.includes('/_next/static/') ||
        request.url.includes('/icon-') ||
        request.url.includes('/og-image')
    ) {
        event.respondWith(
            caches.match(request).then((cached) => {
                if (cached) return cached;
                return fetch(request).then((response) => {
                    if (response.ok) {
                        caches.open(CACHE_NAME).then((cache) => cache.put(request, response.clone()));
                    }
                    return response;
                });
            })
        );
        return;
    }

    // Default: network only (no caching for unknown routes)
    event.respondWith(fetch(request));
});
