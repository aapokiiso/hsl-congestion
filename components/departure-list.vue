<template>
    <ol class="departures">
        <li
            v-for="[trip, congestionRate] in sortedDepartures"
            :key="trip.id"
            class="departure"
            :class="{'departure--congested': isCongested(congestionRate)}"
        >
            <span class="departure__time">
                {{ formatDepartureTime(trip.stopDepartureTime) }}
            </span>
            <span
                class="departure__status"
            >
                {{ getCongestionText(congestionRate) }}
            </span>
        </li>
    </ol>
</template>

<script>
    import moment from 'moment';

    export default {
        props: {
            departures: {
                type: Array,
                required: true,
            },
            showPercentages: {
                type: Boolean,
                required: false,
                default: false,
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
                return moment(departureTime).format('LT');
            },
            getCongestionText(congestionRate) {
                if (this.showPercentages) {
                    const percentMultiplier = 100;
                    const congestionPercent = Math.round(congestionRate * percentMultiplier);

                    return `${congestionPercent}%`;
                }

                return this.isCongested(congestionRate)
                    ? 'FULL'
                    : 'OK';
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
        list-style: none;
        padding-left: 0;
    }

    .departure {
        display: flex;
        justify-content: space-between;
        margin: map-get($spacing-unit, 'base');
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
