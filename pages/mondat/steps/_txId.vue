/* Copyright Tooltwist Innovations Limited - All Rights Reserved
 * This file is part of DATP and as such is proprietary and confidential software.
 * Unauthorized copying of this file, via any medium is strictly prohibited. All
 * rights reserved. No warranty, explicit or implicit, provided. In no event shall
 * the author or owner be liable for any claim or damages.
 */
<template lang="pug">
.my-steps-page
  section.section
    .is-pulled-right
      b-button(type="is-successZ", @click="reloadDetails") Reload
      | &nbsp;&nbsp;
      b-button(type="is-success", @click="backToTransactions") Back
    h2.title.is-4.has-text-grey
      .datemon-heading-icon
        b-icon(icon="bank-transfer", size="is-medium")
      | Transaction {{txId}}
    br
    DatemonNotification
      p
        | This page shows only steps that have been run.
        | Steps that have not been initiated yet will not be shown.
        p
        | Note that the steps reported here may not match up with the current pipeline definition
        | for the transaction type, if a new version of the pipeline is in use.

    span(v-if="loading")
      | Loading...
    span(v-else-if="loadError")
      .notification.is-danger() {{loadError}}
    template(v-else)
      .columns
        .column.is-4
          div(@click="showTransactionDetails")
            | Transaction type:&nbsp;&nbsp;&nbsp;
            b {{txinfo.transactionType}}
          br
          StepRunResult(v-for="rec in hierarchy", :step="rec", :key="rec.path", :level="0", :currentStepId="currentStepId", @showDetails="showDetails")
          //- | {{hierarchy}}
          //- pre
            | {{JSON.stringify(steps, '', 2)}}
        .column.is-1
        .column.is-7

          // Right hand column with details
          template(v-if="currentStepId === ''")

            // Show the transaction details
            br
            br
            b.is-size-6 Transaction {{txId}}
            br
            br
            table.table
              tr
                td Transaction type:
                td
                  b {{txinfo.transactionType}}
              tr
                td Status:
                td
                  b {{txinfo.status}}
              tr
                td nodeGroup:
                td
                  | {{txinfo.nodeGroup}}
              tr
                td Node ID:
                td
                  | {{txinfo.nodeId}}
              tr
                td Pipeline:
                td
                  | {{txinfo.pipelineName}}



          template(v-else-if="stepDetails")

            // Show the Step details
            br
            br
            b.is-size-6 Step {{stepDetails.stepId}}
            br
            br
            //- pre
              | {{JSON.stringify(stepDetails, '', 2)}}
            b-tabs(:animated="false")

              b-tab-item(key="log", label="Log entries")
                // Log entries
                b-table.my-table.is-size-7(
                  :data="logEntries",
                  :columns="logEntriesColumns",
                  hoverable)
                //- | {{logEntries}}

              b-tab-item(key="details", label="Details")
                table.table
                  tr(v-if="isPipeline")
                    td Pipeline:
                    td
                      b {{stepDetails.stepDefinition}}
                  tr(v-else)
                    td Step Type:
                    td
                      b {{stepDetails.stepDefinition.stepType}}
                  tr
                    td Status:
                    td
                      b {{stepDetails.status}}
                  tr
                    td Start time:
                    td
                      | {{stepDetails.startTime}}
                  //- tr
                  //-   td Completion time:
                  //-   td
                  //-     | {{stepDetails.completionTime}}
                  //-     //-  - {{typeof(stepDetails.completionTime)}}
                  //- tr
                  //-   td Progress:
                  //-   td
                  //-     | {{stepDetails.progress}}
              b-tab-item(key="input", label="Input")
                b-field(label="Input")
                  b-input(type="textarea", v-model="stepInputJSON", rows="19", size="is-small", readonly, disabled)

              b-tab-item(key="output", label="output")
                b-field(label="Output")
                  b-input(type="textarea", v-model="stepOutputJSON", rows="19", size="is-small", readonly, disabled)

              b-tab-item(key="definition", label="Definition")
                // Step definition
                b-field(label="Step definition")
                  b-input(type="textarea", v-model="stepDefinitionJSON", rows="19", size="is-small", readonly, disabled)

              //- b-tab-item(key="log2", label="Log entries")
                // Log entries
                b-table.my-table.is-size-7(
                  :data="logEntries",
                  :columns="logEntriesColumns",
                  hoverable)
                //- | {{logEntries}}

              //- b-tab-item(key="artifacts", label="Artifacts")
                | Not available at this time

              //- b-tab-item(key="audit", label="Audit trail")
                | Not available at this time

              b-tab-item(key="stepData", label="StepData")
                  b-input(type="textarea", v-model="stepDetailsJSON", rows="19", size="is-small", readonly, disabled)

            //- pre.is-size-6(v-if="typeof(stepDetails) === 'object'")
              | {{JSON.stringify(stepDetails, '', 2)}}
      //- DatemonTable(:data="steps", :columns="columns", :rows="14")
