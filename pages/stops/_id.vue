<template>
    <div>
        <page-header
            :title="pageTitle"
            back-action="/"
        />
        <main>
            <p
                v-if="!hasDepartures"
                class="no-content-message"
            >
                No departures found.
            </p>
            <departure-list
                v-if="hasDepartures"
                :departures="departures"
                :show-percentages="isInDebugMode"
            />
        </main>
    </div>
</template>

<script type="text/javascript">
    import axios from '~/plugins/axios';
    import PageHeader from '~/components/page-header';
    import DepartureList from '~/components/departure-list';
    import { mapState, mapGetters } from 'vuex';

    export default {
        components: {
            PageHeader,
            DepartureList,
        },
        computed: {
            ...mapState([
                'isInDebugMode',
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
    };
</script>
