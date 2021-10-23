<template lang="pug">
.my-transactions-page
  section.section
    b-field.is-pulled-right
      b-checkbox(v-model="autoUpdate") Auto-update
    h2.title.is-4
      .datemon-heading-icon
        b-icon(icon="bank-transfer", size="is-small")
      | Recent Transactions

    DatemonNotification
      | The following are the most recently run transactions.

    span(v-if="loading")
      | Loading...
    span(v-else-if="loadError")
      .notification.is-danger() {{loadError}}
    template(v-else)
      DatemonTable(:data="transactions", :columns="columns2", :rows="16", @select="selectTransaction")

    //- br
    //- br
    //- b-table(:data="transactions", :columns="columns", :hoverable="true", :row-class="rowClass", :narrowed="false", @select="selectTransaction")
    //- br
    //- | {{transactions}}
</template>

<script>
import DatemonNotification from "~/components/DatmonNotification.vue"
import DatemonTable from "~/components/DatmonTable.vue"

export default {
  components: {
    DatemonNotification,
    DatemonTable,
  },

  data: function () {
    return {
      loading: true,
      loadError: null,

      transactions: [ ],

      columns: [
        {
            field: 'txId',
            label: 'Transaction ID',
            width: '500',
            // numeric: true
        },
        {
            field: 'transactionType',
            label: 'Type',
            // width: '500',
            // numeric: true
        },
        {
            field: 'status',
            label: 'Status',
        },
        {
            field: 'startTime',
            label: 'Start time',
        },
        // {
        //     field: 'color',
        //     label: 'Start time',
        // },
      ],//- columns

      columns2: [
        {
          // field: "txId",
          label: "transaction id",
          // width:
          type: 'transactionIconId'
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
          field: "startTime",
          label: "start time",
          // width:
        },

      ],//- columns2

      polling: null, // handle from setInterval
      autoUpdate: true, // Constantly refresh the screen
    }
  },//- data

  async asyncData({ $axios, $monitorEndpoint }) {
    const url = `${$monitorEndpoint}/transactions`
    try {
      const transactions = await $axios.$get(url)
      return { transactions, loading: false }
    } catch (e) {
      console.log(`url=`, url)
      console.log(`e.response=`, e.response)
      return { loading: false, loadError: e.toString() }
    }
  },//- asyncData

  created() {
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
      this.$router.push({ path: `/mondat/steps/${txId}` })
    },

    rowClass: function(row) {
      // console.log(`row=`, row)
      if (row.color) {
        return `rowstyle-${row.color}`
      }
      return ''
    },//- rowClass
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
