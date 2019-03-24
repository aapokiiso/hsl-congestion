<template>
    <div>
        <page-header
            :title="pageTitle"
            back-action="/"
        />
        <main>
            <section
                v-if="hasDepartures"
                class="departures-list"
            >
                <h2 class="departures-list__title">
                    {{ $t('departureList.congestionTitle') }}
                </h2>
                <departure-list
                    :departures="departures"
                    :show-percentages="showCongestionPercentages"
                />
                <footer
                    v-if="hasDepartures"
                    class="departures-list__actions"
                >
                    <button
                        v-if="!showCongestionPercentages"
                        class="button departures-list__action"
                        @click="toggleCongestionPercentages"
                    >
                        <span>{{ $t('departureList.showCongestionPercentagesAction') }}</span>
                    </button>
                    <button
                        v-if="showCongestionPercentages"
                        class="button departures-list__action"
                        @click="toggleCongestionPercentages"
                    >
                        <span>{{ $t('departureList.showCongestionStatusAction') }}</span>
                    </button>
                </footer>
            </section>
            <p
                v-if="!hasDepartures"
                class="no-content-message"
            >
                {{ $t('departureList.noDeparturesFound') }}
            </p>
        </main>
        <page-footer />
    </div>
</template>

<script type="text/javascript">
    import axios from '~/plugins/axios';
    import PageHeader from '~/components/page-header';
    import PageFooter from '~/components/page-footer';
    import DepartureList from '~/components/departure-list';
    import { mapState, mapGetters, mapMutations } from 'vuex';

    export default {
        components: {
            PageHeader,
            PageFooter,
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

                return `${name} (${this.$t('directionDescription', { headsign })})`;
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

    .departures-list {
        margin: map-get($spacing-unit, 'double') 0;
    }

    .departures-list__title {
        font-size: map-get($font-size, 'base');
    }

    .departures-list__actions {
        display: flex;
        flex-wrap: wrap;
        justify-content: flex-end;
        margin: map-get($spacing-unit, 'base');
    }
</style>
