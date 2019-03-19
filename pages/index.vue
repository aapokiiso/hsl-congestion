<template>
    <div>
        <p>Select a stop...</p>
        <ul>
            <li
                v-for="stop in stops"
                :key="stop.id"
            >
                <nuxt-link
                    :to="{name: 'stops-id', params: {id: stop.id}}"
                >
                    {{ stop.name }} - {{ stop.routePatternId }}
                </nuxt-link>
            </li>
        </ul>
    </div>
</template>

<script type="text/javascript">
import axios from '~/plugins/axios';

export default {
    async asyncData() {
        const { data: stops } = await axios.get('/stops');

        return {
            stops,
        };
    },
};
</script>
