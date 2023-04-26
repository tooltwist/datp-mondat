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
      .mondat-heading-icon
        b-icon(icon="bank-transfer", size="is-medium")
      | Transaction {{txId}}
    br
    MondatNotification
      p
        | This page shows only steps that have been run.
        | Steps that have not been initiated yet will not be shown. &nbsp;
        //p
        | Note that the steps reported here may not match up with the current pipeline definition
        | for the transaction type, if a new version of the pipeline is in use.

    // Show the pipelines and steps, and logged details
    TransactionAudit(:txId="txId")
</template>

<script>
import MondatNotification from "~/components/MondatNotification.vue"
import StepRunResult from "~/components/StepRunResult.vue"

export default {
  components: {
    MondatNotification,
    StepRunResult,
  },

  async asyncData({ params }) {
    const txId = params.txId
    return { txId }
  }, //- asyncData

  data: function () {
    return {
      txId: '',
    }
  }, //- data

  methods: {
    backToTransactions: function() {
      this.$router.push({ path: `/mondat/transactions` })
    },
  }//- methods
}
</script>
