/* Copyright Tooltwist Innovations Limited - All Rights Reserved
 * This file is part of DATP and as such is proprietary and confidential software.
 * Unauthorized copying of this file, via any medium is strictly prohibited. All
 * rights reserved. No warranty, explicit or implicit, provided. In no event shall
 * the author or owner be liable for any claim or damages.
 */
<template>
  <client-only>
    <canvas class="canvas-gauges"></canvas>
  </client-only>
</template>

<script>

export default {

  props: {
    value: Number,
    options: {
      type: Object,
      default: () => ({})
    }
  },

  data () {
    return {
      chart: null
    }
  },

  async mounted () {
    if (process.client) {
      const cg = await import('canvas-gauges')
      this.chart = new cg.LinearGauge(Object.assign(this.options, { renderTo: this.$el, value: this.value})).draw()
    }
  },

  beforeDestroy() {
    if (process.client) {
      this.chart.destroy()
    }
  },

  watch: {
    value (val) {
      this.chart.value = val
    }
  }

}
</script>
