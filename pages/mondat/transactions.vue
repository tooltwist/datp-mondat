/* Copyright Tooltwist Innovations Limited - All Rights Reserved
 * This file is part of DATP and as such is proprietary and confidential software.
 * Unauthorized copying of this file, via any medium is strictly prohibited. All
 * rights reserved. No warranty, explicit or implicit, provided. In no event shall
 * the author or owner be liable for any claim or damages.
 */
<template lang="pug">
.my-transactions-page
  section.section
    b-field.is-pulled-right(label="Update:", horizontal)
      b-select(v-model="autoUpdateInterval", @input="changeUpdateInterval", size="is-small")
        option(:value="0", :key="0") None
        option(:value="5", :key="5") 5 seconds
        option(:value="20", :key="15") 20 seconds
        option(:value="60", :key="60") 60 seconds
    h2.title.is-4
      .datemon-heading-icon
        b-icon(icon="bank-transfer", size="is-small")
      | Recent Transactions

    MondatNotification
      | The following are the most recently run transactions.

    span(v-if="loadError")
      .notification.is-danger() {{loadError}}
    template(v-else)
      .columns
        .column.is-8
          .is-pulled-right
            b-button.my-status-button(size="is-small", type="is-successZ", @click="selectAllStatuses") all
            | &nbsp;
            b-button.my-status-button(size="is-small", type="is-success", @click="selectRunningStatuses") running
            | &nbsp;
            b-button.my-status-button(size="is-small", type="is-info", @click="selectStoppedStatuses") stopped
            | &nbsp;
            b-button.my-status-button(size="is-small", type="is-danger", @click="selectErrorStatuses") errors
          .is-pulled-left
            .my-status-selectors
              b-checkbox(v-model="showRunning", @input="changeUpdateInterval") running &nbsp;
              b-checkbox(v-model="showQueued", @input="changeUpdateInterval") queued &nbsp;
              b-checkbox(v-model="showSleeping", @input="changeUpdateInterval") sleeping &nbsp;
            .my-status-selectors
              b-checkbox(v-model="showSuccess", @input="changeUpdateInterval") success &nbsp;
              b-checkbox(v-model="showFailed", @input="changeUpdateInterval") failed &nbsp;
              b-checkbox(v-model="showAborted", @input="changeUpdateInterval") aborted &nbsp;
              b-checkbox(v-model="showTimeout", @input="changeUpdateInterval") timeout &nbsp;
              b-checkbox(v-model="showInternalError", @input="changeUpdateInterval") error &nbsp;
        .column.is-4
          //- .is-pulled-right
            | &nbsp;&nbsp;&nbsp;
            b-button(type="is-primary", @click="changeUpdateInterval") update
          b-field(label="Filter", horizontal)
            b-input(v-model="filter", @input="changeUpdateInterval", placeholder="(minimum 3 characters)", size="is-small")
      MondatTable(:data="transactions", :columns="columns2", @select="selectTransaction")
      client-only
        InfiniteLoading(@infinite="infiniteHandler", :identifier="infiniteId", spinner="spiral")
          div(slot="spinner") Loading...
          div(slot="no-more")
          div(slot="no-results")
</template>

