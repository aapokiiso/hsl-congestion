<template>
    <table class="departures">
        <thead>
            <tr>
                <th>Arrives at</th>
                <th>Congestion rate</th>
            </tr>
        </thead>
        <tbody>
            <tr
                v-for="[trip, congestionRate] in departures"
                :key="trip.id"
            >
                <td>{{ trip.departureTime }}</td>
                <td>{{ formatCongestionRate(congestionRate) }}</td>
            </tr>
        </tbody>
    </table>
</template>

<script>
    export default {
        props: {
            departures: {
                type: Array,
                required: true,
            },
        },
        methods: {
            formatCongestionRate(rawValue) {
                const percentMultiplier = 100;

                return `${Math.round(rawValue * percentMultiplier)}%`;
            },
        },
    };
</script>

<style lang="scss" scoped>
    @import '../assets/scss/includes/env';

    .departures {
        width: 100%;

        th {
            text-align: left;
        }

        th,
        td {
            padding: map-get($spacing-unit, 'crack');
        }
    }
</style>
