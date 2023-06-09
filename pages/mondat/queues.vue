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
      .mondat-heading-icon
        b-icon(icon="gauge", size="is-small")
      | Queues and Workers
      b-tag.my-tag(v-if="loadError==='Network Error'", rounded, type="is-danger", size="is-medium") Offline
      b-tag.my-tag(v-if="loading", rounded, type="is-success", size="is-small") Loading
    .is-clearfix


    MondatNotification
      | Processing requests are sent to queues, which are forwarded to worker threads.
      | Sometimes events are sent to a node group, and sometimes they are sent to a specific node.
      | A node reads events from both it's own queue and the group queue and passes these on
      | to it's worker threads.
    br

    .notification.is-danger(v-if="loadError && loadError !== 'Network Error'")
      | {{loadError}}

    //- pre
    template(v-else)
      b {{ listSizes.processing }}&nbsp;
      | transactions processing,&nbsp;&nbsp
      b {{ listSizes.sleeping }}&nbsp;
      | transactions sleeping,&nbsp;&nbsp
      b {{ listSizes.archiving }}&nbsp;
      | to be archived,&nbsp;&nbsp
      | and&nbsp;
      b {{ listSizes.webhooks }}&nbsp;
      | outstanding webhooks.
      br
      br
      .columns.is-mobile.is-multiline
        .column.is-6(v-for="group in groups")
          .card.my-node-group-card
            header.card-header
              .card-header-title.has-text-grey Node group '{{ group.nodeGroup }}'
            .card-content
              //- .is-pulled-right
                b-button.is-small.is-warning(@click="openGroupDetailsModal(group)") configure
              //- | Workers: {{requiredWorkers(group)}}
              //- br
              //- | Group queues:&nbsp;&nbsp;
              //- template(v-if="group.queueLength > 0")
              //-   b {{group.queueLength}}
              //- template(v-else)
              //-   //- | Group queue:&nbsp;&nbsp;
              //-   b -
              .columns 
                .column.is-5
                  h1.title.is-size-5 Queue Lengths
                  | &nbsp;&nbsp;in: {{ group.queues.in }}
                  br
                  | &nbsp;&nbsp;out: {{ group.queues.out }}
                  br
                  | &nbsp;&nbsp;admin: {{ group.queues.admin }}
                .column.is-5
                  h1.title.is-size-5 Throughput
                  h1.subtitle.is-size-7 (during the past minute)
                  | &nbsp;&nbsp;queued: {{ group.stats.queued }}
                  br
                  | &nbsp;&nbsp;de-queued: {{ group.stats.started }}
                .column.is-2
                  b-button.is-small.is-warning(@click="openGroupDetailsModal(group)") configure
              //- h1.title.is-size-5 Workers
              //- | in: {{ group.queues.in }}
              table.table.is-fullwidth
                thead
                  tr
                    th Node
                    th Workers
                    th Busy
                    th Waiting
                    th Required
                    th Version
                    th DATP
                tbody
                  template(v-for="node in group.nodes")
                    tr
                      td {{ shortNodeId(node.nodeId) }}
                      td.has-text-right {{ node.workers.total }}
                      td.has-text-right {{ node.workers.running }}
                      td.has-text-right {{ node.workers.waiting }}
                      td.has-text-right {{ node.workers.required }}
                      td.has-text-right {{ node.appVersion }}
                      td.has-text-right {{ node.datpVersion }}
                      
                    //- tr
                      td(colspan="7")
                        | {{ node.stats }}
                //- tfoot
                  tr
                    td
              //- .content.has-text-centered
              //- | {{ group }}
              //- | {{ listSizes }}

      //| {{ JSON.stringify(nodeStats, '', 2) }}
      //- .columns.is-mobile.is-multiline
        .column.is-3(v-for="group in nodeStats")
          .card.my-node-group-card
            header.card-header
              .card-header-title.has-text-grey Node group '{{ group.nodeGroup }}'
            .card-content
              .is-pulled-right
                b-button.is-small.is-warning(@click="openGroupDetailsModal(group)") configure
              //- | Workers: {{requiredWorkers(group)}}
              //- br
              | Group queue:&nbsp;&nbsp;
              template(v-if="group.queueLength > 0")
                b {{group.queueLength}}
              template(v-else)
                //- | Group queue:&nbsp;&nbsp;
                b -
              br
              br
              .content.has-text-centered

                // Display the orphaned queues (node has died)
                template(v-if="Object.keys(group.orphanNodes).length > 0")
                  .orphan-queue(v-for="node in Object.values(group.orphanNodes)", @click="selectOrphan(group, node)")
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
                    b Throughput / sec
                    br
                    //- table.myTable
                      tr
                        td trans:
                        td
                          b {{fiveSecondsOfTransactionsIn(node)}}
                          | &nbsp;in
                        td
                          b {{fiveSecondsOfTransactionsOut(node)}}
                          | &nbsp;out
                      tr
                        td steps:
                        td(colspan="1")
                          b {{fiveSecondsOfSteps(node)}}

                    // Queues
                    b Queue lengths
                    br
                    //- table.myTable
                      tr
                        td memory:
                        td
                          b {{node.events.regularMemoryQueue}}
                          | &nbsp;in
                        td
                          b {{node.events.expressMemoryQueue}}
                          | &nbsp;out
                      tr
                        td REDIS:
                        td
                          b {{node.regularQueueLength}}
                          | &nbsp;in
                        td
                          b {{node.expressQueueLength}}
                          | &nbsp;out
                      tr
                        td group:
                        td
                          b {{group.regularQueueLength}}
                          | &nbsp;in
                        td
                          b {{group.expressQueueLength}}
                          | &nbsp;out

                    // Threads
                    b Worker threads
                    br
                    | {{node.workers.running}} / {{node.workers.required}} / {{node.workers.total}} active
                    template(v-if="node.workers.shuttingDown")
                      br
                      | {{node.workers.shuttingDown}} shutting down
                    template(v-if="node.workers.standby")
                      br
                      | {{node.workers.standby}} on standby
                    template(v-if="node.outstandingLongPolls")
                      br
                      | {{node.outstandingLongPolls}} outstanding long polls
                      //- br
                      //- br
                      //- br

    //- MondatPieChart()
    //- b-modal(v-model="showOrphanNodeModal", :width="550", scroll="keep")
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

    b-modal(v-model="showGroupDetailsModal", :width="400", scroll="keep")
      .card(v-if="nodeGroupBeingAltered")
        header.card-header
          p.card-header-title Node group &nbsp;'
            b {{nodeGroupBeingAltered.nodeGroup}}
            | '
        .card-content
          | Changing these details will update all nodes within the group, and may take a few minutes to propagate.
          br
          br
          br
          b-field.is-size-6(label="Workers", horizontal)
            b-input.is-size-6(v-model="requiredWorkersForNodeGroup", type="number")
          br
          br
          //- br
          //- | nodeGroupBeingAltered IS {{nodeGroupBeingAltered}}

        footer.card-footer
          a.card-footer-item(href="#", card-footer-item, @click="updateGroupDetails") Update
          a.card-footer-item(href="#", card-footer-item, @click="closeGroupDetailsModal") Close

