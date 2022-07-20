/* Copyright Tooltwist Innovations Limited - All Rights Reserved
 * This file is part of DATP and as such is proprietary and confidential software.
 * Unauthorized copying of this file, via any medium is strictly prohibited. All
 * rights reserved. No warranty, explicit or implicit, provided. In no event shall
 * the author or owner be liable for any claim or damages.
 */
<template lang="pug">
  <div>
    section.section
      .columns.is-mobile

        //- NuxtLink(to="/mondat/performance")
        //-   card(title="Performance", icon="gauge")
        //-     | System monitoring

        NuxtLink(to="/mondat/caches")
          card.myCard(title="Caches", icon="flash")
            | Performance

        NuxtLink(to="/mondat/queues")
          card.myCard(title="Queues", icon="state-machine")
            | Reliable / Asynchronous

        NuxtLink(to="/mondat/nodeGroups")
          card.myCard(title="Nodes", icon="state-machine")
            | Distributed processing

    section.section
      .columns.is-mobile

        NuxtLink(to="/mondat/transactions")
          card.myCard(title="Transactions", icon="bank-transfer")
            | Audit trail

    section.section
      .columns.is-mobile

        //- NuxtLink(to="/mondat/performance")
        //-   card(title="Performance", icon="gauge")
        //-     | System monitoring

        NuxtLink(to="/mondat/pipelines")
          card.myCard(title="Pipelines", icon="transit-connection")
            | Pipeline definitions

        NuxtLink(to="/mondat/tests")
          card.myCard(title="Testing", icon="bike-fast")
            | Development assistance

        //- NuxtLink(to="/mondat/transactions")
          card(title="Transactions", icon="bank-transfer")
            | Investigate transactions

        //- NuxtLink(to="/mondat/queues")
          card(title="Queues", icon="human-queue")
            | Throttle throughput
  </div>
</template>

<script>
import Card from '~/components/Card'

export default {
  name: 'HomePage',

  components: {
    Card
  }
}
</script>

<style lang="scss" scoped>
  .myCard {
    min-width: 220px;
  }
</style>
