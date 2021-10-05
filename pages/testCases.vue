<template lang="pug">
  section.section
    .is-pulled-right
      | &nbsp;&nbsp;
      a.button.is-primary(@click="newRecord") Add test case
    .is-pulled-right
      | &nbsp;&nbsp;
      a.button(href="/loadTesting", target="_blank") Load testing...


    //- h2.title.is-3.has-text-grey
      | Test Client&nbsp;&nbsp;&nbsp;
      b-icon(icon="ab-testing", size="is-large")
    h2.title.is-3
      .datemon-heading-icon
        b-icon(icon="ab-testing", size="is-medium")
      | Test Cases

    //- | {{testCases}}
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
              b-field(label="Response")
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
import DatemonNotification from "../components/DatmonNotification.vue"
import DatemonTable from "../components/DatmonTable.vue"

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


  async asyncData({ $axios, $daptEndpoint }) {
    // console.log(`asyncData()`)
    const url = `${$daptEndpoint}/transactionMapping`
    const mapping = await $axios.$get(url)

    const url2 = `${$daptEndpoint}/testCases`
    const testCases = await $axios.$get(url2)

    return { mapping, testCases }
  },//- asyncData

  beforeDestroy () {
    // if (this.polling !== null) {
    //   clearInterval(this.polling)
    // }
    this.stopAnyPolling()
  },//- beforeDestroy

  methods: {
    validateInput() {
      console.log(`validateInput()`)
      console.log(`this.selectedRecord.inputData=`, this.selectedRecord.inputData)
      try {
        const obj = JSON.parse(this.selectedRecord.inputData)
        this.errorMsg = ''
      } catch (e) {
        console.log(`e=`, e)
        this.errorMsg = e
      }
    },

    formatInput() {
      console.log(`formatInput()`)
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
      console.log(`selectTestCase()`)
      console.log(`row=`, row)

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
        inputData: "{\n}",
      }
      this.isNew = true
      this.showModal = true
      this.errorMsg = ''
    },

    async doSave() {
      console.log(`doSave()`, this.selectedRecord)
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
      const url = `${this.$daptEndpoint}/testCase`
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
      const url2 = `${this.$daptEndpoint}/testCases`
      this.testCases = await this.$axios.$get(url2)
    },

    async doDelete() {
      console.log(`doDelete()`, this.selectedRecord)
      // return
      try {
        const url = `${this.$daptEndpoint}/testCase/${this.selectedRecord.name}`
        // console.log(`url=`, url)
        const result = await this.$axios.$delete(url)
        // console.log(`result=`, result)

        this.errorMsg = ''
        this.showModal = false

        // Reload all the mappings
        const url2 = `${this.$daptEndpoint}/testCases`
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

      this.stopAnyPolling()
      this.pollResponse = null

      // Run the test
      this.readytToTestAgain = false
      this.testTimer = `0 ms`
      this.testTimer2 = ``
      const url = `http://localhost:57990/datp/1.0/initiate/${this.selectedRecord.transactionType}`
      const data = await JSON.parse(this.selectedRecord.inputData)
      // console.log(`url=`, url)
      // console.log(`data=`, data)
      this.startTime = Date.now()
      const response = await this.$axios.$put(url, data)
      const endTime = Date.now()

      // console.log(`response=`, response)
      this.testResponse = JSON.stringify(response, '', 2)
      this.testTimer = `${endTime - this.startTime}ms`
      this.readytToTestAgain = true

      // See if we need to poll for a result
      const transactionId = response.metadata.transactionId
      const inquiryToken = response.metadata.inquiryToken

        this.pollResponse = `polling...`


      switch (response.metadata.responseType) {

        case 'synchronous':
          this.pollResponse = `See result above.`
          break

        case 'poll-for-result':
          // console.log(`Will poll for the result`)
          this.pollResponse = `polling...`
          this.polling = setInterval(async () => {
            // console.log(`check result`)
            const url2 = `http://localhost:57990/datp/1.0/result/${transactionId}`
            // console.log(`url2=`, url2)
            const response2 = await this.$axios.$get(url2, {
              // Put inquiryToken in a header
            })
            // console.log(`response2=`, response2)
            if (response2.status === 'complete') {
              this.stopAnyPolling()
              this.pollResponse = JSON.stringify(response2, '', 2)
              const endTime2 = Date.now()
              this.testTimer2 = `, ${endTime2 - this.startTime}ms`
            }
          }, POLLING_INTERVAL)
          break

        default:
          this.pollResponse = `Unknown response!`
          break
      }
    },

    doCancelTest() {
      console.log(`doCancelTest()`)
      this.showTestModal = false
      this.stopAnyPolling()
    },

    stopAnyPolling() {
      if (this.polling !== null) {
        clearInterval(this.polling)
        this.polling = null
      }
    },
  }
}
</script>
