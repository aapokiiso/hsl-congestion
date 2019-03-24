<template>
    <ul class="stops">
        <li
            v-for="stop in sortedStops"
            :key="stop.id"
            class="stop"
        >
            <nuxt-link
                :to="{name: 'stops-id', params: {id: stop.id}}"
            >
                {{ stop.name }}
                <span
                    v-if="directionDescription(stop)"
                    class="direction"
                >{{ directionDescription(stop) }}</span>
            </nuxt-link>
        </li>
    </ul>
</template>

<script>
    import { mapGetters } from 'vuex';

    export default {
        props: {
            stops: {
                type: Array,
                required: true,
            },
        },
        computed: {
            sortedStops() {
                return this.stops.slice()
                    .sort(this.sortStopsAlphabetically);
            },
            ...mapGetters([
                'getRoutePatternForStop',
            ]),
        },
        methods: {
            directionDescription(stop) {
                const routePattern = this.getRoutePatternForStop(stop.id);

                return routePattern
                    ? this.$t('directionDescription', { headsign: routePattern.headsign })
                    : null;
            },
            sortStopsAlphabetically(stop1, stop2) {
                const nameComparison = stop1.name.localeCompare(stop2.name);

                if (nameComparison === 0) {
                    return stop1.routePatternId.localeCompare(stop2.routePatternId);
                }

                return nameComparison;
            },
        },
    };
</script>

<style lang="scss" scoped>
    @import '../assets/scss/includes/env';

    .stops {
        list-style: none;
        padding-left: 0;
    }

    .stop {
        margin: map-get($spacing-unit, 'base');
    }

    .direction {
        color: map-get($color-palette, 'text-secondary');

        &::before {
            content: '(';
        }

        &::after {
            content: ')';
        }
    }
</style>
