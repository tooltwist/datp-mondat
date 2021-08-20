<template lang="pug">
  section.section
    .columns.is-mobile
      card(title="Pipelines", icon="github")
        | Open source on&nbsp;
        a(href="https://github.com/buefy/buefy")
          | GitHub

      card(title="Transactions", icon="cellphone-link")
        b.has-text-grey
          | Every
        | &nbsp;component is responsive 123

      card(title="Nodes", icon="alert-decagram")
        | Built with&nbsp;
        a(href="https://vuejs.org/")
          | Vue.js
        | &nbsp;and&nbsp;
        a(href="http://bulma.io/")
          | Bulma

      card(title="Configuration", icon="arrange-bring-to-front")
        | Configure D.A.T.E.
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
