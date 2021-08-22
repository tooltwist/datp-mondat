<template lang="pug">
  .my-transactions-page
    section.section
      h2.title.is-3.has-text-grey
        | Recent Transactions&nbsp;&nbsp;
        //- b-icon(icon="bank-transfer", size="is-large")
      //- h3.subtitle.is-6.has-text-grey
      //- br
      .container
        .notification.is-primary
          p The following are the most recently run transactions.
      br

      b-table(:data="transactions", :columns="columns", :hoverable="true", :row-class="rowClass", :narrowed="true", @select="selectTransaction")
      //- br
      //- | {{transactions}}
</template>

<script>
export default {
  data: function () {
    return {
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
      polling: null
    }
  },
  async asyncData({ $axios }) {
    console.log(`asyncData()`)
    const transactions = await $axios.$get('http://localhost:8080/transactions')
    return { transactions }
  },
  // async fetch() {
  //   console.log(`fetch()`)
  // },
  created() {
    // alert('yarp')
    console.log(`created()`)
    this.polling = setInterval(async () => {
      this.transactions = await this.$axios.$get('http://localhost:8080/transactions')
    }, 2000)
  },
  beforeDestroy () {
    clearInterval(this.polling)
  },
  methods: {
    selectTransaction: function (row) {
      const txId = row.txId
      // console.log(`selectTransaction(${txId})`)
      this.$router.push({ path: `/steps/${txId}` })
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

  .rowstyle-red {
    color: coral;
  }
  .rowstyle-blue {
    background-color: blueviolet;
    color: whitesmoke;
  }
  .rowstyle-green {
    color: greenyellow;
  }

}
</style>