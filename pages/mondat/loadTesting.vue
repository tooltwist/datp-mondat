/* Copyright Tooltwist Innovations Limited - All Rights Reserved
 * This file is part of DATP and as such is proprietary and confidential software.
 * Unauthorized copying of this file, via any medium is strictly prohibited. All
 * rights reserved. No warranty, explicit or implicit, provided. In no event shall
 * the author or owner be liable for any claim or damages.
 */
<template lang="pug">
.my-loadTesting-page(@mouseup="doMouseUp($event)", @mousemove="doMouseMove($event)")
  section.section
    .is-pulled-right
      b-field
        b-checkbox(v-model="useMidiValues") Use midi values
      p.is-size-6.has-text-danger(v-if="errorMsg") {{errorMsg}}
    h2.title.is-3
      .datemon-heading-icon
        b-icon(icon="head-question-outline", size="is-medium")
      | Load testing console


    //- span(v-if="loading")
    //-   | Loading...
    //- span(v-else-if="loadError")
    //-   .notification.is-danger() {{loadError}}
    //- template(v-else)

    //- | {{testCases}}
    .my-blink-area.has-text-centered
      b-tag.rounded.is-danger(v-if="testsRunning && (blinkCounter % 2)") TESTS ARE RUNNING
      //- | {{blinkCounter}}


    .columns(v-for="r in [0, COLUMNS_PER_ROW]")
      .column.is-3.has-text-centered(v-for="c in [0, 1, 2, 3]")
        br
        br
        template(v-if="(r+c) < 8")
          div(@mousedown="doMouseDown($event, r+c)")
            .my-gauge-box
              // Translucent cover for unused gauges
              .my-gauge-hiding-overlay(v-show="!(tests[r+c].testCase)")
              radial-gauge(:options="radialOptions", :value="tests[r+c].value")
            div
              .my-cycler(:style="cyclerStyle(r+c)")
              select.my-select(placeholder="Select one", v-model="tests[r+c].testCase", @input="testCaseChanged(r+c)")
                option(:value="''", :key="'--none--'")
                  | (none)
                option(v-for="tc in testCases", :value="tc.name", :key="tc.name")
                  | {{ tc.name }}

    section.section
      .has-text-centered
        .is-pulled-right
          | &nbsp;&nbsp;
          button.button(@click="closeWindow") close
        .is-pulled-left(v-if="!useMidiValues")
          | &nbsp;&nbsp;
          button.button.is-primary(@click="doResetAll") Reset All
        .is-pulled-left
          | &nbsp;&nbsp;
          button.button.is-danger(v-if="testsRunning", @click="doStopTests") Stop Testing
          button.button.is-danger(v-else, @click="doRunTests") Start Tests
        | &nbsp;&nbsp;&nbsp;&nbsp;
        //- b-tag.roounded.is-danger(v-if="testsRunning && (blinkCounter % 2)") TESTS ARE RUNNING
        //- | {{blinkCounter}}
</template>

<script>
import DatemonNotification from "~/components/DatmonNotification.vue"
import DatemonTable from "~/components/DatmonTable.vue"
import LinearGauge from '~/components/LinearGauge.vue'
import RadialGauge from '~/components/RadialGauge.vue'

const MAX_TESTS = 8
const MIDI_POLLING_TIME = 250 // ms


