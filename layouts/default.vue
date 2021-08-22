<template lang="pug">
  .my-default-layout.is-dark-mode-active
    nav.navbar.header.has-shadow.is-primary(role="navigation", aria-label="main navigation")
      .navbar-brand
        a.navbar-item(href="/")
          //- img(src="~assets/buefy.png", alt="Buefy", height="28")
          .heading-name D.A.T.E.
          .heading-description Distributed Asynchronous Transaction Engine

        .navbar-burger
          span
          span
          span

    section.main-content.columns
      aside.column.is-2.section
        p.menu-label.is-hidden-touch
          | General
        ul.menu-list
          li(v-for="(item, key) of items", :key="key")
            NuxtLink(:to="item.to", exact-active-class="is-active")
              b-icon(:icon="item.icon")
              | &nbsp;{{ item.title }}
        br
        br
        p.menu-label.is-hidden-touch
          | Development
        ul.menu-list
          li(v-for="(item, key) of devitems", :key="key")
            NuxtLink(:to="item.to", exact-active-class="is-active")
              b-icon(:icon="item.icon")
              | &nbsp;{{ item.title }}
          li
            NuxtLink(:to="'/no-such-page'", exact-active-class="is-active")
              b-icon(icon="monitor")
              span(@click.prevent="toggleDarkMode") &nbsp;Dark mode

      .container.column.is-10
        Nuxt
</template>

<script>
export default {
  data () {
    return {
      darkMode: false,

      // For icons see https://materialdesignicons.com/
      items: [
        {
          title: 'Home',
          icon: 'home',
          to: { name: 'index' }
        },
        {
          title: 'Performance',
          icon: 'gauge',
          to: { name: 'performance' }
        },
        {
          title: 'Transactions',
          icon: 'bank-transfer',
          to: { name: 'transactions' }
        },
        {
          title: 'Pipelines',
          icon: 'transit-connection',
          to: { name: 'pipelines' }
        },
        {
          title: 'Nodes',
          icon: 'state-machine',
          to: { name: 'nodes' }
        },
        {
          title: 'Queues',
          icon: 'human-queue',
          to: { name: 'queues' }
        },
        {
          title: 'Resolution',
          icon: 'account-alert',
          to: { name: 'resolution' }
        },
        // {
        //   title: 'Alerts',
        //   icon: 'alert',
        //   to: { name: 'alerts' }
        // },
        {
          title: 'Abandoned',
          // icon: 'sync-alert',
          icon: 'head-question-outline',
          to: { name: 'abandoned' }
        },
        {
          title: 'Blockage',
          icon: 'timer-off-outline',
          to: { name: 'blockages' }
        },
      ],//- items

      devitems: [
        {
          title: 'Test Client',
          icon: 'ab-testing',
          to: { name: 'test-client' }
        },
        {
          title: 'Step types',
          icon: 'call-merge',
          to: { name: 'step-types' }
        },
        {
          title: 'Mapping',
          icon: 'arrow-left-right-bold',
          to: { name: 'mapping' }
        },
        {
          title: 'Setup',
          icon: 'cog-outline',
          to: { name: 'setup' }
        }
      ]//- devitems
    }
  },//- date()

  methods: {
    selectTransaction: function (row) {
      const txId = row.txId
      // console.log(`selectTransaction(${txId})`)
      this.$router.push({ path: `/steps/${txId}` })
    },

    toggleDarkMode: function() {
      // alert(`toggle`)
      const htmlClassName = 'is-dark-mode-active'

      this.isDarkModeActive = !this.isDarkModeActive
      if (this.isDarkModeActive) {
        document.documentElement.classList.add(htmlClassName)
      } else {
        document.documentElement.classList.remove(htmlClassName)
      }
    }//- toggleDarkMode
  }//- methods

}
</script>

<style lang="scss" scoped>
.my-default-layout {
  .heading-name {
    display: inline-block;
    font-family: 'Courier New', Courier, monospace;
    font-size: 1.5em;
    font-weight: 600;
    padding-top: 0px;
    padding-bottom: 0px;
    padding-left: 10px;
    padding-left: 10px;
  }
  .heading-description {
    display: inline-block;
    font-size: 1.1em;
    padding-left: 20px;
  }
}
</style>