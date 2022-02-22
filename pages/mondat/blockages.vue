/* Copyright Tooltwist Innovations Limited - All Rights Reserved
 * This file is part of DATP and as such is proprietary and confidential software.
 * Unauthorized copying of this file, via any medium is strictly prohibited. All
 * rights reserved. No warranty, explicit or implicit, provided. In no event shall
 * the author or owner be liable for any claim or damages.
 */
<template lang="pug">
.my-blocked-page
  section.section
    h2.title.is-4
      .datemon-heading-icon
        b-icon(icon="timer-off-outline", size="is-small")
      | Blocked Transactions&nbsp;&nbsp;

    MondatNotification
      | A "blocked" transaction is one that reports it is unable to proceed,
      | due to factors outside it's control. For example, because it needs to contact
      | an external system that is offline.
      | If you&nbsp;
      b resolve the external cause
      | , blocked transactions will generally clear by themselves.
    br
    template(v-if="transactions.length < 1")
      br
      | No transactions
    template(v-else)
      | List goes here...
</template>

<script>
import MondatNotification from "~/components/MondatNotification.vue"
// import MondatTable from "~/components/MondatTable.vue"

export default {
  components: {
    MondatNotification,
  },

  data: function () {
    return {
      loading: true,
      loadError: null,

      transactions: [ ],
    }
  }
}
</script>

<style lang="scss" scoped>
.my-blocked-page {

  // .datemon-heading-icon {
  //   display: inline-block;
  //   color: #16aa58;
  //   padding-right: 20px;
  // }
}

</style>