</template>

<script>
import DatemonNotification from "~/components/DatmonNotification.vue"
import DatemonTable from "~/components/DatmonTable.vue"
import StepRunResult from "~/components/StepRunResult.vue"

export default {
  components: {
    DatemonNotification,
    DatemonTable,
    StepRunResult,
  },

  async asyncData({ $axios, $monitorEndpoint, params }) {
    // Only run on the client
    if (process.server) {
      return { }
    }

    console.log(params.txId)
    const txId = params.txId
    const url = `${$monitorEndpoint}/transaction/${txId}`
    try {
      const txinfo = await $axios.$get(url)
      const steps = txinfo.steps
      // console.log(`steps=`, steps)

      const hierarchy = formHierarchy(steps)
      return { txId, txinfo, steps, hierarchy, loading: false }
    } catch (e) {
      console.log(`url=`, url)
      console.log(`e=`, e)
      console.log(`e.response=`, e.response)
      return { loading: false, loadError: e.toString() }
    }
  }, //- asyncData

  data: function () {
    return {
      loading: true,
      loadError: null,

      txId: '',
      txinfo: null,
      steps: [ ],
      hierarchy: [ ],
      currentStepId: '',
      stepDetails: null,

      logEntriesColumns: [
        // {
        //   field: 'created',
        //   label: 'Timestamp',
        //   // width: '500',
        //   // numeric: true
        // },
        {
          field: 'level',
          label: 'Type',
          // width: '500',
          // numeric: true
        },
        {
          field: 'source',
          label: 'Source',
          // width: '500',
          // numeric: true
        },
        {
          field: 'message',
          label: 'Message',
          // width: '500',
          // numeric: true
        },
      ],

      columns: [//ZZZZZ Is this used?
        {
          field: 'fullSequence',
          label: 'Sequence',
          // width: '500',
          // numeric: true
        },
        {
          field: 'note',
          label: 'Note',
          cellClass: "my-bold-cell",
          // cellClass: "is-primary",
        },
        // {
        //     field: 'description',
        //     label: 'Description',
        // },
        {
          field: 'status',
          label: 'Status',
        },
        {
          field: 'stepType',
          label: 'Step type',
        },
        {
          field: 'stepId',
          label: 'Step',
        },
        // {
        //     field: 'startTime',
        //     label: 'Start time',
        // },
      ]
    }
  }, //- data

  computed: {
    isPipeline: function () {
      return (typeof(this.stepDetails.stepDefinition) === 'string')
    },

    stepInputJSON: function() {
      try {
        return JSON.stringify(this.stepDetails.stepInput, '', 2)
      } catch (e) {
        return this.stepDetails.stepInput
      }
    },

    stepOutputJSON: function() {
      try {
        return JSON.stringify(this.stepDetails.stepOutput, '', 2)
      } catch (e) {
        return this.stepDetails.stepOutput
      }
    },

    stepDefinitionJSON: function() {
      try {
        return JSON.stringify(this.stepDetails.stepDefinition, '', 2)
      } catch (e) {
        return this.stepDetails.stepDefinition
      }
    },

    stepDetailsJSON: function() {
      try {
        return JSON.stringify(this.stepDetails, '', 2)
      } catch (e) {
        return this.stepDetails
      }
    },

    logEntries: function() {
      return this.stepDetails.logs
    }
  },



  methods: {
    backToTransactions: function() {
      switch (this.txinfo.status) {
        case 'queued':
        case 'running':
          this.$router.push({ path: `/mondat/running` })
          break
        case 'success':
          this.$router.push({ path: `/mondat/complete` })
          break
        case 'failed':
        case 'aborted':
        case 'timeout':
        case 'internal-error':
          this.$router.push({ path: `/mondat/failures` })
          break
        case 'sleeping':
          this.$router.push({ path: `/mondat/sleeping` })
          break
        default:
      }
    },

    reloadDetails: async function() {
      // Same loading as asyncData
      this.loading = true
      const url = `${this.$monitorEndpoint}/transaction/${this.txId}`
      try {
        this.txinfo = await this.$axios.$get(url)
        // console.log(`txinfo=`, this.txinfo)
        this.steps = this.txinfo.steps
        this.hierarchy = formHierarchy(this.steps)
      } catch (e) {
        console.log(`url=`, url)
        console.log(`e.response=`, e.response)
        this.loadError = e.toString()
      }
      this.loading = false
    },//- reloadDetails

    showDetails: async function(stepId) {
      if (!stepId) {
        alert('Unknown stepId in showDetails() parent')
        return
      }
      console.log(`showDetails in parent`, stepId)
      this.stepDetails = `Loaded details for step ${stepId}`
      // console.log(`stepId=`, stepId)

      // Get the details from the server
      for (const step of this.steps) {
        // console.log(`step=`, step)
        if (step.stepId === stepId) {
          console.log(`found the step`)
          this.stepDetails = step
          this.currentStepId = stepId
          break
        }
      }

      // const url = `${this.$monitorEndpoint}/stepInstance/${stepId}`
      // try {
      //   this.stepDetails = await this.$axios.$get(url)
      //   this.currentStepId = stepId
      // } catch (e) {
      //   console.log(`url=`, url)
      //   console.log(`e.response=`, e.response)
      //   alert(`Could not load step details:`, e)
      // }
    },

    showTransactionDetails: async function() {
      this.stepDetails = null
      this.currentStepId = ''
    }
  }//- methods
}

function formHierarchy(steps) {
  // console.log(`formHierarchy()`)
  const index = { } // fullSequence => entry
  const level0 = [ ]
  for (const step of steps) {
    // If fullSequence is a.b.c, assumes a.b is already in the index
    const fs = step.fullSequence ? step.fullSequence : '1'
    // console.log(`step=`, step)
    // console.log(`step.fullSequence=`, step.fullSequence)

    const pos = fs.lastIndexOf('.')
    if (pos < 0) {
      // first item
      const item = {
        name: fs,
        path: fs,
        step: step,
        children: [ ]
      }
      level0.push(item)
      index[fs] = item
    } else {
      // Not in level 0
      const prefix = fs.substring(0, pos)
      const suffix = fs.substring(pos + 1)
      const parent = index[prefix]
      const item = {
        name: suffix,
        path: fs,
        step: step,
        children: [ ]
      }
      parent.children.push(item)
      index[fs] = item
    }
  } //- for
  return level0
} //- formHierarchy

</script>

<style lang="scss">
@import "@/assets/scss/main.scss";

.my-steps-page {
  .my-table-row {
    cursor: pointer;
  }
  .my-bold-cell span {
    font-weight: 600;
  }
}
</style>
