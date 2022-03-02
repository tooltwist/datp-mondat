/* Copyright Tooltwist Innovations Limited - All Rights Reserved
 * This file is part of DATP and as such is proprietary and confidential software.
 * Unauthorized copying of this file, via any medium is strictly prohibited. All
 * rights reserved. No warranty, explicit or implicit, provided. In no event shall
 * the author or owner be liable for any claim or damages.
 */
<template lang="pug">
client-only
  section.section.my-queues
    b-field.is-pulled-right(label="Update:", horizontal)
      b-select(v-model="autoUpdateInterval", @input="changeUpdateInterval")
        option(:value="0", :key="0") None
        option(:value="5", :key="5") 5 seconds
        option(:value="20", :key="15") 20 seconds
        option(:value="60", :key="60") 60 seconds

    h2.title.is-4
      .datemon-heading-icon
        b-icon(icon="gauge", size="is-small")
      | Queues and Workers
      b-tag.my-tag(v-if="loadError==='Network Error'", rounded, type="is-danger", size="is-medium") Offline
      b-tag.my-tag(v-if="loading", rounded, type="is-success", size="is-small") Loading
    .is-clearfix


    MondatNotification
      | Processing requests are sent to queues, which are forwarded to worker threads.
      | Sometimes events are sent to a node group, and sometimes they are send to a specific node.
      | A node reads events from both it's own queue and the group queue, and passes these on
      | to it's worker threads.
    br

    .notification.is-danger(v-if="loadError && loadError !== 'Network Error'")
      | {{loadError}}

    //- pre
      //| {{ JSON.stringify(nodeStats, '', 2) }}
    .columns.is-mobile(v-else)
      .column.is-3(v-for="group in nodeStats")
        .card.my-node-group-card
          header.card-header
            .card-header-title.has-text-grey Node group '{{ group.nodeGroup }}'
          .card-content
            | Group queue:&nbsp;&nbsp;
            template(v-if="group.queueLength > 0")
              b {{group.queueLength}} events
            template(v-else)
              //- | Group queue:&nbsp;&nbsp;
              b empty
            br
            br
            .content.has-text-centered

              // Display the orphaned queues (node has died)
              template(v-if="group.orphanNodes.length > 0")
                .orphan-queue(v-for="node in group.orphanNodes", @click="selectOrphan(group, node)")
                  | Orphan {{shortNodeId(node.nodeId)}} ({{node.queueLength}})
                br

              // Display active queues
              .card.my-node(v-for="node in group.nodes")
                header.card-header

                  b-icon.my-icon(v-if="group.nodeGroup==='master'", icon="arrange-bring-to-front", size="is-small", type="is-primary")
                  b-icon.my-icon(v-else, icon="google-circles-communities", size="is-small", type="is-primary")

                  b &nbsp; Node {{shortNodeId(node.nodeId)}}
                .card-content

                  // Transactions
                  b Throughput
                  br
                  | tx/sec: &nbsp;+{{fiveSecondsOfTransactionsIn(node)}},
                  | &nbsp;
                  | -{{fiveSecondsOfTransactionsOut(node)}}
                  br
                  | steps/second: {{fiveSecondsOfSteps(node)}}
                  br
                  br

                  // Queues
                  b Queues
                  br
                  | regular: {{node.regularQueueLength}},&nbsp;
                  //- br
                  | express: {{node.expressQueueLength}}
                  br
                  br

                  // Threads
                  b Worker threads
                  br
                  | {{node.workers.running}} of {{node.workers.total}} active
                  template(v-if="node.workers.shuttingDown")
                    br
                    | {{node.workers.shuttingDown}} shutting down
                  template(v-if="node.workers.standby")
                    br
                    | {{node.workers.standby}} on standby
                  br

                  // Caches
                  template(v-if="node.transactionsInCache || node.outstandingLongPolls")
                    br
                    b Cache
                    br
                    | {{node.transactionsInCache}} transactions
                    br
                    | {{node.outstandingLongPolls}} long polls
                    br
                    br
                    br

    //- MondatPieChart()
    b-modal(v-model="showOrphanNodeModal", :width="550", scroll="keep")
      .card
        header.card-header
          //- p.card-header-title Field Properties {{tmp._id}}
          p.card-header-title Orphaned Queue
        .card-content(v-if="orphanNode")
          | These queues are for a node that no longer exists.
          | The events on these queues will not be processed now unless they are moved to the group queue.
          br
          br
          | {{orphanNode.queueLength}} event
          template(v-if="orphanNode.queueLength != 1") s
          | &nbsp;in queues, being:
          br
          | &nbsp;&nbsp;&nbsp;&nbsp; {{orphanNode.regularQueueLength}} in the regular queue.
          br
          | &nbsp;&nbsp;&nbsp;&nbsp; {{orphanNode.expressQueueLength}} in the express queue.
          //- pre
            | {{JSON.stringify(orphanNode, '', 2)}}

        footer.card-footer
          a.card-footer-item(href="#", card-footer-item, @click="moveOrphanToGroup(orphanGroup, orphanNode)") Move events to the Group Queue
          a.card-footer-item(href="#", card-footer-item, @click="closeOrphanModal") Close
          //- a.card-footer-item(href="#", card-footer-item, @click="doDelete") Delete

