<template>
    <div>
        <page-header title="HSL Tram 7 Congestion" />
        <main>
            <section
                v-if="hasStops"
                class="stops stops--nearest"
            >
                <h2 class="stops__title">
                    Nearest stops
                </h2>
                <stop-list
                    v-if="isLocationAvailable"
                    :stops="nearestStops"
                />
                <button
                    v-if="!isLocationAvailable"
                    class="button"
                    @click="refreshLocation"
                >
                    <span>Find nearest stops</span>
                </button>
                <button
                    v-if="isLocationAvailable"
                    class="button"
                    @click="refreshLocation"
                >
                    <icon-refresh class="button__icon" />
                    <span>Refresh nearest stops</span>
                </button>
            </section>
            <section
                v-if="hasStops"
                class="stops stops--all"
            >
                <h2 class="stops__title">
                    All stops
                </h2>
                <stop-list :stops="stops" />
            </section>
            <p
                v-if="!hasStops"
                class="no-content-message"
            >
                No stops found.
            </p>
        </main>
    </div>
</template>

<script type="text/javascript">
    import { mapState, mapGetters, mapMutations } from 'vuex';
    import PageHeader from '~/components/page-header';
    import StopList from '~/components/stop-list';
    import IconRefresh from '~/assets/svg/refresh.svg';

    export default {
        components: {
            PageHeader,
            StopList,
            IconRefresh,
        },
        computed: {
            hasStops() {
                return this.stops.length > 0;
            },
            ...mapState([
                'stops',
                'location',
            ]),
            ...mapGetters([
                'isLocationAvailable',
                'getDistanceFromLocation',
            ]),
            nearestStops() {
                if (!this.isLocationAvailable) {
                    return [];
                }

                const stopsSortedByProximity = this.stops.slice()
                    .sort((stop1, stop2) => this.getDistanceFromStop(stop1) - this.getDistanceFromStop(stop2));

                const stopsLimit = 4;

                return stopsSortedByProximity.slice(0, stopsLimit);
            },
        },
        methods: {
            ...mapMutations([
                'setLocation',
            ]),
            refreshLocation() {
                window.navigator.geolocation.getCurrentPosition(position => {
                    this.setLocation(position.coords);
                });
            },
            getDistanceFromStop(stop) {
                return this.getDistanceFromLocation(stop.latitude, stop.longitude);
            },
        },
    };
</script>

<style lang="scss" scoped>
    @import '../assets/scss/includes/env';

    .stops__title {
        font-size: map-get($font-size, 'base');
    }
</style>
