<template>
<main class="app">
    HSL Congestion
</main>
</template>

<script>
'use strict';

export default {
    name: 'app'
};
</script>

<style lang="scss" type="text/scss">
@import "../../scss/setting.env";
@import "../../scss/tool.clearfix";

// -----------------------------------------------------------------------------
// #APP
// -----------------------------------------------------------------------------

:root {
    font-family: $font-family;
    font-size: map-get($em-base, 'default');
    box-sizing: border-box;
}

*, *:before, *:after {
    box-sizing: inherit;
}

body {
    margin: 0;
    overflow-y: scroll;
}
</style>
