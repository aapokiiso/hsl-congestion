<template>
    <div>
        <page-header :title="$t('appName')" />
        <main>
            <section
                v-if="hasStops"
                class="stops-list stops-list--nearest"
            >
                <h2 class="stops-list__title">
                    {{ $t('stopList.nearestStopsTitle') }}
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
                    <span>{{ $t('stopList.nearestStopsFindAction') }}</span>
                </button>
                <button
                    v-if="isLocationAvailable && !hasRefreshedLocations"
                    class="button"
                    @click="refreshLocation"
                >
                    <icon-refresh class="button__icon" />
                    <span>{{ $t('stopList.nearestStopsRefreshAction') }}</span>
                </button>
                <button
                    v-if="hasRefreshedLocations"
                    class="button button--flush"
                    disabled
                >
                    <icon-check class="button__icon" />
                    <span>{{ $t('stopList.nearestStopsRefreshSuccess') }}</span>
                </button>
            </section>
            <section
                v-if="hasStops"
                class="stops-list stops-list--all"
            >
                <h2 class="stops-list__title">
                    {{ $t('stopList.allStopsTitle') }}
                </h2>
                <stop-list :stops="stops" />
            </section>
            <p
                v-if="!hasStops"
                class="no-content-message"
            >
                {{ $t('stopList.noStopsFound') }}
            </p>
        </main>
        <page-footer />
    </div>
</template>

<script type="text/javascript">
    import { mapState, mapGetters, mapMutations } from 'vuex';
    import PageHeader from '~/components/page-header';
    import PageFooter from '~/components/page-footer';
    import StopList from '~/components/stop-list';
    import IconRefresh from '~/assets/svg/refresh.svg';
    import IconCheck from '~/assets/svg/check.svg';

    export default {
        components: {
            PageHeader,
            PageFooter,
            StopList,
            IconRefresh,
            IconCheck,
        },
        data() {
            return {
                hasRefreshedLocations: false,
            };
        },
        head() {
            return {
                meta: [
                    { hid: 'description', name: 'description', content: this.$t('appDescription.short') },
                ],
            };
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
                    this.hasRefreshedLocations = true;
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

    .stops-list {
        margin: map-get($spacing-unit, 'double') 0;
    }

    .stops-list__title {
        font-size: map-get($font-size, 'base');
    }
</style>
