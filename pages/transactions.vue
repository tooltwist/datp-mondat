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

      b-table(:data="transactions", :columns="columns", :hoverable="true", @select="selectTransaction", :row-class="() => 'my-table-row'")
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
            field: 'status',
            label: 'Status',
        },
        {
            field: 'startTime',
            label: 'Start time',
        },
      ]
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
  // created() {
  //   // alert('yarp')
  //   console.log(`created()`)
  // },
  methods: {
    selectTransaction: function (row) {
      const txId = row.txId
      // console.log(`selectTransaction(${txId})`)
      this.$router.push({ path: `/steps/${txId}` })
    },
  }
}
</script>

<style lang="scss">
.my-transactions-page {
  .my-table-row {
    cursor: pointer;
  }
}
</style>