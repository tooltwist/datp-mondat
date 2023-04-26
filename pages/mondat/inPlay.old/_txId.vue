/* Copyright Tooltwist Innovations Limited - All Rights Reserved
 * This file is part of DATP and as such is proprietary and confidential software.
 * Unauthorized copying of this file, via any medium is strictly prohibited. All
 * rights reserved. No warranty, explicit or implicit, provided. In no event shall
 * the author or owner be liable for any claim or damages.
 */
<template lang="pug">
section.section
  h2.title.is-4
    .mondat-heading-icon
      //- b-icon(icon="bike-fast", size="is-small")
      b-icon(icon="run", size="is-small")
    | {{transactionId}}

  span(v-if="loading")
    | Loading...
  span(v-else-if="loadError")
    .notification.is-danger() {{loadError}}
  template(v-else)
    MondatNotification
      | This transaction is current running, and possibly should not be.
    br
    section
      b-tabs(v-model="activeTab", type="is-toggle-rounded")

        b-tab-item(label="Transaction")
          TransactionDetails(v-if="transactionId", :txId="transactionId")

        b-tab-item(label="Flow2")
          TransactionFlow2(v-if="transactionId", :txId="transactionId")

        b-tab-item(label="State")
          TransactionState(v-if="transactionId", :txId="transactionId")

        b-tab-item(label="Legacy state")
          TransactionAudit(v-if="transactionId", :txId="transactionId")

</template>

<script>
import MondatNotification from "~/components/MondatNotification.vue"
import MondatTable from "~/components/MondatTable.vue"

export default {
  components: {
    MondatNotification,
    MondatTable,
  },

  data: function () {
    return {
      loading: false,
      loadError: null,

      // Tabs
      activeTab: 0,
      // TAB_DEFINITION: 0,
      // TAB_INPUT: 1,
      // TAB_INITIAL_RESPONSE: 2,
      // TAB_POLLING: 3,
      // TAB_TRANSACTION: 4,

      errorMsg: '',

      transactionId: null, // Set from testResponse.metadata.txId

      transactionState: '',
    }
  },//- data


  async asyncData({ $axios, $monitorEndpoint, params }) {
    // Only run on the client
    if (process.server) {
      return { }
    }
    console.log(`inPlay/_txId - asyncData()`)
    const txId = params.txId
    return { transactionId: txId }
  },//- asyncData

  methods: {
    backToTests: function() {
      this.$router.push({ path: `/mondat/inPlay` })
    },

  },//- methods

}
</script>

<style lang="scss" scoped>

</style>