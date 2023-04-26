/* Copyright Tooltwist Innovations Limited - All Rights Reserved
 * This file is part of DATP and as such is proprietary and confidential software.
 * Unauthorized copying of this file, via any medium is strictly prohibited. All
 * rights reserved. No warranty, explicit or implicit, provided. In no event shall
 * the author or owner be liable for any claim or damages.
 */
<template lang="pug">
.my-transactions-page
  section.section
    .is-pulled-right
      b-button(type="is-success", @click="refreshCounter++") Refresh
      template(v-if="txIdInQuery")
        | &nbsp;&nbsp;&nbsp;
        b-button(type="is-grey", @click="goBack") Back


    h2.title.is-5
      .mondat-heading-icon
        b-icon(icon="bank-transfer", size="is-small")
      template(v-if="txIdInQuery")
        | Transaction {{ transactionId }}
      template(v-else)
        | Transaction Lookup

    //- .is-pulled-right
        button.button.is-success.is-inverted(@click="refreshCounter++") Refresh
    .columns(v-if="!txIdInQuery")
      .column.is-6
        b-field(label="TX Id:", horizontal)
          b-input(v-model="transactionId", placeholder="(enter transaction ID)", size="is-small")

    //- MondatNotification
      | The following are the most recently run transactions.
    br
    template(v-if="transactionId")
      //- section
      TransactionComponent(:txId="transactionId", :refreshCounter="refreshCounter", @refresh="refreshCounter++")
      //- hr
      //- section
        .is-pulled-right
          button.button.is-success.is-inverted(@click="refreshCounter++") Refresh
        b-tabs(v-model="activeTab", type="is-toggle-rounded")

          b-tab-item(label="Transaction")
            TransactionDetails(:txId="transactionId", :refreshCounter="refreshCounter")

          b-tab-item(label="Flow2")
            TransactionFlow2(v-if="transactionId", :txId="transactionId", :refreshCounter="refreshCounter")

          b-tab-item(label="State")
            TransactionState(v-if="transactionId", :txId="transactionId", :refreshCounter="refreshCounter")

          //- b-tab-item(label="Legacy state")
            TransactionAudit(v-if="transactionId", :txId="transactionId")


</template>

<script>
import MondatNotification from "~/components/MondatNotification.vue"
import MondatTable from "~/components/MondatTable.vue"
import InfiniteLoading from 'vue-infinite-loading'
import { throwStatement } from "@babel/types"

const PAGESIZE = 10

