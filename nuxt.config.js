export default {
    plugins: [
        { src: '~/plugins/vuex-persist', ssr: false },
    ],
    modules: [
        'nuxt-svg-loader',
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
