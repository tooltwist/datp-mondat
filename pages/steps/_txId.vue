<template lang="pug">
  .my-steps-page
    section.section
      .is-pulled-right
        b-button(type="is-success", @click="backToTransactions") Back
      h2.title.is-3.has-text-grey
        //- | Steps&nbsp;&nbsp;
        | Transaction {{txId}}
        //- b-icon(icon="bank-transfer", size="is-large")
      //- h3.subtitle.is-5.has-text-grey
        | {{txId}}
      br
      .container
        .notification.is-primary
          p The table below shows steps that have actually been run.
            | Steps that have not been initiated yet wil not be shown. Note that the steps shown here may not match up with the current pipeline definition
            | for the transaction type, if a new version of the pipeline is in use.
      br
      //- .buttons.has-text-right
      b-table(:data="steps", :columns="columns", :narrowed="true", :row-class="() => 'my-table-row'")
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
            field: 'note',
            label: 'Note',
            cellClass: "my-bold-cell",
            // cellClass: "is-primary",
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