<template>
    <header class="app-header">
        <div
            v-if="hasActions"
            class="actions"
        >
            <nuxt-link
                :to="backAction"
                class="action action--back"
            >
                <icon-chevron-left class="action__icon" />
                <span>Back</span>
            </nuxt-link>
        </div>
        <h1 class="title">
            {{ title }}
        </h1>
    </header>
</template>

<script>
    import IconChevronLeft from '~/assets/svg/chevron-left.svg';

    export default {
        components: {
            IconChevronLeft,
        },
        props: {
            title: {
                type: String,
                required: true,
            },
            backAction: {
                type: String,
                required: false,
                default: null,
            },
        },
        computed: {
            hasActions() {
                return this.backAction;
            },
        },
    };
</script>

<style lang="scss" scoped>
    @import '../assets/scss/includes/env';

    .app-header {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        background-color: map-get($color-palette, 'theme');
        color: map-get($color-palette, 'theme-contrast');
        position: relative;
        padding: map-get($spacing-unit, 'base');
    }

    .actions {
        margin-right: map-get($spacing-unit, 'base');
    }

    .action {
        display: inline-flex;
        line-height: map-get($spacing-unit, 'base');
        padding: map-get($spacing-unit, 'crack');
        background-color: map-get($color-palette, 'theme-dark');
        border-radius: map-get($border-radius, 'button');

        &:hover,
        &:focus {
            background-color: darken(map-get($color-palette, 'theme-dark'), $phi * 10);
        }
    }

    .action__icon {
        float: left;
        width: map-get($spacing-unit, 'base');
        height: map-get($spacing-unit, 'base');
        fill: map-get($color-palette, 'theme-contrast');
        margin-right: map-get($spacing-unit, 'crack');
    }

    .title {
        margin: 0;
        padding: map-get($spacing-unit, 'crack');
        font-size: map-get($font-size, 'base');
    }
</style>
