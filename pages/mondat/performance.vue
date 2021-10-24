/* Copyright Tooltwist Innovations Limited - All Rights Reserved
 * This file is part of DATP and as such is proprietary and confidential software.
 * Unauthorized copying of this file, via any medium is strictly prohibited. All
 * rights reserved. No warranty, explicit or implicit, provided. In no event shall
 * the author or owner be liable for any claim or damages.
 */
<template lang="pug">
  section.section
    b-field.is-pulled-right
      b-checkbox(v-model="autoUpdate") Auto-update
    h2.title.is-4
      .datemon-heading-icon
        b-icon(icon="gauge", size="is-small")
      | Recent Performance

    //- h2.title.is-3.has-text-grey
      | Performance&nbsp;&nbsp;
      b-icon(icon="gauge", size="is-large")

    DatemonNotification
      | Transaction throughput measures the current number of transactions per minute being processed.

    br
    .columns
      .column.my_column
        //- radial-gauge(:options="radialOptions", :value="txMin")
        template(v-for="p in performance15")
          template(v-if="p.stepType === 'pipeline'")
            br
            radial-gauge(:options="radialOptions", :value="p.perMinute")
            br
            | Past 15 seconds
            br
            h3.subtitle.is-6.has-text-grey
              | ({{p.count}} x {{p.ms}}ms)

      .column.my_column
        template(v-for="p in performance300")
          template(v-if="p.stepType === 'pipeline'")
            br
            radial-gauge(:options="radialOptions", :value="p.perMinute")
            br
            | Past five minutes
            br
            h3.subtitle.is-6.has-text-grey
              | ({{p.count}} x {{p.ms}}ms)

      .column.my_column
        template(v-for="p in performance1800")
          template(v-if="p.stepType === 'pipeline'")
            br
            radial-gauge(:options="radialOptions", :value="p.perMinute")
            br
            | Past half hour
            br
            h3.subtitle.is-6.has-text-grey
              | ({{p.count}} x {{p.ms}}ms)

      .column.my_column
        template(v-for="p in performance7200")
          template(v-if="p.stepType === 'pipeline'")
            br
            radial-gauge(:options="radialOptions", :value="p.perMinute")
            br
            | Past two hours
            br
            h3.subtitle.is-6.has-text-grey
              | ({{p.count}} x {{p.ms}}ms)

    br
    //- | {{performance300}}

    DatemonNotification
      | The following gauges show the average time for each step to complete, in milliseconds.
    br
    h3.subtitle.is-6.has-text-grey
      | All Steps
    linear-gauge(:value="77", :options="linearOptions")
</template>

<script>
import LinearGauge from '~/components/LinearGauge.vue'
import RadialGauge from '~/components/RadialGauge.vue'
import DatemonNotification from "~/components/DatmonNotification.vue"
import DatemonTable from "~/components/DatmonTable.vue"

const POLLING_INTERVAL = 5000

export default {
  components: {
    LinearGauge,
    RadialGauge,
    DatemonNotification,
    DatemonTable,
  },
  data: function () {
    return {

      txMin: 74,

      radialOptions: {
        // renderTo: 'canvas-id',
        width: 180,
        height: 180,
        units: "TX / min",
        minValue: 0,
        maxValue: 1000,
        majorTicks: [
            "0",
            "100",
            "200",
            "300",
            "400",
            "500",
            "600",
            "700",
            "800",
            "900",
            "1000",
            // "120",
            // "140",
            // "160",
            // "180",
            // "200",
            // "220"
        ],
        minorTicks: 2,
        strokeTicks: true,
        highlights: [
            {
                "from": 250,
                "to": 500,
                "color": "yellow"
            },
            {
                "from": 500,
                "to": 700,
                "color": "orange"
            },
            {
                "from": 700,
                "to": 1000,
                "color": "rgba(200, 50, 50, .75)"
            }
        ],
        // colorPlate: "#fff",
        colorPlate: "#ddd",
        borderShadowWidth: 0,
        borders: false,
        needleType: "arrow",
        needleWidth: 2,
        needleCircleSize: 7,
        needleCircleOuter: true,
        needleCircleInner: true,
        animationDuration: 1500,
        animationRule: "linear"
      },//- radialOptions

      // See https://canvas-gauges.com/documentation/api/
      linearOptions: {
        // renderTo: 'canvas-id',
        width: 400,
        height: 100,
        minValue: 0,
        maxValue: 100,
        majorTicks: [
            "0",
            "20",
            "40",
            "60",
            "80",
            "100"
        ],
        minorTicks: 4,
        strokeTicks: true,
        // colorPlate: "#fff",
        colorPlate: "#ddd",
        borderShadowWidth: 0,
        borders: false,
        barBeginCircle: false,
        tickSide: "left",
        numberSide: "left",
        needleSide: "left",
        needleType: "line",
        needleWidth: 5,
        // colorNeedle: "#222",
        colorNeedle: "red",
        colorNeedleEnd: "#222",
        animation: false,
        animationDuration: 1500,
        animationRule: "linear",
        animationTarget: "plate",
        // barWidth: 0,
        ticksWidth: 30,
        ticksWidthMinor: 15,
        highlights: [
            {
                "from": 25,
                "to": 50,
                "color": "yellow"
            },
            {
                "from": 50,
                "to": 70,
                "color": "orange"
            },
            {
                "from": 70,
                "to": 100,
                "color": "rgba(200, 50, 50, .75)"
            }
        ],
      },//- linearOptions

      autoUpdate: true,
      polling: null,
      performance15: [ ], // 15 seconds
      performance300: [ ], // five minutes
      performance1800: [ ], // 30 * 60 = half hour
      performance7200: [ ], // 120 * 60 = 2 hours
    }
  },//- data


  async asyncData({ $axios, $monitorEndpoint }) {
    const nodeId = 'master'
    const performance15 = await $axios.$get(`${$monitorEndpoint}/${nodeId}/recentPerformance?duration=15`)
    const performance300 = await $axios.$get(`${$monitorEndpoint}/${nodeId}/recentPerformance?duration=300`)
    const performance1800 = await $axios.$get(`${$monitorEndpoint}/${nodeId}/recentPerformance?duration=1800`)
    const performance7200 = await $axios.$get(`${$monitorEndpoint}/${nodeId}/recentPerformance?duration=7200`)
    return { performance15, performance300, performance1800, performance7200 }
  },//- asyncData

  created() {
    this.polling = setInterval(async () => {
      if (this.autoUpdate) {
        // console.log(`update`)
        const nodeId = 'master'
        this.performance15 = await this.$axios.$get(`${this.$monitorEndpoint}/${nodeId}/recentPerformance?duration=15`)
        this.performance300 = await this.$axios.$get(`${this.$monitorEndpoint}/${nodeId}/recentPerformance?duration=300`)
        this.performance1800 = await this.$axios.$get(`${this.$monitorEndpoint}/${nodeId}/recentPerformance?duration=1800`)
        this.performance7200 = await this.$axios.$get(`${this.$monitorEndpoint}/${nodeId}/recentPerformance?duration=7200`)
      }
    }, POLLING_INTERVAL)
  },//- created

  beforeDestroy () {
    clearInterval(this.polling)
  },//- beforeDestroy

}
</script>

<style lang="scss" scoped>
.my_column {
  text-align: center;
}
</style>