</template>

<script>
// import LazyLinearGauge from '~/components/LazyLinearGauge.vue'
// import LazyRadialGauge from '~/components/LazyRadialGauge.vue'
import MondatNotification from "~/components/MondatNotification.vue"
import MondatTable from "~/components/MondatTable.vue"
// import MondatPieChart from "~/components/MondatPieChart.vue"

export default {
  components: {
    // LazyLinearGauge,
    // LazyRadialGauge,
    MondatNotification,
    MondatTable,
    // MondatPieChart,
  },
  data: function () {
    return {
      // Automatic refreshing of data
      autoUpdateInterval: 5,
      polling: null,

      // Statistics data
      nodeStats: [ ], // statistics about nodes

      // Don't keep repeating an error when polling
      // firstError: true,
      loading: true,
      loadError: null,

      // If a node is orphaned
      orphanGroup: null,
      orphanNode: null,
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
    clearInterval(this.polling)
  },//- beforeDestroy

  computed: {
    showOrphanNodeModal: function () {
      return this.orphanNode !== null
    }
  },

  methods: {
    changeUpdateInterval: async function () {
      if (this.polling) {
        clearTimeout(this.polling)
        this.polling = null
      }
      this.doUpdate()
    },//- changeUpdateInterval

    doUpdate: async function () {
      const url = `${this.$monitorEndpoint}/queueStats`
      try {
        this.loading = true
        this.nodeStats = await this.$axios.$get(url)
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

    shortNodeId: function (nodeId) {
      const pos = nodeId.indexOf('-')
      if (pos > 0) {
        nodeId = nodeId.substring(pos + 1)
      }
      return nodeId.substring(0, 8)
    },//- shortNodeId

    fiveSecondsOfTransactionsIn: function (node) {
      const arr = node.stats.transactionsInPastMinute
      const l = arr.length
      const total = arr[l-1] + arr[l-2] + arr[l-3] + arr[l-4] + arr[l-5]
      return Math.round(total / 5)
    },

    fiveSecondsOfTransactionsOut: function (node) {
      const arr = node.stats.transactionsOutPastMinute
      const l = arr.length
      const total = arr[l-1] + arr[l-2] + arr[l-3] + arr[l-4] + arr[l-5]
      return Math.round(total / 5)
    },

    fiveSecondsOfSteps: function (node) {
      const arr = node.stats.stepsPastMinute
      const l = arr.length
      const total = arr[l-1] + arr[l-2] + arr[l-3] + arr[l-4] + arr[l-5]
      return Math.round(total / 5)
    },

    selectOrphan: function (group, node) {
      // console.log(`selectOrphan(${group.nodeGroup}, ${node.nodeId})`)
      this.orphanGroup = group
      this.orphanNode = node
    },

    moveOrphanToGroup: async function (group, node) {
      // console.log(`moveOrphanToGroup()`)
      // console.log(`group=`, group)
      // console.log(`node=`, node)
      const url = `${this.$monitorEndpoint}/handleOrphanQueues/${group.nodeGroup}/${node.nodeId}`
      // console.log(`url=`, url)
      try {
        const result = await this.$axios.$get(url)
        // console.log(`result=`, result)
        this.orphanGroup = null
        this.orphanNode = null
        alert(`Moved ${result.moved} events from the dead node's queue to the node group's queue.`)
      } catch (e) {
        // console.log(`url=`, url)
        console.log(`e=`, e)
        alert(`Error while moving events to group queue`)
      }
    },

    closeOrphanModal: function () {
      this.orphanGroup = null
      this.orphanNode = null
    },

    changeUpdateInterval: async function () {
      if (this.polling) {
        clearTimeout(this.polling)
        this.polling = null
      }
      this.doUpdate()
    },//- changeUpdateInterval

  }
}
</script>

<style lang="scss" scoped>
.my-queues {
  .my-node-group-card {
    background-color: #36334b;
  }


  font-size: 0.85em;
  .my-icon {
    margin: 5px;
  }
  .orphan-queue {
    // width: 100%;
    // font-family: 'Courier New', Courier, monospace;
    font-weight: 600;
    font-size: 16px;
    color: white;
    background-color: red;
    margin-bottom: 9px;
    border-radius: 6px;
    cursor: pointer;

    &:hover {
      background-color: blueviolet;
    }
  }
  .my-tag {
    margin-left: 25px;
  }

  .my-node {
    background-color: #171717;
  }
}
</style>
