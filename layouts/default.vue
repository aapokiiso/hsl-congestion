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
        background-color: $color-background;
        overflow: hidden;
        min-height: 100vh;
    }

    .app {
        background-color: $color-contrast;
        max-width: map-get($spacing-unit, 'max');
        overflow: hidden;
    }

    @media (min-width: map-get($spacing-unit, 'max')) {
        .app {
            margin: percentage(.1 / $phi) auto;
            border-radius: map-get($border-radius, 'app');
            box-shadow: map-get($box-shadow, 'app');
        }
    }
</style>
