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
    import filterUnique from '~/helpers/filter-unique';

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

            const routePatternIds = stops
                .map(stop => stop.routePatternId)
                .filter(filterUnique);
            const routePatternResponses = await Promise.all(
                routePatternIds.map(patternId => axios.get(`/routePatterns/${patternId}`))
            );
            const routePatterns = routePatternResponses.map(res => res.data);

            const stopsWithRoutePatterns = stops.map(stop => {
                const routePattern = routePatterns
                    .find(pattern => pattern.id === stop.routePatternId);

                return Object.assign(stop, { routePattern });
            });

            return {
                stops: stopsWithRoutePatterns,
            };
        },
    };
</script>
