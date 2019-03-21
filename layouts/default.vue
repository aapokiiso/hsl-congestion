<template>
    <div class="backdrop">
        <div class="app">
            <Nuxt />
        </div>
    </div>
</template>

<style lang="scss" scoped>
    @import '../assets/scss/includes/env';

    .backdrop {
        overflow: hidden;
        min-height: 100vh;
    }

    .app {
        background-color: map-get($color-palette, 'theme-contrast');
        max-width: map-get($spacing-unit, 'max');
        overflow: hidden;
    }

    @media (min-width: map-get($spacing-unit, 'max')) {
        .backdrop {
            background-color: map-get($color-palette, 'background');
        }

        .app {
            margin: percentage(.1 / $phi) auto;
            border-radius: map-get($border-radius, 'app');
            box-shadow: map-get($box-shadow, 'app');
        }
    }
</style>
