/* Copyright Tooltwist Innovations Limited - All Rights Reserved
 * This file is part of DATP and as such is proprietary and confidential software.
 * Unauthorized copying of this file, via any medium is strictly prohibited. All
 * rights reserved. No warranty, explicit or implicit, provided. In no event shall
 * the author or owner be liable for any claim or damages.
 */
<template lang="pug">
client-only
  section.section
    b-field.is-pulled-right
      b-checkbox(v-model="autoUpdate") Auto-update
    h2.title.is-4
      .mondat-heading-icon
        b-icon(icon="gauge", size="is-small")
      | Recent Performance


    MondatNotification
      | A pipeline is a series of steps used to process a transaction.
      | Each transaction type maps onto a specific pipeline, however the steps in a pipeline may delegate their funcrtionality
      | by invoking further pipelines.


    span(v-if="loading")
      | Loading...
    span(v-else-if="loadError")
      .notification.is-danger() {{loadError}}
    template(v-else)

      //- GoogleChart(type="ColumnChart",  :data="chartDataForPipelines()", :options="chartOptions")
      //- br
      //- br
      //- //- | {{chartData}}
      //- //- br
      //- //- | {{metrics}}
      //- br
      //- br
      //- br
      //- | {{currentTab}}
      b-tabs(v-model="currentTab")
        b-tab-item(value="transactions", label="Transactions")
          h2.title.is-4 Transaction starts
          GoogleChart(type="ColumnChart", :data="chartDataForParameter('TX', `tx:::queued`)", :options="chartOptions")
          h2.title.is-7 Combined
          hr
          template(v-for="pipeline in pipelines")
            template(v-if="haveChartData(`tx:::${pipeline}:::start`)")
              GoogleChart(type="ColumnChart", :data="chartDataForParameter(pipeline, `tx:::${pipeline}:::queued`)", :options="chartOptions")
              h2.title.is-7 {{pipeline}}

        //- b-tab-item(value="system", label="System")
          GoogleChart(type="ColumnChart", :data="chartDataForParameter('Pipelines', `queued`)", :options="chartOptions")
          //- | {{dataSeries('in')}}

        b-tab-item(value="pipelines", label="Pipelines")
          //- | {{pipelines}}
          //- br
          template(v-for="pipeline in pipelines")
            GoogleChart(type="ColumnChart", :data="chartDataForParameter('q', `p:::${pipeline}:::queued`, 's', `p:::${pipeline}:::queued`, 'e', `p:::${pipeline}:::queued`)", :options="chartOptions")
            h2.title.is-7 {{pipeline}}
            //- | {{dataSeries(`p:::${pipeline}`)}}

        b-tab-item(value="nodeGroups", label="Node groups")
          //- | {{nodeGroups}}
          template(v-for="group in nodeGroups")
            GoogleChart(type="ColumnChart", :data="chartDataForParameter('in', `iLen:::${group}`, 'out', `oLen:::${group}`)", :options="chartOptions")
            GoogleChart(type="ColumnChart", :data="chartDataForParameter('q', `g:::${group}:::queued`)", :options="chartOptions")
            h2.title.is-7 {{group}}
            //- | {{dataSeries(`g:::${group}`)}}

        b-tab-item(value="users", label="Users")
          //- | {{owners}}
          template(v-for="owner in owners")
            GoogleChart(type="ColumnChart", :data="chartDataForParameter('Qd', `o:::${owner}:::queued`)", :options="chartOptions")
            h2.title.is-7 {{owner}}
            //- | {{dataSeries(`o:::${owner}:::in`)}}

    //- h2.title.is-3.has-text-grey
      | Performance&nbsp;&nbsp;
      b-icon(icon="gauge", size="is-large")

    //- MondatNotification
      | Transaction throughput measures the current number of transactions per minute being processed.

    //- br
    //- .columns
      .column.my_column
        //- lazy-radial-gauge(:options="radialOptions", :value="txMin")
        template(v-for="p in performance15")
          template(v-if="p.stepType === 'hidden/pipeline'")
            br
            lazy-radial-gauge(:options="radialOptions", :value="p.perMinute")
            br
            | Past 15 seconds
            br
            h3.subtitle.is-6.has-text-grey
              | ({{p.count}} x {{p.ms}}ms)

      .column.my_column
        template(v-for="p in performance300")
          template(v-if="p.stepType === 'hidden/pipeline'")
            br
            lazy-radial-gauge(:options="radialOptions", :value="p.perMinute")
            br
            | Past five minutes
            br
            h3.subtitle.is-6.has-text-grey
              | ({{p.count}} x {{p.ms}}ms)

      .column.my_column
        template(v-for="p in performance1800")
          template(v-if="p.stepType === 'hidden/pipeline'")
            br
            lazy-radial-gauge(:options="radialOptions", :value="p.perMinute")
            br
            | Past half hour
            br
            h3.subtitle.is-6.has-text-grey
              | ({{p.count}} x {{p.ms}}ms)

      .column.my_column
        template(v-for="p in performance7200")
          template(v-if="p.stepType === 'hidden/pipeline'")
            br
            lazy-radial-gauge(:options="radialOptions", :value="p.perMinute")
            br
            | Past two hours
            br
            h3.subtitle.is-6.has-text-grey
              | ({{p.count}} x {{p.ms}}ms)

    br
    //- | {{performance300}}

    //- MondatNotification
      | The following gauges show the average time for each step to complete, in milliseconds.
    //- br
    //- h3.subtitle.is-6.has-text-grey
    //-   | All Steps
    //- lazy-linear-gauge(:value="77", :options="linearOptions")

