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
      a.button.is-primary(@click="newRecord") Add test case
    .is-pulled-right
      | &nbsp;&nbsp;
      a.button(href="/mondat/loadTesting", target="_blank") Load testing...


    //- h2.title.is-3.has-text-grey
      | Test Client&nbsp;&nbsp;&nbsp;
      b-icon(icon="ab-testing", size="is-large")
    h2.title.is-4
      .datemon-heading-icon
        b-icon(icon="bike-fast", size="is-small")
      | Testing

    span(v-if="loading")
      | Loading...
    span(v-else-if="loadError")
      .notification.is-danger() {{loadError}}
    template(v-else)
      DatemonTable(:data="testCases", :columns="columns", :rows="0", @select="selectTestCase", @runTest="doRunTest")



    //
    //  Modal to edit mapping
    //
    b-modal(v-model="showModal", :width="640", scroll="keep")
      .card
        .card-content
          .content
            h1.title.is-4
              | Test Case
            //- | {{selectedRecord}}
            hr
            section

              //- card.card
              b-field(label="Name")
                b-input(v-model="selectedRecord.name")
              b-field(label="Description")
                b-input(v-model="selectedRecord.description")
                //- b-input(v-model="selectedRecord.transactionType", :readonly="!isNew")
              //- b-field(label="Pipeline")
                b-input(v-model="selectedRecord.pipelineName")
              //- | ZZZZ 1 {{mapping}}
              b-field(label="Transaction type")
                b-select(placeholder="Select one", v-model="selectedRecord.transactionType")
                  option(v-for="txType in mapping", :value="txType.transactionType", :key="txType.transactionType")
                    | {{ txType.transactionType }}
                    //- | {{ pipeline.name }}, {{pipeline.version}}
              //- .columns
              //-   .column.is-6
              b-field(label="Input data (json)")
                b-input(type="textarea", rows="10", v-model="selectedRecord.inputData", @input="validateInput", @blur="formatInput")
              //- .is-size-7.has-text-danger.is-pulled-right(v-if="errorMsg") {{errorMsg}}

            //- .column.is-6
              b-field(label="Response")
                b-input(type="textarea", rows="10", v-model="testResponse", readonly)

            hr
            .is-pulled-right
              | &nbsp;&nbsp;
              button.button.is-primary(@click="doSave") Save
            .is-pulled-right
              | &nbsp;&nbsp;
              button.button(@click="cancelModal") Cancel
            .is-pulled-left
              | &nbsp;&nbsp;
              button.button.is-danger(@click="doDelete") Delete
            .is-size-7.has-text-danger(v-if="errorMsg") &nbsp;&nbsp;&nbsp;{{errorMsg}}
            .is-clearfix

    b-modal(v-model="showTestModal", :width="800", scroll="keep")
      .card
        .card-content
          .content
            h1.title.is-4
              | Test '{{selectedRecord.name}}' in progress...
            | {{selectedRecord.description}}
            //- | {{selectedRecord}}
            hr
            section
              .is-pulled-right.is-size-7
                | Transaction type:&nbsp;
                b {{selectedRecord.transactionType}}&nbsp;&nbsp;
              b-field(label="Initial Response")
                b-input(type="textarea", rows="10", v-model="testResponse", disabled)
              b-field(label="Polling Response")
                b-input(type="textarea", rows="10", v-model="pollResponse", disabled)
            hr
            .is-pulled-right
              | &nbsp;&nbsp;
              button.button(@click="doCancelTest") Cancel
            .is-pulled-right
              | &nbsp;&nbsp;
              button.button.is-primary(v-if="readytToTestAgain", @click="testRunner") Test again
              //- .is-size-7.has-text-danger(v-if="errorMsg") &nbsp;&nbsp;&nbsp;{{errorMsg}}
            .is-pulled-left {{testTimer}}{{testTimer2}}
            .is-clearfix

              //- //- card.card
              //- b-field(label="Name")
              //-   b-input(v-model="selectedRecord.name")



    //- hr
    //- .is-pulled-right
    //-   | &nbsp;&nbsp;
    //-   button.button.is-primary(@click="saveMapping") Save

    //- h3.subtitle.is-6.has-text-grey
    //-   | YARP
    //- | etc etc
</template>

<script>
import DatemonNotification from "~/components/DatmonNotification.vue"
import DatemonTable from "~/components/DatmonTable.vue"

const POLLING_INTERVAL = 500

