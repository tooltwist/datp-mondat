<template lang="pug">
  .my-steps-page
    section.section
      h2.title.is-3.has-text-grey
        //- | Steps&nbsp;&nbsp;
        | Transaction Steps&nbsp;&nbsp;
        b-icon(icon="bank-transfer", size="is-large")
      .is-pulled-right
        b-button(type="is-success", @click="backToTransactions") Back
      h3.subtitle.is-5.has-text-grey
        //- | Transaction {{txId}}
        | {{txId}}
      br
      //- .buttons.has-text-right
      b-table(:data="steps", :columns="columns", :row-class="() => 'my-table-row'")
      //- br
      //- | {{steps}}
</template>

<script>
export default {
  data: function () {
    return {
      txId: '',
      steps: [ ],
      columns: [
        {
            field: 'fullSequence',
            label: 'Sequence',
            // width: '500',
            // numeric: true
        },
        {
            field: 'stepId',
            label: 'Step',
        },
        {
            field: 'description',
            label: 'Description',
        },
        {
            field: 'status',
            label: 'Status',
        },
        {
            field: 'stepType',
            label: 'Step type',
        },
        {
            field: 'note',
            label: 'Note',
            cellClass: "my-bold-cell",
            // cellClass: "is-primary",
        },
        // {
        //     field: 'startTime',
        //     label: 'Start time',
        // },
      ]
    }
  },
  async asyncData({ $axios, route, params }) {
    console.log(`asyncData()`)
    console.log(params.txId);
    const txId = params.txId
    const steps = await $axios.$get(`http://localhost:8080/transaction/${txId}`)
    return { txId, steps }
  },
  // async fetch() {
  //   console.log(`fetch()`)
  // },
  // created() {
  //   // alert('yarp')
  //   console.log(`created()`)
  // }
  methods: {
    backToTransactions: function() {
      this.$router.push({ path: `/transactions` })
    }
  }
}
</script>

<style lang="scss">
.my-steps-page {
  .my-table-row {
    cursor: pointer;
  }
  .my-bold-cell span {
    font-weight: 600;
  }
}
</style>