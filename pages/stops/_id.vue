<template>
    <div>
        <page-header
            :title="pageTitle"
            back-action="/"
        />
        <main>
            <section
                v-if="hasDepartures"
                class="departures"
            >
                <h2 class="subtitle">
                    Departures congestion
                </h2>
                <departure-list
                    :departures="departures"
                    :show-percentages="showCongestionPercentages"
                />
                <footer
                    v-if="hasDepartures"
                    class="departures__actions"
                >
                    <button
                        v-if="!showCongestionPercentages"
                        class="button departures__action"
                        @click="toggleCongestionPercentages"
                    >
                        <span>Show percentages</span>
                    </button>
                    <button
                        v-if="showCongestionPercentages"
                        class="button departures__action"
                        @click="toggleCongestionPercentages"
                    >
                        <span>Show just status</span>
                    </button>
                </footer>
            </section>
            <p
                v-if="!hasDepartures"
                class="no-content-message"
            >
                No departures found.
            </p>
        </main>
    </div>
</template>

<script type="text/javascript">
    import axios from '~/plugins/axios';
    import PageHeader from '~/components/page-header';
    import DepartureList from '~/components/departure-list';
    import { mapState, mapGetters, mapMutations } from 'vuex';

    export default {
        components: {
            PageHeader,
            DepartureList,
        },
        computed: {
            ...mapState([
                'showCongestionPercentages',
            ]),
            ...mapGetters([
                'getStopById',
                'getRoutePatternForStop',
            ]),
            hasDepartures() {
                return this.departures.length > 0;
            },
            pageTitle() {
                const { name } = this.stop;
                const { headsign } = this.routePattern;

                return `${name} (towards ${headsign})`;
            },
            stop() {
                return this.getStopById(this.stopId);
            },
            routePattern() {
                return this.getRoutePatternForStop(this.stop.id);
            },
        },
        async asyncData(context) {
            const { id: stopId } = context.params;

            const { data: departures } = await axios.get(`/departures/${stopId}`);

            return {
                stopId,
                departures,
            };
        },
        methods: {
            ...mapMutations([
                'toggleCongestionPercentages',
            ]),
        },
    };
</script>

<style lang="scss" scoped>
    @import '../../assets/scss/includes/env';

    .subtitle {
        font-size: map-get($font-size, 'base');
    }

    .departures__actions {
        display: flex;
        flex-wrap: wrap;
        justify-content: flex-end;
        margin: map-get($spacing-unit, 'base');
    }
</style>
