<template lang="pug">
  section.section
    .columns.is-mobile

      NuxtLink(to="/performance")
        card(title="Performance", icon="gauge")
          | System monitoring

      NuxtLink(to="/nodes")
        card(title="Nodes", icon="state-machine")
          | Distributed processing

      NuxtLink(to="/pipelines")
        card(title="Pipelines", icon="transit-connection")
          | Monitor specific pipelines

      NuxtLink(to="/transactions")
        card(title="Transactions", icon="bank-transfer")
          | Investigate transactions

      NuxtLink(to="/queues")
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
