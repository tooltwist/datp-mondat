/* Copyright Tooltwist Innovations Limited - All Rights Reserved
 * This file is part of DATP and as such is proprietary and confidential software.
 * Unauthorized copying of this file, via any medium is strictly prohibited. All
 * rights reserved. No warranty, explicit or implicit, provided. In no event shall
 * the author or owner be liable for any claim or damages.
 */
<template lang="pug">
  section.section
    .columns.is-mobile

      NuxtLink(to="/mondat/performance")
        card(title="Performance", icon="gauge")
          | System monitoring

      NuxtLink(to="/mondat/nodes")
        card(title="Nodes", icon="state-machine")
          | Distributed processing

      NuxtLink(to="/mondat/pipelines")
        card(title="Pipelines", icon="transit-connection")
          | Monitor specific pipelines

      NuxtLink(to="/mondat/transactions")
        card(title="Transactions", icon="bank-transfer")
          | Investigate transactions

      NuxtLink(to="/mondat/queues")
        card(title="Queues", icon="human-queue")
          | Throttle throughput


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
