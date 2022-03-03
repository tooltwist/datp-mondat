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

    h2.title.is-4
      .datemon-heading-icon
        b-icon(icon="bike-fast", size="is-small")
      | Testing

    span(v-if="loading")
      | Loading...
    span(v-else-if="loadError")
      .notification.is-danger() {{loadError}}
    template(v-else)
      MondatTable(:data="testCases", :columns="columns", :rows="0", @select="selectTestCase", @runTest="selectTestCase")
</template>

<script>
import MondatNotification from "~/components/MondatNotification.vue"
import MondatTable from "~/components/MondatTable.vue"

export default {
  components: {
    MondatNotification,
    MondatTable,
  },

  data: function () {
    return {
      testCases: [ ],
      currentTest: 'first-test',
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
          label: 'select',
          customEvent: 'runTest',
        },
      ],//- columns


      activeTab: 1,

      // Editing a single row.
      showModal: false,
      selectedRecord: { },
      isNew: false,
      errorMsg: '',

      polling: null,
      testResponse: '',
      pollResponse: '',
      testTimer: 0,
      testTimer2: 0,
      readytToTestAgain: false, // Set once test is completed
    }
  },//- data


  async asyncData({ $axios, $monitorEndpoint }) {
    // alert(`tests 1`)
    // Only run on the client
    if (process.server) {
      return { }
    }
    // alert(`tests 2`)

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

  // beforeDestroy () {
  //   // if (this.polling !== null) {
  //   //   clearInterval(this.polling)
  //   // }
  //   this.stopAnyPolling()
  // },//- beforeDestroy

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


    /*
     *
     */
    selectTestCase(row) {
      // console.log(`selectTestCase()`)
      // console.log(`row=`, row)
      const testName = row.name
      this.$router.push({ path: `/mondat/tests/${testName}` })
    },

    newRecord() {
      // console.log(`newRecord()`)
      // const testName = row.name
      this.$router.push({ path: `/mondat/tests/_new` })
    },

  }
}
</script>

<style lang="scss" scoped>
.myModalContent {
  min-height: 700px;
}
</style>