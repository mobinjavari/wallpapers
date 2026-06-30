import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  ssr: true,
  devtools: { enabled: false },

  vite: {
    plugins: [tailwindcss()],
  },

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    githubToken: process.env.GITHUB_TOKEN || '',
    public: {
      siteUrl: process.env.PUBLIC_SITE_URL || '',
    },
  },

  app: {
    head: {
      htmlAttrs: { lang: 'en', class: 'scroll-smooth' },
      script: [
        {
          innerHTML: `(function(){try{var s=localStorage.getItem('theme');if(s==='dark')document.documentElement.classList.add('dark');else if(s==='light')document.documentElement.classList.add('light')}catch(e){}})()`,
        },
      ],
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
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
        },
      ],
    },
  },
})
