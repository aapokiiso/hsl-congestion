export default {
    modules: [
        'nuxt-svg-loader',
    ],
    env: {
        apiBaseUrl: process.env.API_URL,
    },
    head: {
        link: [
            { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css?family=Roboto' },
        ],
    },
    css: [
        '~/assets/scss/defaults.scss',
    ],
};
