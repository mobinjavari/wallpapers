import tailwindcss from '@tailwindcss/vite'

// Google Fonts stylesheet URL, reused for the preload + swap pair below.
const FONT_HREF = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'

// Inline theme-detection script (kept byte-for-byte identical to the CSP hash below).
const THEME_SCRIPT = `(function(){try{var s=localStorage.getItem('theme');if(s==='dark')document.documentElement.classList.add('dark');else if(s==='light')document.documentElement.classList.add('light')}catch(e){}})()`

// Content-Security-Policy, split by directive for readability.
const CSP_DIRECTIVES = [
  'default-src \'self\'',
  'base-uri \'self\'',
  'object-src \'none\'',
  // 'unsafe-hashes' + hash covers the two inline handlers below (theme script + font-swap onload);
  // both are static, build-time strings — no 'unsafe-inline' needed. The third hash is Vite's
  // built-in modulepreload polyfill, which Nuxt injects verbatim into every production page
  // head — it's static per Vite version, not per-request, so it's safe to hash like the others.
  // If it ever starts drifting (a new distinct violation on reload/navigation), that means
  // something IS request-dynamic and needs a different fix (CSP nonces) instead of a hash.
  'script-src \'self\' \'unsafe-hashes\' \'sha256-id7f2Eqrgp6zVTgAVWHCbx0FQro3zsJq68fSwajWQXU=\' \'sha256-MhtPZXr7+LpJUY5qtMutB+qWfQtMaPccfe7QXtCcEYc=\' \'sha256-zVWlRPqUGbz8JSdAgyW8fiAxjb69xSU+Mq5fesxo7R4=\'',
  // 'unsafe-inline' here (unlike script-src) is a deliberate, standard tradeoff: Vue's runtime
  // sets inline style attributes directly via JS (e.g. v-show toggling `display:none`) with
  // values that vary and can't be pinned to a fixed hash. Inline-style injection is a much
  // lower-severity vector than inline-script injection, so relaxing only this directive keeps
  // the policy's real teeth (strict script-src) while not fighting Vue's own internals.
  'style-src \'self\' \'unsafe-inline\' https://fonts.googleapis.com',
  'font-src \'self\' https://fonts.gstatic.com',
  // images.weserv.nl serves thumbnails, raw.githubusercontent.com is the source wallpaper + direct-download fetch, avatars.githubusercontent.com is author avatars
  'img-src \'self\' data: https://images.weserv.nl https://raw.githubusercontent.com https://avatars.githubusercontent.com',
  'connect-src \'self\' https://raw.githubusercontent.com',
  'frame-ancestors \'self\'',
  'form-action \'self\'',
  'upgrade-insecure-requests',
].join('; ')

export default defineNuxtConfig({
  modules: ['@nuxt/eslint'],
  ssr: true,
  devtools: { enabled: false },

  app: {
    head: {
      htmlAttrs: { lang: 'en', class: 'scroll-smooth' },
      script: [{ innerHTML: THEME_SCRIPT }],
      meta: [
        { charset: 'UTF-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1.0, viewport-fit=cover' },
        { name: 'color-scheme', content: 'light dark' },
        { name: 'robots', content: 'index, follow' },
        {
          name: 'keywords',
          content:
            'wallpapers, minimalist wallpaper, 4k background, aesthetic wallpaper, open source gallery, desktop backgrounds',
        },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        // Thumbnail CDN — preconnecting shaves the TCP+TLS handshake off the first image request.
        { rel: 'preconnect', href: 'https://images.weserv.nl' },
        // Non-render-blocking font load: fetched at low priority via media="print", then
        // swapped to media="all" on load so it never delays first paint.
        { rel: 'preload', as: 'style', href: FONT_HREF },
        { rel: 'stylesheet', href: FONT_HREF, media: 'print', onload: 'this.media=\'all\'' },
      ],
      noscript: [{ innerHTML: `<link rel="stylesheet" href="${FONT_HREF}">` }],
    },
  },

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    githubToken: process.env.GITHUB_TOKEN || '',
    public: {
      siteUrl: process.env.PUBLIC_SITE_URL || '',
    },
  },

  // Security headers are only enforced for `nuxt build`/production — kept off in `nuxt dev`
  // so Vite's HMR client (which injects inline <style> tags) isn't blocked by style-src.
  routeRules:
    process.env.NODE_ENV === 'production'
      ? {
          '/**': {
            headers: {
              // TEMPORARY: Report-Only while we diagnose what's actually being blocked in
              // production — logs violations to the console without enforcing anything, so the
              // site works while we get the exact culprit. Switch back to 'Content-Security-Policy'
              // (enforcing) once the console is clean.
              'Content-Security-Policy-Report-Only': CSP_DIRECTIVES,
              'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
              'X-Frame-Options': 'SAMEORIGIN',
              'X-Content-Type-Options': 'nosniff',
              'Cross-Origin-Opener-Policy': 'same-origin',
              'Referrer-Policy': 'strict-origin-when-cross-origin',
              'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
            },
          },
        }
      : undefined,
  compatibilityDate: '2025-07-15',

  vite: {
    plugins: [tailwindcss()],
  },
  eslint: {
    config: {
      stylistic: true,
    },
  },
})