export default {
  components: {
    DatemonNotification,
    DatemonTable,
  },

  data: function () {
    return {
      testCases: [ ],
      mapping: [ ],
      loading: true,
      loadError: null,

      columns: [
        {
            field: 'name',
            label: 'Name',
        },
        {
            field: 'description',
            label: 'Description',
        },
        {
            field: 'transactionType',
            label: 'Transaction type',
        },
        {
          type: 'button',
          label: 'run test',
          customEvent: 'runTest',
        },
      ],//- columns


      // Editing a single row.
      showModal: false,
      selectedRecord: { },
      isNew: false,
      errorMsg: '',

      // Modal while running tests
      showTestModal: false,


      // name: 'namee',
      // description: 'desc',
      // transactionType: 'example',
      // input: '{ "hello": "there" }',
      // // errorMsg: 'Invalid JSON',
      polling: null,
      testResponse: '',
      pollResponse: '',
      testTimer: 0,
      testTimer2: 0,
      readytToTestAgain: false, // Set once test is completed
    }
  },//- data


  async asyncData({ $axios, $monitorEndpoint }) {
    const url = `${$monitorEndpoint}/transactionMapping`
    const url2 = `${$monitorEndpoint}/testCases`
    try {
      const mapping = await $axios.$get(url)
      const testCases = await $axios.$get(url2)
      return { mapping, testCases, loading: false }
    } catch (e) {
      console.log(`url=`, url)
      console.log(`url2=`, url2)
      console.log(`e.response=`, e.response)
      return { nodes: [ ], loading: false, loadError: e.toString() }
    }
  },//- asyncData

  beforeDestroy () {
    // if (this.polling !== null) {
    //   clearInterval(this.polling)
    // }
    this.stopAnyPolling()
  },//- beforeDestroy

  methods: {
    validateInput() {
      // console.log(`validateInput()`)
      // console.log(`this.selectedRecord.inputData=`, this.selectedRecord.inputData)
      try {
        const obj = JSON.parse(this.selectedRecord.inputData)
        this.errorMsg = ''
      } catch (e) {
        // console.log(`e=`, e)
        this.errorMsg = e
      }
    },

    formatInput() {
      // console.log(`formatInput()`)
      try {
        const obj = JSON.parse(this.selectedRecord.inputData)
        const json = JSON.stringify(obj, '', 2)
        this.selectedRecord.inputData = json.trim()
        this.errorMsg = ''
      } catch (e) {
        console.log(`e=`, e)
        this.errorMsg = e
      }
    },//- formatInput

    selectTestCase(row) {
      // console.log(`selectTestCase()`)
      // console.log(`row=`, row)

      this.selectedRecord = row
      this.isNew = false
      this.showModal = true
      this.errorMsg = ''
      this.selectedRecord.originalName = this.selectedRecord.name
    },

    newRecord() {
      // console.log(`newRecord()`)
      this.selectedRecord = {
        name: '',
        description: '',
        transactionType: '1.0',
        inputData: `{
          "metadata": {
            "reply": "longpoll"
          },
          "data": {
          }
        }`,
      }
      this.isNew = true
      this.showModal = true
      this.errorMsg = ''
    },

    async doSave() {
      // console.log(`doSave()`, this.selectedRecord)
      // return
      if (this.isNew) {
        // Check the type is not already used
        if (!this.selectedRecord.transactionType) {
          this.errorMsg = 'Missing transaction type'
          return
        }
        for (const record of this.testCases) {
          if (record.name === this.selectedRecord.name) {
            this.errorMsg = 'Name already used'
            return
          }
        }
      }

      // Save the mapping
      const url = `${this.$monitorEndpoint}/testCase`
      // console.log(`url=`, url)
      const result = await this.$axios.$post(url, this.selectedRecord)
      // console.log(`result=`, result)
      if (result.status !== 'ok') {
        this.errorMsg = 'Unable to save test case'
        return
      }
      this.errorMsg = ''
      this.showModal = false

      // Reload all the mappings
      const url2 = `${this.$monitorEndpoint}/testCases`
      this.testCases = await this.$axios.$get(url2)
    },

    async doDelete() {
      // console.log(`doDelete()`, this.selectedRecord)
      // return
      try {
        const url = `${this.$monitorEndpoint}/testCase/${this.selectedRecord.name}`
        // console.log(`url=`, url)
        const result = await this.$axios.$delete(url)
        // console.log(`result=`, result)

        this.errorMsg = ''
        this.showModal = false

        // Reload all the mappings
        const url2 = `${this.$monitorEndpoint}/testCases`
        this.testCases = await this.$axios.$get(url2)

      } catch (e) {
        console.log(`e=`, e)
      }
    },

    cancelModal() {
      // console.log(`cancelModal()`)
      this.showModal = false
      this.stopAnyPolling()
    },

    async doRunTest (row) {
      // console.log(`doRunTest()`)
      // console.log(`row=`, row)



      this.selectedRecord = row
      this.showTestModal = true

      this.testRunner()
    },

    async testRunner() {
      console.log(`testRunner()`)
      // alert(`testRunner()`)


      this.stopAnyPolling()
      this.pollResponse = null

      // Run the test
      this.readytToTestAgain = false
      this.testTimer = ``
      this.testTimer2 = ``
      const url = `${this.$datpEndpoint}/tx/start/${this.selectedRecord.transactionType}`
      console.log(`url=`, url)
      let response
      try {
        const data = await JSON.parse(this.selectedRecord.inputData)
        // console.log(`url=`, url)
        // console.log(`data=`, data)
        this.startTime = Date.now()
        response = await this.$axios.$put(url, data)
        const endTime = Date.now()

        console.log(`response=`, response)
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

      // See if we need to poll for a result
      const metadata = response.metadata
      if (metadata) {
        // this.pollResponse = `polling...`
        const transactionId = metadata.txId
        const inquiryToken = metadata.inquiryToken


        if (metadata.status === 'running' || metadata.status === 'queued' || metadata.status === 'sleeping') {
          // We'll need to poll for a response
          this.pollResponse = `polling...`
          // alert(`START POLLING`)

          const pollForStatus = async () => {
            // console.log(`check result`)
            if (!this.polling) {
              alert('We have already stopped polling')
              return
            }
            try {
              const url2 = `${this.$datpEndpoint}/tx/status/${transactionId}?reply=longpoll`

              console.log(`url2=`, url2)
              const response2 = await this.$axios.$get(url2, {
                // Put inquiryToken in a header
              })
              // console.log(`response2=`, response2)
              if (
                response2.metadata
                &&
                (response2.metadata.status === 'running' || response2.metadata.status === 'queued' || response2.metadata.status === 'sleeping')
              )
              {
                // Still running. Wait a while and try again
                console.log(`Still running - wait a while and try again.`)
                this.polling = setTimeout(pollForStatus, POLLING_INTERVAL)
              } else {
                // Finish up
                this.stopAnyPolling()
                this.pollResponse = JSON.stringify(response2, '', 2)
                const endTime2 = Date.now()
                this.testTimer2 = `, ${endTime2 - this.startTime}ms`
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
          this.pollResponse = `See result above.`
        }


        // switch (metadata.responseType) {

        //   case 'synchronous':
        //     this.pollResponse = `See result above.`
        //     break

        //   case 'poll-for-result':
        //     // console.log(`Will poll for the result`)
        //     this.pollResponse = `polling...`
        //     this.polling = setInterval(async () => {
        //       // console.log(`check result`)
        //       try {
        //         const url2 = `${this.$datpEndpoint}/result/${transactionId}`
        //         // console.log(`url2=`, url2)
        //         const response2 = await this.$axios.$get(url2, {
        //           // Put inquiryToken in a header
        //         })
        //         // console.log(`response2=`, response2)
        //         if (response2.status !== 'running') {
        //           this.stopAnyPolling()
        //           this.pollResponse = JSON.stringify(response2, '', 2)
        //           const endTime2 = Date.now()
        //           this.testTimer2 = `, ${endTime2 - this.startTime}ms`
        //         }
        //       } catch (e) {
        //         console.log(`e=`, e)
        //         alert(`Error polling for result.`)
        //       }
        //     }, POLLING_INTERVAL)
        //     break

        //   default:
        //     this.pollResponse = `Unknown response!`
        //     break
        // }
      } else {
        // !metadata
        this.pollResponse = `No metadata!`
      }
    },

    doCancelTest() {
      // console.log(`doCancelTest()`)
      this.showTestModal = false
      this.stopAnyPolling()
    },

    stopAnyPolling() {
      if (this.polling !== null) {
        console.log(`STOPPING CURRENT POLLING`)
        clearTimeout(this.polling)
        this.polling = null
      }
    },
  }
}
</script>
