/* Copyright Tooltwist Innovations Limited - All Rights Reserved
 * This file is part of DATP and as such is proprietary and confidential software.
 * Unauthorized copying of this file, via any medium is strictly prohibited. All
 * rights reserved. No warranty, explicit or implicit, provided. In no event shall
 * the author or owner be liable for any claim or damages.
 */
<template lang="pug">
.my-steps-page
  section.section
    .is-pulled-right
      b-button(type="is-success", @click="backToTransactions") Back
    h2.title.is-4.has-text-grey
      .datemon-heading-icon
        b-icon(icon="bank-transfer", size="is-medium")
      | Transaction {{txId}}
    br
    DatemonNotification
      p
        | The table below shows steps that have actually been run.
        | Steps that have not been initiated yet wil not be shown.
      p
        | Note that the steps shown here may not match up with the current pipeline definition
        | for the transaction type, if a new version of the pipeline is in use.

    span(v-if="loading")
      | Loading...
    span(v-else-if="loadError")
      .notification.is-danger() {{loadError}}
    template(v-else)
      DatemonTable(:data="steps", :columns="columns", :rows="14")
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
        // {
        //     field: 'description',
        //     label: 'Description',
        // },
        {
            field: 'status',
            label: 'Status',
        },
        {
            field: 'stepType',
            label: 'Step type',
        },
        {
            field: 'stepId',
            label: 'Step',
        },
        // {
        //     field: 'startTime',
        //     label: 'Start time',
        // },
      ]
    }
  },//- data

  async asyncData({ $axios, $monitorEndpoint, params }) {
    console.log(params.txId);
    const txId = params.txId
    const url = `${$monitorEndpoint}/transaction/${txId}`
    try {
      const steps = await $axios.$get(url)
      return { txId, steps, loading: false }
    } catch (e) {
      console.log(`url=`, url)
      console.log(`e.response=`, e.response)
      return { loading: false, loadError: e.toString() }
    }
  },//- asyncData

  methods: {
    backToTransactions: function() {
      this.$router.push({ path: `/mondat/transactions` })
    }
  }//- methods
}
</script>

<style lang="scss">
@import "@/assets/scss/main.scss";

.my-steps-page {
  .my-table-row {
    cursor: pointer;
  }
  .my-bold-cell span {
    font-weight: 600;
  }
}
</style>
