
<!-- See https://codesandbox.io/s/github/devstark-com/vue-google-charts/tree/master/legacy/sandboxes/column-chart -->
-->
<template>
<div>

  <GChart :type="type" :data="data" :options="options" />
  <!--
  <VueGoogleCharts :type="type" :data="data" :options="options"/>
  {{type}}
  -->
</div>
</template>

<script>
// import { GChart } from 'vue-google-charts/legacy';
// import { GChart } from 'vue-google-charts';

// import { chartType, chartData, chartOptions } from './GoogleChartData';

export default {
  name: 'GoogleChart',
  components: {
    // GChart,
  },
  props: {
    type: String,
    data: Array,
    options: Object,
  },
  data() {
    return {
      // type: chartType,
      // data: chartData,
      // options: chartOptions,
    };
  },
};
</script>
