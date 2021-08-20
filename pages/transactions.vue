<template lang="pug">
  .my-transactions-page
    section.section
      button.button(@click="toggleDarkMode") Dark / Light
      h2.title.is-3.has-text-grey
        | Transactions&nbsp;&nbsp;
        b-icon(icon="bank-transfer", size="is-large")
      h3.subtitle.is-6.has-text-grey
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
  async fetch() {
    console.log(`fetch()`)
  },
  created() {
    // alert('yarp')
    console.log(`created()`)
  },
  methods: {
    selectTransaction: function (row) {
      const txId = row.txId
      // console.log(`selectTransaction(${txId})`)
      this.$router.push({ path: `/steps/${txId}` })
    },

    toggleDarkMode: function() {
      // alert(`toggle`)
      const htmlClassName = 'is-dark-mode-active'

      // state.isDarkModeActive = !state.isDarkModeActive

      const state = { isDarkModeActive: true }

      if (state.isDarkModeActive) {
        document.documentElement.classList.add(htmlClassName)
      } else {
        document.documentElement.classList.remove(htmlClassName)
      }
    }//- toggleDarkMode
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