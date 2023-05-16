/* Copyright Tooltwist Innovations Limited - All Rights Reserved
 * This file is part of DATP and as such is proprietary and confidential software.
 * Unauthorized copying of this file, via any medium is strictly prohibited. All
 * rights reserved. No warranty, explicit or implicit, provided. In no event shall
 * the author or owner be liable for any claim or damages.
 */
<template lang="pug">
  .my-default-layout.is-dark-mode-active
    nav.navbar.header.has-shadow.is-primary(role="navigation", aria-label="main navigation")
      .navbar-brand
        a.navbar-item(href="/mondat")
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
        //- p.menu-label.is-hidden-touch
          | Monitoring
        ul.menu-list
          li(v-for="(item, key) of homeItems", :key="key")
            NuxtLink(:to="item.to", exact-active-class="is-active")
              b-icon.menu-icon(:icon="item.icon")
              | &nbsp;&nbsp;{{ item.title }}

        p.menu-label.is-hidden-touch
          | Monitoring
        ul.menu-list
          //li
            NuxtLink(to="/junk", Zexact-active-class="is-active")
              b-icon(icon="cross")
              | &nbspJUNK1
          //li
            NuxtLink(to="mondat-junk", Zexact-active-class="is-active")
              b-icon(icon="cross")
              | &nbspJUNK2
          li(v-for="(item, key) of monitorItems", :key="key")
            NuxtLink(:to="item.to", exact-active-class="is-active")
              b-icon(:icon="item.icon")
              | &nbsp;{{ item.title }}
        br

        p.menu-label.is-hidden-touch
          | Transactions
        ul.menu-list
          li(v-for="(item, key) of txItems", :key="key")
            NuxtLink(:to="item.to", exact-active-class="is-active")
              b-icon(:icon="item.icon")
              | &nbsp;{{ item.title }}
        br

        //- aside.column.is-2.section
        p.menu-label.is-hidden-touch
          | Testing
        ul.menu-list
          li(v-for="(item, key) of testItems", :key="key")
            NuxtLink(:to="item.to", exact-active-class="is-active")
              b-icon.menu-icon(:icon="item.icon")
              | &nbsp;&nbsp;{{ item.title }}
        br
        //div( v-for="route in $router.options.routes")
          .is-size-6 &nbsp;{{route.name}}
          br
        //- br

        p.menu-label.is-hidden-touch
          | Setup / Dev
        ul.menu-list
          li(v-for="(item, key) of devItems", :key="key")
            NuxtLink(:to="item.to", exact-active-class="is-active")
              b-icon(:icon="item.icon")
              | &nbsp;{{ item.title }}
          //- li
            NuxtLink(:to="'/no-such-page'", exact-active-class="is-active")
              b-icon(icon="monitor")
              span(@click.prevent="toggleDarkMode") &nbsp;Dark mode

          br
        br
        p.menu-label.is-hidden-touch
          | Generic APIs
        ul.menu-list
          li(v-for="(item, key) of apiItems", :key="key")
            NuxtLink(:to="item.to", exact-active-class="is-active")
              b-icon(:icon="item.icon")
              | &nbsp;{{ item.title }}

      .container.column.is-10
        Nuxt
</template>

