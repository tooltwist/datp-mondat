<template>
  <section class="section">
    <div class="columns is-mobile">
      <card
        title="Pipelines"
        icon="github"
      >
        Open source on <a href="https://github.com/buefy/buefy">
          GitHub
        </a>
      </card>

      <card
        title="Transactions"
        icon="cellphone-link"
      >
        <b class="has-text-grey">
          Every
        </b> component is responsive
      </card>

      <card
        title="Nodes"
        icon="alert-decagram"
      >
        Built with <a href="https://vuejs.org/">
          Vue.js
        </a> and <a href="http://bulma.io/">
          Bulma
        </a>
      </card>

      <card
        title="Configuration"
        icon="arrange-bring-to-front"
      >
        Configure D.A.T.E.
      </card>
    </div>
  </section>
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