export default {
  components: {
    MondatNotification,
    MondatTable,
    InfiniteLoading,
  },

  data: function () {
    return {
      loading: true,
      loadError: null,

      // transactionId: 'tx-50744f18fddb5531b505809916955280bc9f64a3',
      transactionId: '',
      refreshCounter: 1,

      // Tabs
      activeTab: 0,

      transactions: [ ],

      // columns2: [
      //   // {
      //   //   // field: "txId",
      //   //   label: "Owner",
      //   //   // width:
      //   //   type: 'owner'
      //   // },
      //   {
      //     field: "txId",
      //     label: "txId",
      //     width: 600,
      //     type: 'transactionIconId'
      //   },
      //   {
      //     field: 'externalId',
      //     label: "external id",
      //     width: 300,
      //   },
      //   // {
      //   //   field: "txId",
      //   //   label: "transaction id",
      //   // },
      //   {
      //     field: "transactionType",
      //     label: "type",
      //     // width:
      //   },
      //   {
      //     field: "status",
      //     label: "status",
      //     // width:
      //     type: 'transactionStatus'
      //   },
      //   {
      //     field: "retry_wakeSwitch",
      //     label: "switches",
      //   },
      //   // {
      //   //   field: "sleepingSince",
      //   //   label: "Sleeping Since",
      //   //   // width:
      //   // },
      //   // {
      //   //   field: "sleepCounter",
      //   //   label: "Retries",
      //   //   // width:
      //   // },
      //   // {
      //   //   field: "wakeSwitch",
      //   //   label: "Switch",
      //   //   // width:
      //   // },
      //   {
      //     field: "startTime",
      //     label: "start time",
      //     type: "dateTime"
      //     // width:
      //   },
      //   {
      //     field: "lastUpdated",
      //     label: "updated",
      //     type: "dateTime"
      //     // width:
      //   },

      // ],//- columns2

      // Which statuses to show
      showRunning: true,
      showQueued: true,
      showSleeping: true,
      showSuccess: true,
      showFailed: true,
      showAborted: true,
      showTimeout: true,
      showInternalError: true,


      polling: null, // handle from setInterval
      // autoUpdateInterval: 20,
      autoUpdateInterval: 0,

      offset: 0,
      filter: '',
      list: [ ],
      infiniteId: 1, // Change this to reload InfiniteLoader
    }
  },//- data


  mounted() {
    // Only run on the client
    // alert(`transactions 1`)
    if (process.server) {
      return
    }
    // console.log(`this.$route.query=`, this.$route.query)
    if (this.$route.query.txId) {
      this.transactionId = this.$route.query.txId
    }
    // alert(`transactions 2`)
    this.doUpdate()
  },//- created

  beforeDestroy () {
    clearInterval(this.polling)
  },//- beforeDestroy

  computed: {
    txIdInQuery: function () {
      return !!this.$route.query.txId
    }
  },

  methods: {
    changeUpdateInterval: async function () {
      if (this.polling) {
        clearTimeout(this.polling)
        this.polling = null
      }
      this.doUpdate()
    },//- changeUpdateInterval

    // selectTransaction: function (row) {
    //   const txId = row.txId
    //   this.$router.push({ path: `/mondat/transactions/${txId}` })
    // },

    // infiniteHandler: async function($state) {
    //   // console.log(`infiniteHandler()`)
    //   // console.log(`this.offset=`, this.offset)

    //   let status = ''
    //   if (this.showRunning) status += 'running,'
    //   if (this.showQueued) status += 'queued,'
    //   if (this.showSuccess) status += 'success,'
    //   if (this.showFailed) status += 'failed,'
    //   if (this.showAborted) status += 'aborted,'
    //   if (this.showSleeping) status += 'sleeping,'
    //   if (this.showTimeout) status += 'timeout,'
    //   if (this.showInternalError) status += 'internal-error,'
    //   let url = `${this.$monitorEndpoint}/transactions?offset=${this.offset}&pagesize=${PAGESIZE}&status=${status}`
    //   if (this.filter) { url += `&filter=${this.filter}` }
    //   // console.log(`url=`, url)
    //   try {
    //     const result = await this.$axios.$get(url)
    //     const transactions = result
    //     console.log(`transactions=`, transactions)
    //     if (transactions.length) {
    //       this.offset += transactions.length
    //       this.transactions.push(...transactions)
    //       $state.loaded()
    //     } else {
    //       $state.complete()
    //     }
    //   } catch (e) {
    //     console.log(`e=`, e)
    //     $state.complete()
    //   }
    // },//- infiniteHandler

    doUpdate: async function() {
      // console.error(`doUpdate()`)
      // Empty the existng list (without replacing the reactive array)
      // https://stackoverflow.com/questions/1232040/how-do-i-empty-an-array-in-javascript
      this.offset = 0
      this.transactions.splice(0, this.transactions.length)
      this.infiniteId += 1; // This triggers reload

      // Maybe restart the timer
      if (this.autoUpdateInterval > 0) {
        // console.log(`sleep for ${this.autoUpdateInterval}`)
        this.polling = setTimeout(this.doUpdate, this.autoUpdateInterval * 1000)
      }
    },//- doUpdate

    // selectAllStatuses: async function () {
    //   this.showRunning = true
    //   this.showQueued = true
    //   this.showSleeping = true
    //   this.showSuccess = true
    //   this.showFailed = true
    //   this.showAborted = true
    //   this.showTimeout = true
    //   this.showInternalError = true
    //   await this.changeUpdateInterval()
    // },

    // selectRunningStatuses: async function () {
    //   this.showRunning = true
    //   this.showQueued = true
    //   this.showSleeping = true
    //   this.showSuccess = false
    //   this.showFailed = false
    //   this.showAborted = false
    //   this.showTimeout = false
    //   this.showInternalError = false
    //   await this.changeUpdateInterval()
    // },

    // selectStoppedStatuses: async function () {
    //   this.showRunning = false
    //   this.showQueued = false
    //   this.showSleeping = false
    //   this.showSuccess = true
    //   this.showFailed = true
    //   this.showAborted = true
    //   this.showTimeout = true
    //   this.showInternalError = true
    //   await this.changeUpdateInterval()
    // },

    // selectErrorStatuses: async function () {
    //   this.showRunning = false
    //   this.showQueued = false
    //   this.showSleeping = false
    //   this.showSuccess = false
    //   this.showFailed = true
    //   this.showAborted = true
    //   this.showTimeout = true
    //   this.showInternalError = true
    //   await this.changeUpdateInterval()
    // },

    goBack: async function() {
      console.log(`goBack()`)
      this.$router.go(-1)
    },//- goBack
  },//- methods
}//- export default
</script>

<style lang="scss">
@import "@/assets/scss/main.scss";

.my-transactions-page {

  .mondat-heading-icon {
    display: inline-block;
    color: #16aa58;
    padding-right: 20px;
  }

  .my-status-selectors {
    font-size: 0.7em;
  }

  .my-status-button {
    padding-top: 0px;
    padding-bottom: 2px;
    padding: 7px;
  }
}
</style>
