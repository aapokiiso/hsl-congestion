import Vue from 'vue';
import VueI18n from 'vue-i18n';

Vue.use(VueI18n);

const defaultLocale = 'fi';

export default new VueI18n({
    locale: defaultLocale,
    messages: {
        fi: require('~/locale/fi/messages.json'),
        en: require('~/locale/en/messages.json'),
    },
    dateTimeFormats: {
        fi: require('~/locale/fi/datetime.json'),
        en: require('~/locale/en/datetime.json'),
    },
});
