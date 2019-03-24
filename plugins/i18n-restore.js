export default ({ app, store }) => {
    window.onNuxtReady(() => {
        app.i18n.locale = store.state.locale;
    });
};
