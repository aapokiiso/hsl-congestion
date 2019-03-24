import VuexPersistence from 'vuex-persist';

export default ({ store }) => {
    window.onNuxtReady(() => {
        new VuexPersistence({
            reducer: state => ({
                location: state.location,
                showCongestionPercentages: state.showCongestionPercentages,
            }),
        }).plugin(store);
    });
};
