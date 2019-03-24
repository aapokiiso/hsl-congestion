import axios from '~/plugins/axios';

export const state = () => ({
    stops: [],
    routePatterns: [],
    location: {},
    showCongestionPercentages: false,
});

export const mutations = {
    setStops(state, stops) {
        state.stops = stops;
    },
    setRoutePatterns(state, routePatterns) {
        state.routePatterns = routePatterns;
    },
    setLocation(state, { latitude, longitude }) {
        state.location = {
            latitude,
            longitude,
        };
    },
    toggleCongestionPercentages(state) {
        state.showCongestionPercentages = !state.showCongestionPercentages;
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
    isLocationAvailable: state => state.location.latitude && state.location.longitude,
    getDistanceFromLocation: state => (compareLatitude, compareLongitude) => {
        const { latitude, longitude } = state.location;

        const squarePow = 2;

        return Math.sqrt(
            Math.pow(compareLatitude - latitude, squarePow)
                + Math.pow(compareLongitude - longitude, squarePow)
        );
    },
};

export const actions = {
    async nuxtServerInit({ state, commit }) {
        const [{ data: stops }, { data: routePatterns }] = await Promise.all([
            axios.get('/stops'),
            axios.get('/routePatterns'),
        ]);

        commit('setStops', stops);
        commit('setRoutePatterns', routePatterns);
    },
};
