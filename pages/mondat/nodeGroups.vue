/* Copyright Tooltwist Innovations Limited - All Rights Reserved
 * This file is part of DATP and as such is proprietary and confidential software.
 * Unauthorized copying of this file, via any medium is strictly prohibited. All
 * rights reserved. No warranty, explicit or implicit, provided. In no event shall
 * the author or owner be liable for any claim or damages.
 */
<template lang="pug">
client-only
  section.section
    b-field.is-pulled-right(label="Update:", horizontal)
      b-select(v-model="autoUpdateInterval", @input="changeUpdateInterval")
        option(:value="0", :key="0") None
        option(:value="5", :key="5") 5 seconds
        option(:value="20", :key="15") 20 seconds
        option(:value="60", :key="60") 60 seconds

    h2.title.is-4
      .datemon-heading-icon
        b-icon(icon="state-machine", size="is-small")
      | Node Groups &nbsp;&nbsp;&nbsp;
      b-tag(v-if="loadError==='Network Error'", rounded, type="is-danger", size="is-large") Offline
      b-tag(v-if="loading", rounded, type="is-success", size="is-small") Loading
    .is-clearfix

    MondatNotification
      p
        | The&nbsp;
        b D.A.T.P.
        | &nbsp;system is distributed, meaning runs across multiple software servers, which we call nodes.
        br
        br
      p
        | As nodes come online they make their pipelines available.
        | Typically each node runs as a separate Docker container, which allows them to be developed independantly
        | by different teams. This design also maximises security, because each node is unable to
        | access the data or logic of other nodes.
        br
        br
      p
        | The&nbsp;
        b master
        | &nbsp;node is reponsible for triaging incoming transactions, and depending upon the
        | transaction type and data will usually pass the transaction off to a pipeline running on another node.
        | Nodes are grouped to allow multiple nodes are running the same functionality. This page is used
        | to configure those groups, and check that all nodes in a group provide the same functionality.

    br
    br

    //- span(v-if="loading")
      | Loading...
    .notification.is-danger(v-if="loadError && loadError !== 'Network Error'")
      | {{loadError}}

    .columns.is-mobile(v-else)
      .column.is-3(v-for="group in groups")
        .card.my-node-card(@click="selectGroup(group)")
          header.card-header
            p.card-header-title.has-text-grey
              | {{ group.nodeGroup }}

          .card-content
            .content.has-text-centered
              b-icon(v-if="group.nodeGroup==='master'", icon="arrange-bring-to-front", size="is-large", type="is-primary")
              b-icon(v-else, icon="google-circles-communities", size="is-large", type="is-primary")

          footer.card-footer
            .card-footer-item
              span(v-if="group.activeNodes === 1") {{group.activeNodes}} node
              span(v-else) {{group.activeNodes}} nodes
              //- span(v-if="group.nodeGroup==='master'")
              //-   b {{node.description}}
              //-   p type: {{node.type}}
              //-   //- p version: {{node.version}}
              //-   p &nbsp;
              //-   p
              //-     b-icon(icon="transit-connection", size="is-small")
              //-     | &nbsp;{{node.pipelines.length}}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              //-     b-icon(icon="call-merge", size="is-small")
              //-     | &nbsp;{{node.stepTypes.length}}
              //- span(v-else)
              //-   b {{node.description}}
              //-   p type: {{node.type}}
              //-   //- p version: {{node.version}}
              //-   p status: {{node.status}}
              //-   p
              //-     b-icon(icon="transit-connection", size="is-small")
              //-     | &nbsp;{{node.pipelines.length}}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              //-     b-icon(icon="call-merge", size="is-small")
              //-     | &nbsp;{{node.stepTypes.length}}

        //- card(v-if="node.type==='master'", :title="node.name", icon="arrange-bring-to-front", @click="selectGroup")
        //-   b {{node.description}}
        //-   p type: {{node.type}}
        //-   //- p version: {{node.version}}
        //-   p &nbsp;
        //-   p
        //-     b-icon(icon="transit-connection", size="is-small")
        //-     | &nbsp;{{node.pipelines.length}}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        //-     b-icon(icon="call-merge", size="is-small")
        //-     | &nbsp;{{node.stepTypes.length}}
        //- card(v-else, :title="node.name", icon="google-circles-communities")
        //-   b {{node.description}}
        //-   p type: {{node.type}}
        //-   //- p version: {{node.version}}
        //-   p status: {{node.status}}
        //-   p
        //-     b-icon(icon="transit-connection", size="is-small")
        //-     | &nbsp;{{node.pipelines.length}}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        //-     b-icon(icon="call-merge", size="is-small")
        //-     | &nbsp;{{node.stepTypes.length}}
    br
    //- | {{nodes}}

    //- h2.title.is-3.has-text-grey
    //-   | Nodes&nbsp;&nbsp;
    //-   b-icon(icon="state-machine", size="is-large")
    //- br
    //- h3.subtitle.is-6.has-text-grey
    //-   | YARP
    //- | etc etc etc
</template>


<script>
import MondatNotification from "~/components/MondatNotification.vue"
import MondatTable from "~/components/MondatTable.vue"
import Card from '~/components/Card'

export default {
  components: {
    MondatNotification,
    MondatTable,
    Card,
  },

  data: function () {
    return {
      groups: [ ],
      loading: true,
      loadError: null,

      polling: null, // handle from setInterval
      autoUpdateInterval: 5,
    }
  },//- data

  created() {
    // Only run on the client
    if (process.server) {
      return
    }
    this.doUpdate()
  },//- created


  beforeDestroy () {
    if (this.polling) {
      clearTimeout(this.polling)
    }
  },//- beforeDestroy

  methods: {
    changeUpdateInterval: async function () {
      if (this.polling) {
        clearTimeout(this.polling)
        this.polling = null
      }
      this.doUpdate()
    },//- changeUpdateInterval

    doUpdate: async function () {
      const url = `${this.$monitorEndpoint}/nodeGroups`
      try {
        this.loading = true
        this.groups = await this.$axios.$get(url)
        this.loading = false
        this.loadError = null
      } catch (e) {
        this.loading = false
        // console.log(`url=`, url)
        // console.log(`e=`, e)
        // console.log(`e.response=`, e.response)
        // console.log(`typeof(e)=`, typeof(e))
        // console.log(`e.message=`, e.message)
        this.loadError = e.message
      }

      // Maybe restart the timer
      if (this.autoUpdateInterval > 0) {
        this.polling = setTimeout(this.doUpdate, this.autoUpdateInterval * 1000)
      }
    },//- doUpdate

    selectGroup: function (group) {
      console.log(`selectGroup`, group)
      if (group.activeNodes < 1) {
        this.$buefy.toast.open({
            message: "This node group is inactive, so no information is available.",
            type: "is-info",
          })
        return
      }
      const nodeGroup = group.nodeGroup
      this.$router.push({ path: `/mondat/group/${nodeGroup}` })
    },
  }//- methods
}
</script>

<style lang="scss" scoped>
.my-node-card {
  cursor: pointer;
  background-color: #36334b;

  .card-header-title {
    font-size: 1.2em; 
    font-family: 'Open Sans';
    color: #f0f0f0 !important;
  }
}

</style>
