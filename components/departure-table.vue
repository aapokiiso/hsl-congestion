<template>
    <table class="departures">
        <tbody>
            <tr
                v-for="[trip, congestionRate] in sortedDepartures"
                :key="trip.id"
                class="departure"
                :class="{'departure--congested': isCongested(congestionRate)}"
            >
                <td class="departure__time">
                    {{ formatDepartureTime(trip.departureTime) }}
                </td>
                <td
                    v-if="isCongested(congestionRate)"
                    class="departure__status"
                >
                    Full
                </td>
                <td
                    v-if="!isCongested(congestionRate)"
                    class="departure__status"
                >
                    OK
                </td>
            </tr>
        </tbody>
    </table>
</template>

<script>
    import moment from 'moment';

    export default {
        props: {
            departures: {
                type: Array,
                required: true,
            },
        },
        computed: {
            sortedDepartures() {
                return this.departures.slice()
                    .sort(this.sortDeparturesAscending);
            },
        },
        methods: {
            formatDepartureTime(departureTime) {
                return moment(departureTime).format('hh:mm');
            },
            isCongested(congestionRate) {
                const congestionThreshold = 0.8;

                return congestionRate > congestionThreshold;
            },
            sortDeparturesAscending(departure1, departure2) {
                const [trip1] = departure1;
                const [trip2] = departure2;

                return moment(trip1.departureTime).toDate() - moment(trip2.departureTime).toDate();
            },
        },
    };
</script>

<style lang="scss" scoped>
    @import '../assets/scss/includes/env';

    .departures {
        width: 100%;
    }

    .departure {
        padding: map-get($spacing-unit, 'crack');
    }

    .departure__status {
        text-transform: uppercase;
        color: map-get($color-palette, 'text-secondary');
        text-align: right;
        font-weight: bold;
    }

    .departure--congested .departure__status {
        color: map-get($color-palette, 'bad');
    }
</style>
