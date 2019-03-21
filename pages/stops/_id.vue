<template>
    <div>
        <page-header
            :title="stop.name"
            back-action="/"
        />
        <main>
            <p
                v-if="!hasDepartures"
                class="no-content-message"
            >
                No departures found.
            </p>
            <departure-table
                v-if="hasDepartures"
                :departures="departures"
            />
        </main>
    </div>
</template>

<script type="text/javascript">
    import axios from '~/plugins/axios';
    import PageHeader from '~/components/page-header';
    import DepartureTable from '~/components/departure-table';

    export default {
        components: {
            PageHeader,
            DepartureTable,
        },
        computed: {
            hasDepartures() {
                return this.departures.length > 0;
            },
        },
        async asyncData(context) {
            const { id: stopId } = context.params;

            const [{ data: stop }, { data: departures }] = await Promise.all([
                axios.get(`/stops/${stopId}`),
                axios.get(`/departures/${stopId}`),
            ]);

            return {
                stop,
                departures,
            };
        },
    };
</script>
