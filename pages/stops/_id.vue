<template>
    <div>
        <h1>{{ stop.name }} - {{ stop.routePatternId }}</h1>
        <p v-if="!hasDepartures">No departures found.</p>
        <ol v-if="hasDepartures">
            <li v-for="[trip, congestionRate] in departures">
                Departed at: {{ trip.departureTime }} -
                {{ formatCongestionRate(congestionRate) }}
            </li>
        </ol>
    </div>
</template>

<script type="text/javascript">
    import axios from '~/plugins/axios';

    export default {
        computed: {
            hasDepartures() {
                return this.departures.length > 0;
            }
        },
        methods: {
            formatCongestionRate(rawValue) {
                return `${Math.round(rawValue * 100)}%`;
            }
        },
        async asyncData(context) {
            const {id: stopId} = context.params;

            const [{data: stop}, {data: departures}] = await Promise.all([
                axios.get(`/stops/${stopId}`),
                axios.get(`/departures/${stopId}`)
            ]);
console.log(stop)
            return {
                stop,
                departures,
            };
        }
    };
</script>
