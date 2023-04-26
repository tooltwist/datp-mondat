/* Copyright Tooltwist Innovations Limited - All Rights Reserved
 * This file is part of DATP and as such is proprietary and confidential software.
 * Unauthorized copying of this file, via any medium is strictly prohibited. All
 * rights reserved. No warranty, explicit or implicit, provided. In no event shall
 * the author or owner be liable for any claim or damages.
 */
<template lang="pug">
.my-abandoned-page
  section.section
    h2.title.is-4
      .mondat-heading-icon
        b-icon(icon="head-question-outline", size="is-small")
      | Abandoned Transactions&nbsp;&nbsp;

    MondatNotification
      | An "abandoned" transaction is one that has completed, but
      | nobody has received or collected the reply.
      br
      br
      | Abandoned transactions have the potential
      | to jam up our processing, because they cannot be archived in a timely manner.
      | Clients of the system that regularly abandon transactions&nbsp;
      b should  be notified
      | &nbsp;and requested to correct their software.
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
.my-abandoned-page {

  // .mondat-heading-icon {
  //   display: inline-block;
  //   color: #16aa58;
  //   padding-right: 20px;
  // }
}

</style>
