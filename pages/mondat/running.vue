/* Copyright Tooltwist Innovations Limited - All Rights Reserved
 * This file is part of DATP and as such is proprietary and confidential software.
 * Unauthorized copying of this file, via any medium is strictly prohibited. All
 * rights reserved. No warranty, explicit or implicit, provided. In no event shall
 * the author or owner be liable for any claim or damages.
 */
<template lang="pug">
.my-transactions-page
  section.section
    b-field.is-pulled-right
      b-checkbox(v-model="autoUpdate") Auto-update
    h2.title.is-4
      .datemon-heading-icon
        b-icon(icon="bank-transfer", size="is-small")
      | Currently Running Transactions

    MondatNotification
      | The following are the most recently run transactions.

    //- span(v-if="loading")
      | Loading...
    span(v-if="loadError")
      .notification.is-danger() {{loadError}}
    template(v-else)
      .columns
        .column.is-6
        .column.is-6
          .is-pulled-right
            | &nbsp;&nbsp;&nbsp;
            b-button(type="is-primary", @click="reselect") update
          b-field(label="Filter", horizontal)
            b-input(v-model="filter", @ZZinput="reselect", placeholder="(minimum 3 characters)")
      MondatTable(:data="transactions", :columns="columns2", @select="selectTransaction")
      client-only
        InfiniteLoading(@infinite="infiniteHandler", :identifier="infiniteId")

    //- br
    //- br
    //- b-table(:data="transactions", :columns="columns", :hoverable="true", :row-class="rowClass", :narrowed="false", @select="selectTransaction")
    //- br
    //- | {{transactions}}
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

      // columns: [
      //   {
      //       field: 'txId',
      //       label: 'Transaction ID',
      //       width: '500',
      //       // numeric: true
      //   },
      //   {
      //       field: 'transactionType',
      //       label: 'Type',
      //       // width: '500',
      //       // numeric: true
      //   },
      //   {
      //       field: 'status',
      //       label: 'Status',
      //   },
      //   {
      //       field: 'startTime',
      //       label: 'Start time',
      //   },
      //   // {
      //   //     field: 'color',
      //   //     label: 'Start time',
      //   // },
      // ],//- columns

      columns2: [
        // {
        //   // field: "txId",
        //   label: "Owner",
        //   // width:
        //   type: 'owner'
        // },
        {
          // field: "txId",
          label: "transaction id",
          width: 300,
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
          // width:
        },

      ],//- columns2

      polling: null, // handle from setInterval
      autoUpdate: false, // Constantly refresh the screen

      page: 1,
      filter: '',
      list: [ ],
      infiniteId: 1, // Change this to reload InfiniteLoader
    }
  },//- data

  // async asyncData({ $axios, $monitorEndpoint }) {
  //   console.log(`asyncData()`)
  //   const url = `${$monitorEndpoint}/transactions?page=0&pagesize=${PAGESIZE}`
  //   try {
  //     const transactions = await $axios.$get(url)
  //     return { transactions, loading: false }
  //   } catch (e) {
  //     console.log(`e.response=`, e.response)
  //     return { loading: false, loadError: e.toString() }
  //   }
  // },//- asyncData

  created() {
    // Only run on the client
    if (process.server) {
      return
    }

    this.polling = setInterval(async () => {
      if (this.autoUpdate) {
        const url = `${this.$monitorEndpoint}/transactions`
        this.transactions = await this.$axios.$get(url)
      }
    }, 2000)
  },//- created

  beforeDestroy () {
    clearInterval(this.polling)
  },//- beforeDestroy

  methods: {
    selectTransaction: function (row) {
      // console.log(`selectTRansaction!!!`, row)
      const txId = row.txId
      // console.log(`selectTransaction(${txId})`)
      this.$router.push({ path: `/mondat/transactions/${txId}` })
    },

    // rowClass: function(row) {
    //   // console.log(`row=`, row)
    //   if (row.color) {
    //     return `rowstyle-${row.color}`
    //   }
    //   return ''
    // },//- rowClass

    infiniteHandler: async function($state) {
      // console.log(`infiniteHandler()`)

      let url = `${this.$monitorEndpoint}/transactions?page=${this.page}&pagesize=${PAGESIZE}&status=running,queued`
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

    reselect: async function() {
      // Empty the existng list (without replacing the reactive array)
      // https://stackoverflow.com/questions/1232040/how-do-i-empty-an-array-in-javascript
      this.page = 1
      this.transactions.splice(0, this.transactions.length)
      this.infiniteId += 1; // This triggers reload
    },
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
}
</style>
