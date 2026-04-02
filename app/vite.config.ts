import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
	plugins: [
		sveltekit(),
		VitePWA({
			registerType: 'autoUpdate',
			injectRegister: 'script',

			// Manifest — mirrors vanilla manifest.json
			manifest: {
				name: 'My Math Roots',
				short_name: 'My Math Roots',
				description: 'My Math Roots — K-5 Review — 10 units, 34 lessons, 2,502 questions',
				start_url: '/',
				scope: '/',
				display: 'standalone',
				orientation: 'portrait',
				background_color: '#4a90d9',
				theme_color: '#4a90d9',
				icons: [
					{
						src: '/icon-192.png',
						sizes: '192x192',
						type: 'image/png',
						purpose: 'any maskable',
					},
					{
						src: '/icon-512.png',
						sizes: '512x512',
						type: 'image/png',
						purpose: 'any maskable',
					},
				],
			},

			// Workbox — service worker config
			workbox: {
				// Precache all JS, CSS, HTML, fonts, and images from the build
				globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],

				// SPA fallback — all navigations return index.html
				navigateFallback: '/index.html',
				// Don't intercept Netlify function calls or Supabase
				navigateFallbackDenylist: [
					/^\/\.netlify\//,
					/^\/api\//,
				],

				runtimeCaching: [
					// ── Immutable versioned assets (/_app/immutable/**) ──────────
					// Hash is in the filename — safe to cache forever
					{
						urlPattern: /\/_app\/immutable\/.*/,
						handler: 'CacheFirst',
						options: {
							cacheName: 'sveltekit-immutable',
							expiration: { maxAgeSeconds: 60 * 60 * 24 * 365 }, // 1 year
						},
					},

					// ── Supabase API — never cache ────────────────────────────────
					{
						urlPattern: /supabase\.co\//,
						handler: 'NetworkOnly',
					},

					// ── Netlify Functions — network with offline fallback ─────────
					{
						urlPattern: /^https?:\/\/[^/]+\/\.netlify\/functions\//,
						handler: 'NetworkFirst',
						options: {
							cacheName: 'netlify-functions',
							networkTimeoutSeconds: 10,
						},
					},

					// ── Google Fonts ──────────────────────────────────────────────
					{
						urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\//,
						handler: 'StaleWhileRevalidate',
						options: { cacheName: 'google-fonts' },
					},

					// ── Static assets (icons, images) ─────────────────────────────
					{
						urlPattern: /\.(png|jpg|jpeg|svg|ico|webp)$/,
						handler: 'CacheFirst',
						options: {
							cacheName: 'images',
							expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 30 },
						},
					},
				],
			},
		}),
	],

	test: {
		environment: 'node',
		include: ['src/**/*.{test,spec}.{js,ts}'],
		exclude: ['src/**/*.svelte.{test,spec}.{js,ts}'],
	},
});