export default {
  layout: 'standalone',

  components: {
    DatemonNotification,
    DatemonTable,
    LinearGauge,
    RadialGauge,
  },

  data: function () {
    return {
      loading: true,
      loadError: null,

      COLUMNS_PER_ROW: 4,

      MIN_VALUE: 0,
      MAX_VALUE: 100,

      scenarios: [ ],
      testCases: [ ],
      testsRunning: false,


      tests: [
        {
          testCase: 'first-test',
          value: 40,
          counter: 0,
        },
        {
          testCase: 'remittance-big',
          value: 45,
          counter: 0,
        },
        {
          testCase: 'remittance-small',
          value: 50,
          counter: 0,
        },
        {
          testCase: 'first-test',
          value: 55,
          counter: 0,
        },
        {
          testCase: 'first-test',
          value: 60,
          counter: 0,
        },
        {
          testCase: 'remittance-big',
          value: 60,
          counter: 0,
        },
        {
          testCase: 'first-test',
          value: 60,
          counter: 0,
        },
        {
          testCase: 'remittance-big',
          value: 60,
          counter: 0,
        },
        // spare
        // {
        //   testCase: '',
        //   value: 60,
        //   counter: 0,
        // },
      ],
      timeouts: [ null, null, null, null, null, null, null, null ],

      // Midi stuff
      // midiValues: [ ],
      midiPolling: null, // handle from setInterval
      useMidiValues: true, // Constantly refresh the screen
      errorMsg: '',

      // Blink running message
      blinkCounter: 0,
      blinkTimeout: null,

      // Setting values without midi
      movingIndex: -1,
      movingInitialScreenY: 0,
      movingInitialValue: 0,

      // Dial configuration
      radialOptions: {
        width: 160,
        height: 160,
        units: "TX / min",
        minValue: 0,
        maxValue: 100,
        majorTicks: [
            "0",
            "20",
            "40",
            "60",
            "80",
            "100",
        ],
        minorTicks: 2,
        strokeTicks: true,
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
        // colorPlate: "#fff",
        colorPlate: "#ddd",
        borderShadowWidth: 0,
        borders: false,
        needleType: "arrow",
        needleWidth: 4,
        needleCircleSize: 7,
        needleCircleOuter: true,
        needleCircleInner: true,
        animation: false,
        animationDuration: 500,
        animationRule: "linear"
      },//- radialOptions


      // // Google Chart stuff.
      // // See https://www.npmjs.com/package/vue-google-charts
      // // See https://developers.google.com/chart/interactive/docs/gallery
      // // Array will be automatically processed with visualization.arrayToDataTable function
      // chartData: [
      //   ['Label', 'Value' ],
      //   ['first-test', 50 ],
      //   // ['Year', 'Sales', 'Expenses', 'Profit'],
      //   // ['2014', 1000, 400, 200],
      //   // ['2015', 1170, 460, 250],
      //   // ['2016', 660, 1120, 300],
      //   // ['2017', 1030, 540, 350]
      // ],
      // chartOptions: {
      //     // width: 400,
      //     // height: 400,
      //     redFrom: 90,
      //     redTo: 100,
      //     yellowFrom:75,
      //     yellowTo: 90,
      //     minorTicks: 5,
      //   chart: {
      //   //   title: 'Company Performance',
      //   //   subtitle: 'Sales, Expenses, and Profit: 2014-2017',
      //   }
      // }
    }
  },//- data

  async asyncData({ $axios, $monitorEndpoint }) {

    // Get the scenarios and the test cases.
    const url = `${$monitorEndpoint}/testCases`
    try {
      const testCases = await $axios.$get(url)
      return { testCases, loading: false }
    } catch (e) {
      console.log(`url=`, url)
      console.log(`e.response=`, e.response)
      return { loading: false, loadError: e.toString() }
    }
  },//- asyncData

  mounted() {
    // Poll for midi values (if we are using midi values)
    this.midiPolling = setInterval(async () => {
      if (this.useMidiValues) {
        await this.getMidiValues()
      }
    }, MIDI_POLLING_TIME)
  },//- created

  beforeDestroy () {
    clearInterval(this.midiPolling)
    this.doStopTests()
  },//- beforeDestroy

  methods: {

    closeWindow() {
      window.close()
    },

    doMouseDown(event, index) {
      // console.log(`doMouseDown()`, event)
      // console.log(`index=`, index)
      this.movingIndex = index
      this.movingInitialScreenY = event.screenY
      // this.movingInitialValue = this.testValues[index]
      this.movingInitialValue = this.tests[index].value
    },

    doMouseMove(event) {
      if (this.movingIndex >= 0) {
        const delta = this.movingInitialScreenY - event.screenY
        let newValue = this.movingInitialValue + Math.floor(delta / 2)
        if (newValue > this.MAX_VALUE) {
          newValue = this.MAX_VALUE
        }
        if (newValue < this.MIN_VALUE) {
          newValue = this.MIN_VALUE
        }
          this.tests[this.movingIndex].value = newValue
      }
    },//- doMouseMove

    doMouseUp() {
      if (this.movingIndex >= 0) {
        this.restartTestIfRequired(this.movingIndex)
        this.movingIndex = -1
      }
    },

    doResetAll() {
      for (let i = 0; i < MAX_TESTS; i++) {
        this.tests[i].value = 0
        this.restartTestIfRequired(i)
      }
    },//- doResetAll

    async testCaseChanged(index) {
      // console.log(`testCaseChanged()`)
      // Give the value time to change
      setTimeout(async () => {
        this.testRunner(index)
      }, 100)
    },

    async doRunTests() {
      // console.log(`doRunTests()`)
      this.testsRunning = true
      for (let i = 0; i < MAX_TESTS; i++) {
        await this.restartTestIfRequired(i)
      }

      // Start the blinking message
      this.blinkCounter = 1
      this.blinkTimeout = setInterval(() => {
        this.blinkCounter++
      }, 1500)
    },

    cyclerStyle(index) {
      if (!this.testsRunning || this.tests[index].testCase === '' || this.tests[index].value < 1) {
        return { }
      }
      switch (this.tests[index].counter % 3) {
        case 0: return { backgroundColor: 'yellow' }
        case 1: return { backgroundColor: 'lightblue' }
        case 2: return { backgroundColor: 'magenta' }
      }
    },

    async doStopTests() {
      // console.log(`doStoptests()`)
      this.testsRunning = false
      for (let i = 0; i < MAX_TESTS; i++) {
        await this.restartTestIfRequired(i)
      }

      // Stop the run message blinking
      if (this.blinkTimeout) {
        clearInterval(this.blinkTimeout)
        this.blinkTimeout = null
      }
    },

    async restartTestIfRequired(index) {
      // console.log(`restartTestIfRequired(${index})`)
      if (index < 0) {
        return
      }
      const test = this.tests[index]
      if (this.timeouts[index] != null) {
        // console.log(`------- clear ${index}`)
        clearInterval(this.timeouts[index])
        this.timeouts[index] = null
      }
      if (!this.testsRunning) {
        return
      }
      if (test.testCase === '') {
        return
      }

      // Work out how often to start a test
      if (test.value < 1) {
        return
      }
      const ms = Math.floor(60000 / test.value)
      // console.log(`${index}: ${ms}`)
      console.log(`+++++++ set ${index} ${ms}`)
      this.testRunner(index)
      this.timeouts[index] = setInterval(() => {
        console.log(`Start ${index}: ${this.tests[index].testCase}`)
        this.tests[index].counter++
        this.testRunner(index)
      }, ms)
    },


    async testRunner(index) {
      const testCaseName = this.tests[index].testCase

      // Find the test case
      for (const tc of this.testCases) {
        if (tc.name === testCaseName) {
          // Run the test
          //ZZZZZ
          const url = `${this.$monitorEndpoint}//datp/1.0/initiate/${tc.transactionType}`
          const data = await JSON.parse(tc.inputData)
          console.log(`url=`, url)
          console.log(`data=`, data)
          const startTime = Date.now()
          const response = await this.$axios.$put(url, data)
          const endTime = Date.now()

          // console.log(`response=`, response)
          // const testResponse = JSON.stringify(response, '', 2)
          const ms = endTime - startTime
          console.log(`test ${index}:${testCaseName} finished in ${ms}ms`)
          return
        }
      }
      console.log(`testRunner: unknown test case ${index}:${testCaseName}`)
   },//- testRunner

    async getMidiValues() {
      // console.log(`getMidiValues()`)

      try {
        const url = `${this.$monitorEndpoint}/midiValues`
        const result = await this.$axios.$get(url)
        // console.log(`result=`, result)
        if (result.status && result.status !== 'ok') {
          this.useMidiValues = false
          this.errorMsg = result.status
        } else {
          // We have what we need. Update the gauges.
          const setFromMidiValue = (midiVal, index) => {
            const perc = Math.floor((midiVal / 16383) * 100)
            if (this.tests[index].value !== perc) {
              // console.log(`Setting from midi: ${index}, ${perc}`)
              this.tests[index].value = perc
              this.restartTestIfRequired(index)
            }
          }

          for (const record of result) {
            switch (record.id) {
              case 'slider0': setFromMidiValue(record.value, 0); break
              case 'slider1': setFromMidiValue(record.value, 1); break
              case 'slider2': setFromMidiValue(record.value, 2); break
              case 'slider3': setFromMidiValue(record.value, 3); break
              case 'slider4': setFromMidiValue(record.value, 4); break
              case 'slider5': setFromMidiValue(record.value, 5); break
              case 'slider6': setFromMidiValue(record.value, 6); break
              case 'slider7': setFromMidiValue(record.value, 7); break
            }
          }
          // midiValues = result
          this.errorMsg = ''
        }
      } catch (e) {
        console.log(`Error accessing midi values`, e)
        // errorMsg = e
        this.useMidiValues = false
        this.errorMsg = 'Cannot access midi values'
      }
    },// getMidiValues

  },//- methods

}

</script>

<style lang="scss" scoped>
.my-loadTesting-page {
  -webkit-touch-callout: none;
  -webkit-user-select: none;
   -khtml-user-select: none;
     -moz-user-select: none;
      -ms-user-select: none;
          user-select: none;
  .my-blink-area {
    height: 20px;
    margin-top: -20px;
    // margin-bottom: -20px;
    // margin-bottom: 20px;
    // background-color: yellow;
  }
  .my-gauge-box {
    position: relative;
    // border: solid 1px red;
    border: none;
    // width: 100%;
    height: 170px;
    .my-gauge-hiding-overlay {
      position: absolute;
      z-index: 100;
      width: 100%;
      height: 170px;
      background-color: #28253a;
      opacity: 0.85;
    }
  }
  .my-cycler {
    display: inline-block;
    // background-color: red;
    margin-right: 6px;
    width: 10px;
    height: 10px;
    border-radius: 5px;
    opacity: 0.85;
  }
  select.my-select {
    background-color: #28253a;
    // background-color: yellow;
    border: none !important;
    color: #dbdbdb;
    font-size: 16px;
    font-family: Web-Sans, sans-serif;
  }
}
</style>
