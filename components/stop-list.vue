<template>
    <ul class="stops">
        <li
            v-for="stop in stops"
            :key="stop.id"
            class="stop"
        >
            <nuxt-link
                :to="{name: 'stops-id', params: {id: stop.id}}"
            >
                {{ stop.name }}
                <span class="direction">{{ directionDescription(stop.routePatternId) }}</span>
            </nuxt-link>
        </li>
    </ul>
</template>

<script>
    export default {
        props: {
            stops: {
                type: Array,
                required: true,
            },
        },
        methods: {
            directionDescription(routePatternId) {
                // @todo make dynamic
                if (routePatternId === 'HSL:1007:1:04') {
                    return 'towards Länsiterminaali';
                } else if (routePatternId === 'HSL:1007:0:02') {
                    return 'towards Länsi-Pasila';
                }

                return 'unknown route';
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
