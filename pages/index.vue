<template>
    <div>
        <page-header title="HSL Tram 7 Congestion" />
        <main>
            <p
                v-if="!hasStops"
                class="no-content-message"
            >
                No stops found.
            </p>
            <stop-list
                v-if="hasStops"
                :stops="stops"
            />
        </main>
    </div>
</template>

<script type="text/javascript">
    import axios from '~/plugins/axios';
    import PageHeader from '~/components/page-header';
    import StopList from '~/components/stop-list';

    export default {
        components: {
            PageHeader,
            StopList,
        },
        computed: {
            hasStops() {
                return this.stops.length > 0;
            },
        },
        async asyncData() {
            const { data: stops } = await axios.get('/stops');

            return {
                stops,
            };
        },
    };
</script>
