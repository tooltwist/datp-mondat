/* Copyright Tooltwist Innovations Limited - All Rights Reserved
 * This file is part of DATP and as such is proprietary and confidential software.
 * Unauthorized copying of this file, via any medium is strictly prohibited. All
 * rights reserved. No warranty, explicit or implicit, provided. In no event shall
 * the author or owner be liable for any claim or damages.
 */
<template lang="pug">
  section.section
    .is-pulled-right
      | &nbsp;&nbsp;
      button.button.is-danger(@click="doDelete") Delete
      | &nbsp;&nbsp;
      button.button.is-primary(@click="doSave") Save
      | &nbsp;&nbsp;
      b-button(@click="backToTests") Back
    //- .is-size-7.has-text-danger(v-if="errorMsg") &nbsp;&nbsp;&nbsp;{{errorMsg}}
    //- .is-clearfix

    h2.title.is-4
      .datemon-heading-icon
        b-icon(icon="bike-fast", size="is-small")
      | Test {{testName}}

    span(v-if="loading")
      | Loading...
    span(v-else-if="loadError")
      .notification.is-danger() {{loadError}}
    template(v-else)
      .is-pulled-right
        button.button.is-success(@click="testRunner") Run test
      .is-clearfix
      br
      section

        //- | {{transactionId}}
        b-tabs(v-model="activeTab", type="is-toggle-rounded")
          b-tab-item(label="Definition")
            br
            b-field(label="Name", label-position="inside")
              b-input(v-model="currentTest.name")
            b-field(label="Description", label-position="inside")
              b-input(v-model="currentTest.description")
            br
            br
            b-field(label="Pipeline being tested", zlabel-position="inside")
              b-select(placeholder="Select one", v-model="currentTest.transactionType")
                option(v-for="txType in mapping", :value="txType.transactionType", :key="txType.transactionType")
                  | {{ txType.transactionType }}


          b-tab-item(:label="inputTabLabel")
            br
            b-field(label="Input data (json)")
              b-input(type="textarea", rows="17", v-model="currentTest.inputData", @input="validateInput", @blur="formatInput")
            .is-size-7.has-text-danger.is-pulled-left(v-if="errorMsg") {{errorMsg}}



          b-tab-item(label="Response")
            section
              br
              //- .is-pulled-right.is-size-7
                | Transaction type:&nbsp;
                b {{currentTest.transactionType}}&nbsp;&nbsp;
              b-field(label="Initial Response")
                b-input(type="textarea", rows="17", v-model="testResponse", disabled)
              //- br
              .is-pulled-left
                template(v-if="testStatus")
                  br
                  b-tag(v-if="testStatus", type="is-danger",  size="is-medium") {{testStatus}}
                  | &nbsp;&nbsp;&nbsp;&nbsp;
                | {{testTimer}}
              .is-clearfix


          b-tab-item(label="Polling")
            section
              br
              b-field(label="Polling Response")
                b-input(type="textarea", rows="17", v-model="pollResponse", disabled)
            .is-pulled-left
              template(v-if="pollStatus")
                br
                b-tag(v-if="pollStatus", type="is-danger",  size="is-medium") {{pollStatus}}
                | &nbsp;&nbsp;&nbsp;&nbsp;
              | {{pollTimer}}
            .is-clearfix


          b-tab-item(label="Transaction")
            TransactionAudit(v-if="transactionId", :txId="transactionId")

</template>

<script>
import MondatNotification from "~/components/MondatNotification.vue"
import MondatTable from "~/components/MondatTable.vue"

const POLLING_INTERVAL = 500