<script>
export default {
  data () {
    return {
      darkMode: false,

      // For icons see https://materialdesignicons.com/
      homeItems: [
        {
          title: 'Dashboard',
          icon: 'monitor-dashboard',
          to: { name: 'mondat' }
        },
      ],

      monitorItems: [
        {
          title: 'Throughput',
          icon: 'gauge',
          to: { name: 'mondat-performance' }
        },
        // {
        //   title: 'Caches',
        //   icon: 'flash',
        //   to: { name: 'mondat-caches' }
        // },
        {
          title: 'Queues',
          icon: 'human-queue',
          to: { name: 'mondat-queues' }
        },
        // {
        //   title: 'Sleeping',
        //   icon: 'sleep',
        //   to: { name: 'mondat-sleeping' }
        // },
        // {
        //   title: 'Failures',
        //   icon: 'alert-rhombus-outline',
        //   to: { name: 'mondat-failures' }
        // },

        // {
        //   title: 'Broken webhooks',
        //   // icon: 'sync-alert',
        //   icon: 'alert-rhombus-outline',
        //   to: { name: 'mondat-abandoned' }
        // },
        // {
        //   title: 'Blockage',
        //   icon: 'wall',
        //   to: { name: 'mondat-blockages' }
        // },
      ],

      txItems: [
        {
          title: 'Recent',
          // icon: 'eye-outline',
          icon: 'bank-transfer',
          // icon: 'binoculars',
          to: { name: 'mondat-recent' }
        },
        {
          title: 'In Play',
          icon: 'run',
          to: { name: 'mondat-inPlay' }
        },
        {
          title: 'Sleeping',
          icon: 'sleep',
          to: { name: 'mondat-sleeping' }
        },
        {
          title: 'Archived',
          icon: 'archive-outline',
          to: { name: 'mondat-archived' }
        },
        {
          title: 'Exceptions',
          // icon: 'alert-outline',
          icon: 'alert-circle-outline',
          // icon: 'image-broken-variant',
          // icon: 'image-broken-variant',
          to: { name: 'mondat-exceptions' }
        },
        {
          title: 'TX Lookup',
          // icon: 'eye-outline',
          icon: 'bank-transfer',
          // icon: 'binoculars',
          to: { name: 'mondat-txLookup' }
        },
        // {
        //   title: 'Running',
        //   icon: 'run',
        //   to: { name: 'mondat-running' }
        // },
        // {
        //   title: 'Finished',
        //   icon: 'bank-transfer',
        //   to: { name: 'mondat-complete' }
        // },
        // {
        //   title: 'Sleeping',
        //   icon: 'sleep',
        //   to: { name: 'mondat-sleeping' }
        // },
        // {
        //   title: 'Failures',
        //   icon: 'alert-rhombus-outline',
        //   to: { name: 'mondat-failures' }
        // },

        // {
        //   title: 'Broken webhooks',
        //   // icon: 'sync-alert',
        //   icon: 'alert-rhombus-outline',
        //   to: { name: 'mondat-abandoned' }
        // },
        // {
        //   title: 'Blockage',
        //   icon: 'wall',
        //   to: { name: 'mondat-blockages' }
        // },
      ],

      testItems: [
        {
          title: 'Testing',
          icon: 'bike-fast',
          to: { name: 'mondat-tests' }
        },
        // {
        //   title: 'Notifications',
        //   // icon: 'message-alert-outline',
        //   // icon: 'message-alert-outline',
        //   icon: 'message-outline',
        //   to: { name: 'mondat-queues' }
        // },

        // {
        //   title: 'Queues',
        //   icon: 'human-queue',
        //   to: { name: 'mondat-queues' }
        // },
        // {
        //   title: 'Resolution',
        //   icon: 'account-alert',
        //   to: { name: 'mondat-resolution' }
        // },

        // {
        //   title: 'Alerts',
        //   icon: 'alert',
        //   to: { name: 'alerts' }
        // },
      ],//- testItems


      devItems: [
        {
          title: 'Node Groups',
          icon: 'state-machine',
          to: { name: 'mondat-nodeGroups' }
        },
        {
          title: 'Pipelines',
          icon: 'transit-connection',
          to: { name: 'mondat-pipelines' }
        },
        // {
        //   title: 'TX Types',
        //   icon: 'shape',
        //   to: { name: 'mondat-transactionTypes' }
        // },
        // {
        //   title: 'UI example',
        //   icon: 'form-textbox-password',
        //   to: '/forms/getFees'
        // },
        // {
        //   title: 'Setup',
        //   icon: 'cog-outline',
        //   to: { name: 'setup' }
        // }
      ],//- devItems

      apiItems: [
      {
          title: 'API Definitions',
          icon: 'api',
          to: { name: 'mondat-forms-standard' }
        },
        {
          title: 'Field mappings',
          icon: 'arrow-left-right-bold',
          //to: '/mondat/forms/providers'
          to: { name: 'mondat-forms-providers' }
        },
      ]
    }
  },//- date()

  async created () {
    this.setDarkMode()
  },


  methods: {
    setDarkMode: function() {
      if (process.client) {
        const htmlClassName = 'is-dark-mode-active'
        document.documentElement.classList.add(htmlClassName)
      }
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
  .main-content {
    min-height: 100vh;
  }

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

  // .menu-list {
  //   font-size: 7px !important;
  // }

  // .menu-icon {
  //   font-size: 0.1em !important;
  //   color: red;
  // }

  // i.mdi {
  //   font-size: 0.1em !important;
  //   color: orange !important;
  // }

  .menu-label {
    margin-left: 32px;
    color: #16aa58;
  }
}
</style>
