<template>
    <header class="app-header">
        <nuxt-link :to="backAction" v-if="hasBackAction" class="back-action">
            <icon-chevron-left class="back-action__icon" />
            <span>Back</span>
        </nuxt-link>
        <h1 class="title">{{ title }}</h1>
    </header>
</template>

<script>
    import IconChevronLeft from '~/assets/svg/chevron-left.svg';

    export default {
        name: 'app-header',
        components: {
            IconChevronLeft,
        },
        props: ['title', 'backAction'],
        computed: {
            hasBackAction() {
                return this.backAction;
            }
        }
    }
</script>

<style lang="scss" scoped>
    @import '../assets/scss/includes/env';

    .app-header {
        background-color: $color-primary;
        color: $color-contrast;
        position: relative;
        padding: map-get($spacing-unit, 'base');
    }

    .back-action {
        display: flex;
        align-items: center;
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        line-height: map-get($spacing-unit, 'base');
        padding: map-get($spacing-unit, 'base');
    }

    .back-action__icon {
        width: map-get($spacing-unit, 'base');
        height: map-get($spacing-unit, 'base');
        fill: $color-contrast;
        margin-right: map-get($spacing-unit, 'crack');
    }

    .title {
        margin: 0;
        text-align: center;
        font-size: map-get($font-size, 'large');
    }
</style>