export default {
  components: {
    MondatNotification,
    MondatTable,
  },

  data: function () {
    return {
      // testCases: [ ],
      testName: '',
      mapping: [ ], // Transaction types
      loading: true,
      loadError: null,

      // Tabs
      activeTab: 1,
      TAB_DEFINITION: 0,
      TAB_INPUT: 1,
      TAB_INITIAL_RESPONSE: 2,
      TAB_POLLING: 3,
      TAB_TRANSACTION: 4,

      // Editing a single row.
      currentTest: { },
      // isNew: false,
      errorMsg: '',

      polling: null,
      testTimer: '',
      testStatus: '', // Only set if not 200
      testResponse: '',
      transactionId: null, // Set from testResponse.metadata.txId
      pollTimer: '',
      pollStatus: '', // Only set if not 200
      pollResponse: '',
      readytToTestAgain: false, // Set once test is completed
    }
  },//- data


  async asyncData({ $axios, $monitorEndpoint, params }) {
    // Only run on the client
    if (process.server) {
      return { }
    }

    // Get the test name
    const testName = params.test
    try {
      // Get transaction types
      const url = `${$monitorEndpoint}/transactionMapping`
      // console.log(`url=`, url)
      const mapping = await $axios.$get(url)

      // See if this is a new test
      if (testName === '_new') {
        const currentTest = {
          name: '',
          description: '',
          transactionType: '1.0',
        }
        currentTest.inputData = JSON.stringify({
          "metadata": { "reply": "longpoll" },
          "data": { }
        }, '', 2)
        return { activeTab: 0, testName: '(new)', currentTest, mapping, loading: false }
      }


      // Find this test case. We're being lazy here, selecting all.
      const url2 = `${$monitorEndpoint}/testCases`
      // console.log(`url2=`, url2)
      let testCases = await $axios.$get(url2)

      // Find the current test
      let currentTest = null
      for (const tc of testCases) {
        if (tc.name === testName) {
          currentTest = tc
          break
        }
      }
      return { testName, currentTest, mapping, loading: false }
    } catch (e) {
      // console.log(`url=`, url)
      // console.log(`url2=`, url2)
      console.log(`e.response=`, e.response)
      return { loading: false, loadError: e.toString() }
    }
  },//- asyncData

  beforeDestroy () {
    // if (this.polling !== null) {
    //   clearInterval(this.polling)
    // }
    this.stopAnyPolling()
  },//- beforeDestroy

  computed: {
    inputTabLabel: function() {
      if (this.errorMsg) {
        return 'Input *'
      }
      return 'Input'
    }
  },

  methods: {
    backToTests: function() {
      this.$router.push({ path: `/mondat/tests` })
    },

    validateInput() {
      // console.log(`validateInput()`)
      // console.log(`this.selectedRecord.inputData=`, this.selectedRecord.inputData)
      try {
        const obj = JSON.parse(this.currentTest.inputData)
        this.errorMsg = ''
      } catch (e) {
        // console.log(`e=`, e)
        this.errorMsg = e
      }
    },

    formatInput() {
      // console.log(`formatInput()`)
      try {
        const obj = JSON.parse(this.currentTest.inputData)
        const json = JSON.stringify(obj, '', 2)
        this.currentTest.inputData = json.trim()
        this.errorMsg = ''
      } catch (e) {
        console.log(`e=`, e)
        this.errorMsg = e
      }
    },//- formatInput


    async doSave() {
      // console.log(`doSave()`, this.selectedRecord)

      // Save the test
      this.stopAnyPolling()
      const url = `${this.$monitorEndpoint}/testCase`
      // console.log(`url=`, url)
      const result = await this.$axios.$post(url, this.currentTest)
      // console.log(`result=`, result)
      if (result.status !== 'ok') {
        this.errorMsg = 'Unable to save test case'
        return
      }
      this.errorMsg = ''
      // this.showModal = false

      if (this.testName !== this.currentTest.name) {
        this.$router.push({ path: `/mondat/tests/${this.currentTest.name}` })
      }

      // // Reload all the mappings
      // const url2 = `${this.$monitorEndpoint}/testCases`
      // this.testCases = await this.$axios.$get(url2)
    },

    async doDelete() {
      // console.log(`doDelete()`, this.selectedRecord)
      this.stopAnyPolling()

      this.$buefy.dialog.confirm({
        message: `Delete test ${this.testName}`,
        onConfirm: async () => {
          try {
            const url = `${this.$monitorEndpoint}/testCase/${this.testName}`
            // console.log(`url=`, url)
            const result = await this.$axios.$delete(url)
            this.backToTests()
          } catch (e) {
            console.log(`e=`, e)
          }
        }
      })
    },


    async testRunner() {
      // console.log(`testRunner()`)
      // alert(`testRunner()`)

      this.stopAnyPolling()
      this.pollResponse = null
      this.testResponse = 'waiting...'

      /*
       *  Run the test
       */
      this.activeTab = this.TAB_INITIAL_RESPONSE
      this.readytToTestAgain = false
      this.testTimer = ``
      this.pollTimer = ``
      this.testStatus = ''
      this.pollStatus = ''
      const url = `${this.$datpEndpoint}/tx/start/${this.currentTest.transactionType}`
      // console.log(`url=`, url)
      let status = 200
      let statusText = ''
      let response
      try {
        const data = await JSON.parse(this.currentTest.inputData)
        // console.log(`url=`, url)
        // console.log(`data=`, data)
        this.startTime = Date.now()
        try {
          response = await this.$axios.$put(url, data)

          // These values are inserted by ~/plugins/axios.js
          // See https://stackoverflow.com/a/50176112/1350573
          status = response._status
          statusText = response._statusText
          delete response._status
          delete response._statusText
        } catch (e) {
          // Probably an HTTP error response
          // console.log(`e.response=`, e.response)
          status = e.response.status
          statusText = e.response.statusText
          response = e.response.data
        }
        const endTime = Date.now()

        // console.log(`status=`, status)
        // console.log(`response=`, response)
        this.testStatus = (status===200) ? '' : `Status = ${status}, ${statusText}`
        this.testResponse = JSON.stringify(response, '', 2)
        this.testTimer = `${endTime - this.startTime}ms`
        this.readytToTestAgain = true

      } catch (e) {
        console.log(`e=`, e)
        // alert(`Error invoking API`)
        this.testResponse = e.toString()
        this.readytToTestAgain = true
        return
      }

      /*
       *  See if we need to poll for a result
       */
      const metadata = response.metadata
      if (status !== 200) {

        /*
         *  Replied with an HTTP error code.
         */
        this.pollResponse = `Error reply`
      } else if (!metadata) {
        
        /*
         *  The eply contained no metadata.
         */
        this.pollResponse = `No metadata!`
      } else {

        /*
         *  We need to poll till the transaction completes.
         */
        // this.pollResponse = `polling...`
        this.transactionId = metadata.txId
        const inquiryToken = metadata.inquiryToken
        if (metadata.status === 'running' || metadata.status === 'queued' || metadata.status === 'sleeping') {
          // We'll need to poll for a response
          this.pollResponse = `polling...`
          // alert(`START POLLING`)
          this.activeTab = this.TAB_POLLING

          // Define a function that can be repeatedly called.
          const pollForStatus = async () => {

            // A sanity check first...
            if (!this.polling) {
              alert('We have already stopped polling')
              return
            }

            // Call the API to get the transaction status, with long poll.
            try {
              const url2 = `${this.$datpEndpoint}/tx/status/${this.transactionId}?reply=longpoll`
              // console.log(`url2=`, url2)
              let status2
              let statusText2
              let response2
              try {
                response2 = await this.$axios.$get(url2, {
                  // Put inquiryToken in a header
                })
                
                // These values are inserted by ~/plugins/axios.js
                // See https://stackoverflow.com/a/50176112/1350573
                status2 = response2._status
                statusText2 = response2._statusText
                delete response2._status
                delete response2._statusText

              } catch (e) {
                // Probably an HTTP error response
                // console.log(`e.response=`, e.response)
                status2 = e.response.status
                statusText2 = e.response.statusText
                response2 = e.response.data
              }
              // console.log(`status2=`, status2)
              // console.log(`response=`, response)

              // Check the status reply
              if (
                status2 === 200
                &&
                response2.metadata
                &&
                (response2.metadata.status === 'running' || response2.metadata.status === 'queued' || response2.metadata.status === 'sleeping')
              )
              {
                /*
                 *  A valid reply and still running. Wait a while and try again.
                 */
                console.log(`Still running - wait a while and try again.`)
                this.polling = setTimeout(pollForStatus, POLLING_INTERVAL)
              } else {
                // Finish up
                this.stopAnyPolling()
                this.pollStatus = (status2===200) ? '' : `Status = ${status2}, ${statusText2}`
                this.pollResponse = JSON.stringify(response2, '', 2)
                const endTime2 = Date.now()
                this.pollTimer = `${endTime2 - this.startTime}ms`
              }
            } catch (e) {
              console.log(`e=`, e)
              this.stopAnyPolling()
              alert(`Error polling for result.`)
            }
          }//- pollForStatus

          // Start the polling
          this.polling = setTimeout(pollForStatus, POLLING_INTERVAL)

        } else {
          this.pollResponse = `Polling was not required.`
        }
      }
    },

    stopAnyPolling() {
      if (this.polling !== null) {
        clearTimeout(this.polling)
        this.polling = null
      }
    },
  },//- methods

}
</script>

<style lang="scss" scoped>
.myModalContent {
  min-height: 700px;
}
</style>