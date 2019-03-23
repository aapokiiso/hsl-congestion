import axios from '~/plugins/axios';

export const state = () => ({
    isInDebugMode: false,
    stops: [],
    routePatterns: [],
});

export const mutations = {
    setDebugMode(state, isDebug) {
        state.isInDebugMode = isDebug;
    },
    setStops(state, stops) {
        state.stops = stops;
    },
    setRoutePatterns(state, routePatterns) {
        state.routePatterns = routePatterns;
    },
};

export const getters = {
    getStopById: state => stopId => state.stops.find(({ id }) => id === stopId),
    getRoutePatternById: state => routePatternId => state.routePatterns.find(({ id }) => id === routePatternId),
    getRoutePatternForStop: (state, getters) => stopId => {
        const stop = getters.getStopById(stopId);
        const { routePatternId } = stop;

        return getters.getRoutePatternById(routePatternId);
    },
};

export const actions = {
    async nuxtServerInit({ commit }, { query }) {
        const [{ data: stops }, { data: routePatterns }] = await Promise.all([
            axios.get('/stops'),
            axios.get('/routePatterns'),
        ]);

        const isInDebugMode = typeof query.debug !== 'undefined';

        commit('setDebugMode', isInDebugMode);
        commit('setStops', stops);
        commit('setRoutePatterns', routePatterns);
    },
};
