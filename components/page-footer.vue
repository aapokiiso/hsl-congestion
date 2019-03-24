<template>
    <footer class="page-footer">
        <section>
            <h3 class="page-footer__subtitle">
                {{ $t('appFooter.localeSwitcherTitle') }}
            </h3>
            <locale-switcher />
        </section>
        <section>
            <h3 class="page-footer__subtitle">
                {{ $t('appFooter.title') }}
            </h3>
            <p class="page-footer__description">
                {{ $t('appDescription.long') }}
            </p>
        </section>
    </footer>
</template>

<script>
    import LocaleSwitcher from '~/components/locale-switcher';

    export default {
        components: {
            LocaleSwitcher,
        },
    };
</script>

<style lang="scss" scoped>
    @import '../assets/scss/includes/env';

    .page-footer {
        margin: 0 map-get($spacing-unit, 'base') map-get($spacing-unit, 'double');
    }

    .page-footer__subtitle {
        font-size: map-get($font-size, 'base');
    }
</style>