<script>
import MondatNotification from "~/components/MondatNotification.vue"
import MondatTable from "~/components/MondatTable.vue"
import InfiniteLoading from 'vue-infinite-loading'

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

      transactions: [ ],

      columns2: [
        // {
        //   // field: "txId",
        //   label: "Owner",
        //   // width:
        //   type: 'owner'
        // },
        {
          field: "txId",
          label: "txId",
          width: 600,
          type: 'transactionIconId'
        },
        {
          // field: "txId",
          label: "external id",
          width: 300,
          type: 'externalId'
        },
        // {
        //   field: "txId",
        //   label: "transaction id",
        // },
        {
          field: "transactionType",
          label: "type",
          // width:
        },
        {
          field: "status",
          label: "status",
          // width:
          type: 'transactionStatus'
        },
        {
          field: "Switches",
          label: "switches",
        },
        // {
        //   field: "sleepingSince",
        //   label: "Sleeping Since",
        //   // width:
        // },
        // {
        //   field: "sleepCounter",
        //   label: "Retries",
        //   // width:
        // },
        // {
        //   field: "wakeSwitch",
        //   label: "Switch",
        //   // width:
        // },
        {
          field: "startTime",
          label: "start time",
          type: "dateTime"
          // width:
        },
        {
          field: "lastUpdated",
          label: "updated",
          type: "dateTime"
          // width:
        },

      ],//- columns2

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
      autoUpdateInterval: 20,

      page: 1,
      filter: '',
      list: [ ],
      infiniteId: 1, // Change this to reload InfiniteLoader
    }
  },//- data


  created() {
    // Only run on the client
    if (process.server) {
      return
    }
    this.doUpdate()
  },//- created

  beforeDestroy () {
    clearInterval(this.polling)
  },//- beforeDestroy

  methods: {
    changeUpdateInterval: async function () {
      if (this.polling) {
        clearTimeout(this.polling)
        this.polling = null
      }
      this.doUpdate()
    },//- changeUpdateInterval

    selectTransaction: function (row) {
      const txId = row.txId
      this.$router.push({ path: `/mondat/steps/${txId}` })
    },


    infiniteHandler: async function($state) {
      // console.log(`infiniteHandler()`)

      let status = ''
      if (this.showRunning) status += 'running,'
      if (this.showQueued) status += 'queued,'
      if (this.showSuccess) status += 'success,'
      if (this.showFailed) status += 'failed,'
      if (this.showAborted) status += 'aborted,'
      if (this.showSleeping) status += 'sleeping,'
      if (this.showTimeout) status += 'timeout,'
      if (this.showInternalError) status += 'internal-error,'
      let url = `${this.$monitorEndpoint}/transactions?page=${this.page}&pagesize=${PAGESIZE}&status=${status}`
      if (this.filter) { url += `&filter=${this.filter}` }
      // console.log(`url=`, url)
      try {
        const result = await this.$axios.$get(url)
        const transactions = result
        // console.log(`transactions=`, transactions)
        if (transactions.length) {
          this.page += 1
          this.transactions.push(...transactions)
          $state.loaded()
        } else {
          $state.complete()
        }
      } catch (e) {
        console.log(`e=`, e)
        $state.complete()
      }
    },//- infiniteHandler

    doUpdate: async function() {
      // console.error(`doUpdate()`)
      // Empty the existng list (without replacing the reactive array)
      // https://stackoverflow.com/questions/1232040/how-do-i-empty-an-array-in-javascript
      this.page = 1
      this.transactions.splice(0, this.transactions.length)
      this.infiniteId += 1; // This triggers reload

      // Maybe restart the timer
      if (this.autoUpdateInterval > 0) {
        // console.log(`sleep for ${this.autoUpdateInterval}`)
        this.polling = setTimeout(this.doUpdate, this.autoUpdateInterval * 1000)
      }
    },//- doUpdate

    selectAllStatuses: async function () {
      this.showRunning = true
      this.showQueued = true
      this.showSleeping = true
      this.showSuccess = true
      this.showFailed = true
      this.showAborted = true
      this.showTimeout = true
      this.showInternalError = true
      await this.changeUpdateInterval()
    },

    selectRunningStatuses: async function () {
      this.showRunning = true
      this.showQueued = true
      this.showSleeping = true
      this.showSuccess = false
      this.showFailed = false
      this.showAborted = false
      this.showTimeout = false
      this.showInternalError = false
      await this.changeUpdateInterval()
    },

    selectStoppedStatuses: async function () {
      this.showRunning = false
      this.showQueued = false
      this.showSleeping = false
      this.showSuccess = true
      this.showFailed = true
      this.showAborted = true
      this.showTimeout = true
      this.showInternalError = true
      await this.changeUpdateInterval()
    },

    selectErrorStatuses: async function () {
      this.showRunning = false
      this.showQueued = false
      this.showSleeping = false
      this.showSuccess = false
      this.showFailed = true
      this.showAborted = true
      this.showTimeout = true
      this.showInternalError = true
      await this.changeUpdateInterval()
    }
  }
}//- export default
</script>

<style lang="scss">
@import "@/assets/scss/main.scss";

.my-transactions-page {

  .datemon-heading-icon {
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
