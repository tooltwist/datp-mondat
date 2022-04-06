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
      | Caches &nbsp;&nbsp;&nbsp;
      b-tag(v-if="loadError==='Network Error'", rounded, type="is-danger", size="is-large") Offline
      b-tag(v-if="loading", rounded, type="is-success", size="is-small") Loading
    .is-clearfix

    MondatNotification
      //- p
        | The&nbsp;
        b D.A.T.P.
        | &nbsp;system is distributed, meaning it runs across multiple software servers, which we call nodes.
        br
        br
      p
        | To minimise database bottlenecks&nbsp;
        b D.A.T.P.
        | &nbsp;uses extensive caching.
        //- br
        //- p
        | As transactions proceed through their pipelines, we keep track of the state of each transaction and it's various steps.
        | We perform caching first using a short term in-memory cache, in the server running the step.
        | If a step goes to sleep awaiting a retry, or the transaction jumps to a pipeline on a different server, we bump
        | the transaction state up to the global REDIS cache, where it can be drawn back down to the in-memory cache by the next step.
        | If a step sleeps for a long period, or when a transaction completes, we persist the transaction state to long-term database storage.
        br
        br
      p
        | Note that 'transaction state' is information used during the processing of the transaction, and is
        | different to the 'transaction summary' that contains information for the external initiator of the transaction.
        | This transaction state information is persisted only for debug and audit purposes.

    br
    br

    //- span(v-if="loading")
      | Loading...
    .notification.is-danger(v-if="loadError && loadError !== 'Network Error'")
      | {{loadError}}

    | Global transaction-state cache:
    b &nbsp;&nbsp;&nbsp;{{ stats.transactionStates }} entries
    | &nbsp;&nbsp;&nbsp;&nbsp; ({{ stats.transactionStatesPending }} queued for DB persistence)
    br
    br
    table.my-statTable
      tr.my-statTr
        th
          | Group
        th
          | Node
        th.has-text-centered
          | Queue length
        th.has-text-centered
          | Express queue
        //- th.has-text-centered
          | Processing
        th.has-text-centered
          | Active workers
        th.has-text-centered
          | tx/sec
        th.has-text-centered
          | steps/sec
      template(v-for="group in stats.groups")
        tr
          td(colspan="2")
            b {{ group.nodeGroup }}
          td.has-text-right
            b grp: {{ group.queueLen }}
          td
          td
          //- td
          td
          td
        template(v-for="node in group.nodes")
          tr.my-statTr
            td(style="min-width: 120px;")
            td(style="min-width: 120px;")
              | {{shortNodeId(node.nodeId)}}
            td.has-text-right {{node.queueLen}}
            td.has-text-right {{node.expressQueueLen}}
            //- td.has-text-right.has-text-warning {{node.events.processing}}
            td.has-text-right.has-text-warning {{node.workers.running}} of {{node.workers.total}}
            //- td.has-text-right.has-text-warning +{{node.throughput.txInSec}} / -{{node.throughput.txOutSec}}
            td.has-text-right.has-text-warning {{node.throughput.txInSec}}
            td.has-text-right.has-text-warning {{node.throughput.stepsSec}}
            //- td {{node.events}}
            //- br
            //- | Workers: {{stats.workers}}
            //- br
            //- | Throughput: {{stats.throughput}}
            //- br
      //- hr
    .has-text-right.is-size-7.has-text-gray
      br
      | Values marked in orange are updated infrequently


    //- .columns.is-mobile(v-else)
      .column.is-3(v-for="group in groups")
        .card.my-node-card(@click="selectGroup(group.nodeGroup)")
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
      stats: { },

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
      const url = `${this.$monitorEndpoint}/cacheStats`
      try {
        this.loading = true
        this.stats = await this.$axios.$get(url)
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

    shortNodeId: function(nodeId) {
      if (nodeId.startsWith('nodeId-')) {
        nodeId = nodeId.substring(7)
      }
      if (nodeId.length > 7) {
        nodeId = nodeId.substring(0, 7)
      }
      return nodeId
    }

    // selectGroup: function (nodeGroup) {
    //   // console.log(`selectGroup`, nodeId)
    //   this.$router.push({ path: `/mondat/group/${nodeGroup}` })
    // },
  }//- methods
}
</script>

<style lang="scss" scoped>
// .my-node-card {
//   cursor: pointer;
//   background-color: #36334b;

//   .card-header-title {
//     font-size: 1.2em; 
//     font-family: 'Open Sans';
//     color: #f0f0f0 !important;
//   }
// }

.my-statTable {
  // border: solid 1px red;
  border-collapse: collapse;
  width: 100%;
}

.my-statTable tr {
  // border: solid 1px blue;
}

.my-statTable th {
  border: dotted 1px #e0e0e0;
  border-left-color: red;
  padding-left: 8px;
  padding-right: 8px;
  background-color: #d0d0d0;
  color: black;
  font-size: 0.9em;
  font-weight: 400;
}

.my-statTable td {
  border: dotted 1px #606060;
  // border: solid 1px green;
  padding-left: 8px;
  padding-right: 8px;
  font-family: 'Courier New', Courier, monospace;
  font-weight: 700;
}
</style>
