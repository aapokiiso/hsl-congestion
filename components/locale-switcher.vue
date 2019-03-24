<template>
    <div>
        <button
            v-for="locale in locales"
            :key="locale"
            class="button"
            @click="setLocale(locale)"
        >
            {{ $t(`localeName.${locale}`) }}
        </button>
    </div>
</template>

<script>
    import { mapState, mapMutations } from 'vuex';

    export default {
        computed: {
            ...mapState({
                currentLocale: 'locale',
            }),
            locales() {
                return this.$i18n.availableLocales
                    .filter(locale => locale !== this.currentLocale);
            },
        },
        methods: {
            ...mapMutations([
                'setLocale',
            ]),
        },
    };
</script>

<style scoped>

</style>
