<template>
    <div class="page">
        <page-header :title="stop.name" backAction="/" />
        <main>
            <p v-if="!hasDepartures">No departures found.</p>
            <ol v-if="hasDepartures">
                <li v-for="[trip, congestionRate] in departures">
                    Departed at: {{ trip.departureTime }} -
                    {{ formatCongestionRate(congestionRate) }}
                </li>
            </ol>
        </main>
    </div>
</template>

<script type="text/javascript">
    import axios from '~/plugins/axios';
    import PageHeader from '~/components/page-header';

    export default {
        components: {
            PageHeader,
        },
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

            return {
                stop,
                departures,
            };
        }
    };
</script>