</template>

<script>
import LazyLinearGauge from '~/components/LazyLinearGauge.vue'
import LazyRadialGauge from '~/components/LazyRadialGauge.vue'
import MondatNotification from "~/components/MondatNotification.vue"
import MondatTable from "~/components/MondatTable.vue"

// // Wrapper for Highcharts
// // See https://github.com/highcharts/highcharts-vue#readme
// import { Chart } from 'highcharts-vue'
// // See https://api.highcharts.com/highcharts/?_ga=2.68170002.2076730312.1649598031-627947766.1649598031
// // import Highcharts from 'highcharts'
// // import Column from 'highcharts/modules/column'
// // Column(Highcharts)
// import { GChart } from 'vue-google-charts/legacy'
import GoogleChart from '~/components/google-chart/GoogleChart.vue';



const POLLING_INTERVAL = 5000

export default {
  components: {
    LazyLinearGauge,
    LazyRadialGauge,
    MondatNotification,
    MondatTable,
    // Chart,
    // GChart,
    GoogleChart,
  },
  data: function () {
    return {
      loading: true,
      loadError: null,
      currentTab: 'transactions',
      metrics: { },


      chartType: 'ColumnChart',

      // Array will be automatically processed with visualization.arrayToDataTable function
      chartData: [
        ['Year', 'Sales', 'Expenses', 'Profit'],
        ['2014', 1000, 400, 200],
        ['2015', 1170, 460, 250],
        ['2016', 660, 1120, 300],
        ['2017', 1030, 540, 350]
      ],
      chartOptions: {
        chart: {
          title: 'Company Performance',
          subtitle: 'Sales, Expenses, and Profit: 2014-2017',
        },
        // width: 800,
        height: 100,
      },

      // //ZZZZZ Temporary
      // chartOptions: {
      //   series: [{
      //     data: [1,2,3] // sample data
      //   }],
      //   chart: {
      //     type: 'column'
      //   },
      // },


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
    // Only run on the client
    if (process.server) {
      return { }
    }

    const nodeId = 'master'
    const performance15 = await $axios.$get(`${$monitorEndpoint}/${nodeId}/recentPerformance?duration=15`)
    const performance300 = await $axios.$get(`${$monitorEndpoint}/${nodeId}/recentPerformance?duration=300`)
    const performance1800 = await $axios.$get(`${$monitorEndpoint}/${nodeId}/recentPerformance?duration=1800`)
    const performance7200 = await $axios.$get(`${$monitorEndpoint}/${nodeId}/recentPerformance?duration=7200`)

    const metrics = await $axios.$get(`${$monitorEndpoint}/metrics?pipeline=all&nodeGroup=all&user=all&series=1&history=false`)
    // console.log(`metrics=`, metrics)

    return { performance15, performance300, performance1800, performance7200, metrics, loading: false }
  },//- asyncData

  created() {
    // Only run on the client
    if (process.server) {
      return
    }

    this.polling = setInterval(async () => {
      if (this.autoUpdate) {
        // console.log(`update`)
        const nodeId = 'master'
        this.performance15 = await this.$axios.$get(`${this.$monitorEndpoint}/${nodeId}/recentPerformance?duration=15`)
        this.performance300 = await this.$axios.$get(`${this.$monitorEndpoint}/${nodeId}/recentPerformance?duration=300`)
        this.performance1800 = await this.$axios.$get(`${this.$monitorEndpoint}/${nodeId}/recentPerformance?duration=1800`)
        this.performance7200 = await this.$axios.$get(`${this.$monitorEndpoint}/${nodeId}/recentPerformance?duration=7200`)


        this.metrics = await this.$axios.$get(`${this.$monitorEndpoint}/metrics?pipeline=all&nodeGroup=all&user=all&series=1&history=false`)
        // console.log(`metrics=`, this.metrics)
        this.loading = false
      }
    }, POLLING_INTERVAL)
  },//- created

  beforeDestroy () {
    clearInterval(this.polling)
  },//- beforeDestroy

  methods: {
    shortNodeId: function (nodeId) {
      const pos = nodeId.indexOf('-')
      if (pos > 0) {
        nodeId = nodeId.substring(pos + 1)
      }
      return nodeId.substring(0, 8)
    },

    listOfItemsWithPrefix: function (prefix, stripOffSuffix=false) {
      // Skip past the initial values in the metrics
      let i = 0
      while (i < this.metrics.length && this.metrics[i] != '---') {
        i++
      }
      // Check the names of the data values
      const list = new Set()
      for (i++ ; i < this.metrics.length; i++) {
        const values = this.metrics[i]
        for (let j = 0; j <= values.length - 2; j += 2) {
          let name = values[j]
          // const value = values[j + 1]
          // console.log(`${name}=`, value)
          if (name.startsWith(prefix)) {
            name = name.substring(prefix.length)
            if (stripOffSuffix) {
              const pos = name.indexOf(':::')
              if (pos > 0) {
                name = name.substring(0, pos)
              }
            }
            list.add(name)
          }
        }
      }
      return Array.from(list).sort()
    },//- nodeGroups

    dataSeries(requiredValue) {
      // Skip past the initial values in the metrics
      const startTime = this.metrics[0]
      const interval = this.metrics[1]
      const numIntervals = this.metrics[2]
      const endTime = startTime + (numIntervals * interval)
      let i = 3
      while (i < this.metrics.length && this.metrics[i] != '---') {
        i++
      }

      const series = [ ]
      // for (let i = 0; i < numIntervals; i++) {
      //   series
      // }
      for (i++ ; i < this.metrics.length; i++) {
        const values = this.metrics[i]
        for (let j = 0; j <= values.length - 2; j += 2) {
          const name = values[j]
          const value = parseInt(values[j + 1])
          // console.log(`${name}=`, value)
          if (name === requiredValue) {
            const ts = startTime + (i * interval)
            series.push([ ts, value])
          }
        }
      }
      // Check we start from the beginning and reach the end
      if (series.length < 1 || series[0][0] !== startTime) {
        series.unshift([ startTime, 0])
      }
      if (series[series.length-1][0] !== endTime) {
        series.push([ endTime, 0])
      }
      return series
    },//- dataSeries

    chartDataForPipelines() {
      // return [
      //   [ 'a', 'b' ],
      //   [ new Date(), 123]
      // ]

      // Get the pipeline names, and create the header row of the chart data
      const pipelines = this.listOfItemsWithPrefix('p:::')
      const headers = [ 'time' ]
      const templateValues = [ ]
      for (const p of pipelines) {
        headers.push(p)
        templateValues.push(0)
      }

      // Skip past the initial values in the metrics
      /*
      *  Header section
      *              1667211010, // Start time
      *              10, // time interval (seconds)
      *              1080, // number of intervals
      *              '', // Prefix we searched for (if any)
      *              '1', // With extras?
      *              '1', // Sample set
      *              '---',
      */
      const startTime = this.metrics[0]
      const interval = this.metrics[1]
      let numIntervals = this.metrics[2]
      // numIntervals = 10
      // const endTime = startTime + (numIntervals * interval)
      let i = 3
      while (i < this.metrics.length && this.metrics[i] != '---') {
        i++
      }

      // Create empty data cells
      const chartData = [ headers ]
      // console.log(`chartData=`, chartData)
      // chartData.push([ new Date(), ...templateValues])
      // return chartData
      for (let slot = 0; slot < numIntervals; slot++) {
        const tim = startTime + (slot * interval)
        chartData.push([ new Date(tim * 1000), ...templateValues])
      }
// return chartData
      /*
     *    Data section:
     *                'in', '4',
     *                'o:::acme:::in', '4',
     *                'g:::master', '4',
     *                'p:::example', '4',
     *                '-', // terminator
     *                1667220540 // Timestamp
     *              ],
       */
      const PIPELINE_PREFIX = 'p:::'
      for (i++ ; i < this.metrics.length; i++) {
        const values = this.metrics[i]
        const tim = values[values.length-1] // Timestamp is on the end
        // console.log(`tim=`, tim)
        const slot = (tim - startTime) / interval
        // console.log(`slot=`, slot)

        for (let j = 0; j <= values.length - 2; j += 2) {
          const name = values[j]
          const value = parseInt(values[j + 1])
          // console.log(`${name}=`, value)
          if (name.startsWith(PIPELINE_PREFIX)) {
            const pipeline = name.substring(PIPELINE_PREFIX.length)
            const pipelineIndex = pipelines.indexOf(pipeline)
            // console.log(`pipelineIndex=`, pipelineIndex)
            if (!chartData) {
              console.log(`Where did chartData go?`)
            }
            if (slot + 1 >= chartData.length) {
              console.log(`slot is off the end.`)
            }
            if (pipelineIndex >= 0 && slot < chartData.length - 1) {
              chartData[slot + 1][pipelineIndex + 1] = value * (60 / interval)
            } else {
              console.log(`Dud pipeline name? ${pipeline}`)
            }
          }
        }
      }
      // console.log(`chartData=`, chartData)
      return chartData
    },//- chartDataForPipelines

    chartDataForParameter(label, parameter, label2=null, parameter2=null, label3=null, parameter3=null) {
      // console.log(`**** chartDataForParameter(${parameter}, ${parameter2}, ${parameter3})`)

      // Create the header row of the chart data
      const headers = [ 'time', label ]
      const noData = [ 0 ]
      if (label2) {
        headers.push(label2)
        noData.push(0)
      }
      if (label3) {
        headers.push(label3)
        noData.push(0)
      }

      // Skip past the initial values in the metrics
      /*
      *  Header section
      *              1667211010, // Start time
      *              10, // time interval (seconds)
      *              1080, // number of intervals
      *              '', // Prefix we searched for (if any)
      *              '1', // With extras?
      *              '1', // Sample set
      *              '---',
      */
      const startTime = this.metrics[0]
      const interval = this.metrics[1]
      let numIntervals = this.metrics[2]
      // numIntervals = 10
      // const endTime = startTime + (numIntervals * interval)
      let i = 3
      while (i < this.metrics.length && this.metrics[i] != '---') {
        i++
      }

      // Create empty data cells
      const chartData = [ headers ]
      for (let slot = 0; slot < numIntervals; slot++) {
        const tim = startTime + (slot * interval)
        chartData.push([ new Date(tim * 1000), ... noData ])
      }
      /*
      *    Data section:
      *                'in', '4',
      *                'o:::acme:::in', '4',
      *                'g:::master', '4',
      *                'p:::example', '4',
      *                '-', // terminator
      *                1667220540 // Timestamp
      *              ],
      */
      // The last metric is data for an incomplete period
      for (i++ ; i < this.metrics.length - 1; i++) {
        const values = this.metrics[i]
        const tim = values[values.length-1] // Timestamp is on the end
        const slot = (tim - startTime) / interval

        if (slot >= chartData.length - 1) {
          console.log(`YARP 877628ggg Bad slot`)
          continue
        }

        for (let j = 0; j < values.length - 2; j += 2) {
          const name = values[j]
          const value = parseInt(values[j + 1])
          if (name === parameter) {
            chartData[slot + 1][1] = value
          }
          if (label2 && name === parameter2) {
            chartData[slot + 1][2] = value
          }
          if (label3 && name === parameter3) {
            chartData[slot + 1][3] = value
          }
        }
      }
      // console.log(`chartData=`, chartData)
      return chartData
    },//- chartDataForParameter

    haveChartData(parameter) {
      // Skip the prelude
      let i = 3
      while (i < this.metrics.length && this.metrics[i] != '---') {
        i++
      }

      /*
     *    Data section:
     *                'in', '4',
     *                'o:::acme:::in', '4',
     *                'g:::master', '4',
     *                'p:::example', '4',
     *                '-', // terminator
     *                1667220540 // Timestamp
     *              ],
       */
      for (i++ ; i < this.metrics.length; i++) {
        const values = this.metrics[i]
        for (let j = 0; j <= values.length - 2; j += 2) {
          const name = values[j]
          if (name === parameter) {
            return true
          }
        }
      }
      return false
    },//- haveChartData

    chartDataFromSeries: function(requiredValue) {
      const series = this.dataSeries(requiredValue)
      const data = [ ]
      data.push([ 'a', chartDataFromSeries ])
      for (let i = 0; i < series.length; i++) {
        const date = new Date(series[i][0])
        // console.log(`date=`, date)
        const value = series[i][1]
        data.push([ date, value ])
      }
      return data

      // return series
      // const chartData = [
      //   ['Year', 'Sales', 'Expenses', 'Profit'],
      //   ['2014', 2000, 400, 200],
      //   ['2015', 1170, 460, 250],
      //   ['2016', 660, 1120, 300],
      //   ['2017', 1030, 540, 350]
      // ]
      const chartData = [
        // ['Year', 'Sales', 'Expenses', 'Profit'],
        [{v: [8, 0, 0], f: '8 am'}, 1, .25],
        [{v: [9, 0, 0], f: '9 am'}, 2, .5],
        [{v: [10, 0, 0], f:'10 am'}, 3, 1],
        [{v: [11, 0, 0], f: '11 am'}, 4, 2.25],
        [{v: [12, 0, 0], f: '12 pm'}, 5, 2.25],
        [{v: [13, 0, 0], f: '1 pm'}, 6, 3],
        [{v: [14, 0, 0], f: '2 pm'}, 7, 4],
        [{v: [15, 0, 0], f: '3 pm'}, 8, 5.25],
        [{v: [16, 0, 0], f: '4 pm'}, 9, 7.5],
        [{v: [17, 0, 0], f: '5 pm'}, 10, 10],
      ]
      return chartData
    },//- chartDataFromSeries
  },

  computed: {
    /*
     *   Typical metrics data:
     *
     *            result= [
     *              1667211010, // Start time
     *              10, // time interval (seconds)
     *              1080, // number of intervals
     *              '', // Prefix we searched for (if any)
     *              '1', // With extras?
     *              '1', // Sample set
     *              '---',
     *              [
     *                'in', '4',
     *                'o:::acme:::in', '4',
     *                'g:::master', '4',
     *                'p:::example', '4',
     *                '-', // terminator
     *                1667220540 // Timeslot
     *              ],
     *              ...
     *            ]
     */
    nodeGroups: function () {
      return this.listOfItemsWithPrefix('g:::', true)
    },//- nodeGroups

    owners: function () {
      const list = this.listOfItemsWithPrefix('o:::', true)

      // Some of these values will be 'acme:::in', etc. We just want the user name.
      const newList = new Set()
      for (const name of list) {
        const pos = name.indexOf(':::')
        if (pos >= 0) {
          newList.add(name.substring(0, pos))
        } else {
          newList.add(name)
        }
      }
      return Array.from(newList)
    },

    pipelines: function () {
      return this.listOfItemsWithPrefix('p:::', true)
    },
  },//- computed

}
</script>

<style lang="scss" scoped>
.my_column {
  text-align: center;
}
</style>
