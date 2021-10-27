/* Copyright Tooltwist Innovations Limited - All Rights Reserved
 * This file is part of DATP and as such is proprietary and confidential software.
 * Unauthorized copying of this file, via any medium is strictly prohibited. All
 * rights reserved. No warranty, explicit or implicit, provided. In no event shall
 * the author or owner be liable for any claim or damages.
 */
export default {
  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: 'mondate',
    htmlAttrs: {
      lang: 'en'
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' },
      { name: 'format-detection', content: 'telephone=no' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  },

  server: {
    host: '0.0.0.0'
  },

  vite: {
    ssr: false
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [
    // See https://github.com/buefy/nuxt-buefy/issues/43
    "@/assets/scss/main.scss"
  ],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
    '~plugins/config.js',
    // '~plugins/google-charts.js',
  ],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://vite.nuxtjs.org/getting-started/installation
    'nuxt-vite',
    // https://go.nuxtjs.dev/eslint
    '@nuxtjs/eslint-module',
    // https://google-fonts.nuxtjs.org/setup
    '@nuxtjs/google-fonts',
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    // https://go.nuxtjs.dev/buefy
    'nuxt-buefy',
    // https://go.nuxtjs.dev/axios
    '@nuxtjs/axios',
    // https://github.com/webcore-it/nuxt-clipboard2
    'nuxt-clipboard2',
  ],

  // Axios module configuration: https://go.nuxtjs.dev/config-axios
  axios: {

  },

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
  },
  buefy: {
    css: false
  },

  // https://google-fonts.nuxtjs.org/options
  googleFonts: {
    families: {
      'Work+Sans': true,
      // Lato: [100, 300],
      // Raleway: {
      //   wght: [100, 400],
      //   ital: [100]
      // },
    },
    display: 'swap'
  }

  // Hack/fix: See https://vite.nuxtjs.org/misc/common-issues/
  // ssr: false
}
