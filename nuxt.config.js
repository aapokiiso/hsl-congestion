export default {
    modules: [
        'nuxt-svg-loader',
    ],
    plugins: [
        { src: '~/plugins/vuex-persist', ssr: false },
        '~/plugins/i18n',
        { src: '~/plugins/i18n-restore', ssr: false },
    ],
    env: {
        apiBaseUrl: process.env.API_URL,
    },
    head: {
        meta: [
            { charset: 'utf-8' },
            { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        ],
        link: [
            { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css?family=Roboto' },
        ],
    },
    css: [
        '~/assets/scss/defaults.scss',
    ],
};