</template>

<script>
import MondatNotification from "~/components/MondatNotification.vue"
import MondatTable from "~/components/MondatTable.vue"

export default {
  components: {
    MondatNotification,
    MondatTable,
    // MondatPieChart,
  },
  data: function () {
    return {
      // Automatic refreshing of data
      autoUpdateInterval: 5,
      polling: null,

      // New stuff
      processing: { },
      listSizes: { },
      groups: [ ],

      // Statistics data
      // nodeStats: [ ], // statistics about nodes

      // Don't keep repeating an error when polling
      // firstError: true,
      loading: true,
      loadError: null,

      // If a node is orphaned
      orphanGroup: null,
      orphanNode: null,

      // Display a modal, where we can change the number of workers for the group.
      showGroupDetailsModal: false,
      nodeGroupBeingAltered: null,
      requiredWorkersForNodeGroup: 1,
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
    },

  },

  methods: {

    requiredWorkers: function (group) {
      for (const nodeId in group.nodes) {
        const node = group.nodes[nodeId]
        return node.workers.required
      }
    },
    
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
        const reply = await this.$axios.$get(url)
        this.processing = reply.processing
        this.listSizes = reply.listSizes
        this.groups = reply.groups

        delete this.groups._status // Added by plugin
        delete this.groups._statusText
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

    // fiveSecondsOfTransactionsIn: function (node) {
    //   const arr = node.stats.transactionsInPastMinute
    //   const l = arr.length
    //   const total = arr[l-1] + arr[l-2] + arr[l-3] + arr[l-4] + arr[l-5]
    //   return Math.round(total / 5)
    // },

    // fiveSecondsOfTransactionsOut: function (node) {
    //   const arr = node.stats.transactionsOutPastMinute
    //   const l = arr.length
    //   const total = arr[l-1] + arr[l-2] + arr[l-3] + arr[l-4] + arr[l-5]
    //   return Math.round(total / 5)
    // },

    // fiveSecondsOfSteps: function (node) {
    //   const arr = node.stats.stepsPastMinute
    //   const l = arr.length
    //   const total = arr[l-1] + arr[l-2] + arr[l-3] + arr[l-4] + arr[l-5]
    //   return Math.round(total / 5)
    // },

    // selectOrphan: function (group, node) {
    //   // console.log(`selectOrphan(${group.nodeGroup}, ${node.nodeId})`)
    //   this.orphanGroup = group
    //   this.orphanNode = node
    // },

    // moveOrphanToGroup: async function (group, node) {
    //   // console.log(`moveOrphanToGroup()`)
    //   // console.log(`group=`, group)
    //   // console.log(`node=`, node)
    //   const url = `${this.$monitorEndpoint}/handleOrphanQueues/${group.nodeGroup}/${node.nodeId}`
    //   // console.log(`url=`, url)
    //   try {
    //     const result = await this.$axios.$get(url)
    //     delete result._status // Added by plugin
    //     delete result._statusText
    //     // console.log(`result=`, result)
    //     this.orphanGroup = null
    //     this.orphanNode = null
    //     alert(`Moved ${result.moved} events from the dead node's queue to the node group's queue.`)
    //   } catch (e) {
    //     // console.log(`url=`, url)
    //     console.log(`e=`, e)
    //     alert(`Error while moving events to group queue`)
    //   }
    // },

    // closeOrphanModal: function () {
    //   this.orphanGroup = null
    //   this.orphanNode = null
    // },

    openGroupDetailsModal: function (group) {
      this.showGroupDetailsModal = true
      this.nodeGroupBeingAltered = group
      this.requiredWorkersForNodeGroup = this.requiredWorkers(group)
    },

    closeGroupDetailsModal: function () {
      this.showGroupDetailsModal = false
      this.nodeGroupBeingAltered = null
    },

    updateGroupDetails: async function () {
      // console.log(`updateGroupDetails`)

      const numWorkers = parseInt(this.requiredWorkersForNodeGroup)
      // console.log(`numWorkers=`, numWorkers)
      
      if (!isNaN(numWorkers)) {
        const url = `${this.$monitorEndpoint}/nodeGroup/${this.nodeGroupBeingAltered.nodeGroup}/setNumWorkers`
        const data = { numWorkers }
        // console.log(`url=`, url)
        // console.log(`data=`, data)
        const response = await this.$axios.$put(url, data)
        // console.log(`response=`, response)
        this.showGroupDetailsModal = false
        this.nodeGroupBeingAltered = null
        // console.log(`reply=`, reply);
        this.$buefy.toast.open({
          message: "This update may take a minute or two to propagate.",
          type: "is-info",
        })
      }
    },

    changeUpdateInterval: async function () {
      if (this.polling) {
        clearTimeout(this.polling)
        this.polling = null
      }
      this.doUpdate()
    },//- changeUpdateInterval

  }//- methods
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

  .myTable tr td {
    border: none;
    white-space: nowrap;
    padding: 2px;
    text-align: right;
  }

}
</style>
