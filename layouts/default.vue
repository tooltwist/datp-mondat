<template lang="pug">
  .my-default-layout.is-dark-mode-active
    nav.navbar.header.has-shadow.is-primary(role="navigation", aria-label="main navigation")
      .navbar-brand
        a.navbar-item(href="/")
          //- img(src="~assets/TooltwistLogo.png", alt="Buefy", height="28")
          img(src="~assets/tooltwist-logo-white.png", alt="Buefy", height="28")
          | &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          //- .is-pulled-right
      .navbar-start
        //- .has.text-right
        .navbar-item
          .heading-name D.A.T.P.
          .heading-description Distributed Asynchronous Transaction Pipelines

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
          //- li
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
          title: 'Nodes',
          icon: 'state-machine',
          to: { name: 'nodes' }
        },
        {
          title: 'Pipelines',
          icon: 'transit-connection',
          to: { name: 'pipelines' }
        },
        {
          title: 'Transactions',
          icon: 'bank-transfer',
          to: { name: 'transactions' }
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
          title: 'Testing',
          icon: 'ab-testing',
          to: { name: 'testCases' }
        },
        // {
        //   title: 'Step types',
        //   icon: 'call-merge',
        //   to: { name: 'step-types' }
        // },
        {
          title: 'Tx mapping',
          icon: 'arrow-left-right-bold',
          to: { name: 'transactionMapping' }
        },
        {
          title: 'Field mapping',
          icon: 'arrow-left-right-bold',
          to: { name: 'fieldMapping' }
        },
        // {
        //   title: 'Load testing',
        //   icon: 'arrow-left-right-bold',
        //   to: { name: 'loadTesting' }
        // },
        {
          title: 'Setup',
          icon: 'cog-outline',
          to: { name: 'setup' }
        }
      ]//- devitems
    }
  },//- date()

  async created () {
    this.setDarkMode()
  },


  methods: {
    // selectTransaction: function (row) {
    //   const txId = row.txId
    //   // console.log(`selectTransaction(${txId})`)
    //   this.$router.push({ path: `/steps/${txId}` })
    // },

    setDarkMode: function() {
      const htmlClassName = 'is-dark-mode-active'
      document.documentElement.classList.add(htmlClassName)
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
    // font-family: 'Courier New', Courier, monospace;
    // font-size: 1.5em;
    // font-weight: 600;
    padding-top: 0px;
    padding-bottom: 0px;
    padding-left: 10px;
    padding-left: 10px;

    font-family: Work Sans;
    font-size: 30px;
    font-weight: bold;
    font-stretch: normal;
    font-style: normal;
    line-height: normal;
    letter-spacing: normal;
    text-align: left;
    color: #fff;


  }


  .heading-description {
    display: inline-block;
    // font-size: 1.1em;
    padding-left: 20px;

    font-family: Work Sans;
    font-size: 16px;
    font-weight: normal;
    font-stretch: normal;
    font-style: normal;
    line-height: normal;
    letter-spacing: normal;
    text-align: left;
    color: #b5b7c0;

  }
}
</style>