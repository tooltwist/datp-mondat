/* Copyright Tooltwist Innovations Limited - All Rights Reserved
 * This file is part of DATP and as such is proprietary and confidential software.
 * Unauthorized copying of this file, via any medium is strictly prohibited. All
 * rights reserved. No warranty, explicit or implicit, provided. In no event shall
 * the author or owner be liable for any claim or damages.
 */
<template lang="pug">
client-only
  section.section
    b-field.is-pulled-right
      b-checkbox(v-model="autoUpdate") Auto-update
    h2.title.is-4
      .datemon-heading-icon
        b-icon(icon="state-machine", size="is-small")
      | Nodes

    MondatNotification
      p
        | The&nbsp;
        b D.A.T.P.
        | &nbsp;system is distributed, meaning runs across multiple software servers, which we call nodes.
      p
        | As nodes come online they make their pipelines available.
        | Typically each node runs as a separate Docker container, which allows them to be developed independantly
        | by different teams. This design also maximises security, because each node is unable to
        | access the data or logic of other nodes.
      p
        | The&nbsp;
        b master
        | &nbsp;node is reponsible for triaging incoming transactions, and depending upon the
        | transaction type and data will pass the transaction off to a pipeline running on another node.

    //- MondatTable(:data="nodes", :columns="columns")

    br
    br

    span(v-if="loading")
      | Loading...
    .notification.is-danger(v-else-if="loadError")
      | {{loadError}}
    .columns.is-mobile(v-else)
      .column.is-3(v-for="group in groups")
        .card.my-node-card(@click="selectNode(group.nodeGroup)")
          header.card-header
            p.card-header-title.has-text-grey
              | {{ group.nodeGroup }}

          .card-content
            .content.has-text-centered
              b-icon(v-if="group.nodeGroup==='master'", icon="arrange-bring-to-front", size="is-large", type="is-primary")
              b-icon(v-else, icon="google-circles-communities", size="is-large", type="is-primary")

          footer.card-footer
            .card-footer-item
              span(v-if="group.nodes.length > 1") {{group.nodes.length}} nodes
              span(v-else) {{group.nodes.length}} node
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






        //- card(v-if="node.type==='master'", :title="node.name", icon="arrange-bring-to-front", @click="selectNode")
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

      columns: [
        {
            field: 'name',
            label: 'Name',
        },
        {
            field: 'description',
            label: 'Description',
        },
        {
            field: 'version',
            label: 'Version',
        },
        {
            field: 'status',
            label: 'Status',
        },
        {
            field: 'nodeId',
            label: 'Node id',
            // width: '500',
            // numeric: true
        },
      ],//- columns

      polling: null, // handle from setInterval
      autoUpdate: false, // Constantly refresh the screen
    }
  },//- data

  async asyncData({ $axios, $monitorEndpoint }) {
    // Only run on the client
    if (process.server) {
      return { loading: true, loadError: null}
    }

    const url = `${$monitorEndpoint}/activeNodes`
    try {
      const groups = await $axios.$get(url)
      // console.log(`groups=`, groups)
      return { groups, loading: false, loadError: null }
    } catch (e) {
      console.log(`url=`, url)
      console.log(`e.response=`, e.response)
      return { loading: false, loadError: e.toString() }
    }
  },//- asyncData

  created() {
    // Only run on the client
    if (process.server) {
      return
    }

    this.polling = setInterval(async () => {
      if (this.autoUpdate) {
        const url = `${this.$monitorEndpoint}/activeNodes`
        this.groups = await this.$axios.$get(url)
      }
    }, 2000)
  },//- created

  beforeDestroy () {
    clearInterval(this.polling)
  },//- beforeDestroy

  methods: {
    selectNode: function (nodeId) {
      // console.log(`selectNode`, nodeId)
      // const pipelineName = row.name
      // console.log(`selectPipeline(${nodeId})`)
      this.$router.push({ path: `/mondat/node/${nodeId}` })
    },
  }//- methods
}
</script>

<style lang="scss" scoped>
.my-node-card {
  cursor: pointer;
}
</style>
