<template>
    <header class="app-header">
        <div
            v-if="hasActions"
            class="actions"
        >
            <nuxt-link
                :to="backAction"
                class="button action action--back"
            >
                <icon-chevron-left class="button__icon" />
                <span>{{ $t('commonAction.goBack') }}</span>
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
        head() {
            return {
                title: this.title,
            };
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

    // ----------------------------------------------------------------------------
    // #PAGE-HEADER
    //
    // Footnotes:
    // [1] In case title is long, it gets wrapped under actions. Work around that
    //     by transferring header bottom padding as margin to actions & title.
    // ----------------------------------------------------------------------------

    .app-header {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        background-color: map-get($color-palette, 'theme');
        color: map-get($color-palette, 'theme-contrast');
        position: relative;
        padding: map-get($spacing-unit, 'base') map-get($spacing-unit, 'base') 0; // [1]
    }

    .actions {
        margin-right: map-get($spacing-unit, 'base');
        margin-bottom: map-get($spacing-unit, 'base'); // [1]
    }

    .action {
        background-color: map-get($color-palette, 'theme-dark');

        &:hover,
        &:focus {
            background-color: darken(map-get($color-palette, 'theme-dark'), $phi * 10);
        }
    }

    .title {
        margin: 0 0 map-get($spacing-unit, 'base'); // [1]
        font-size: map-get($font-size, 'base');
    }
</style>
