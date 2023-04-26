/* Copyright Tooltwist Innovations Limited - All Rights Reserved
 * This file is part of DATP and as such is proprietary and confidential software.
 * Unauthorized copying of this file, via any medium is strictly prohibited. All
 * rights reserved. No warranty, explicit or implicit, provided. In no event shall
 * the author or owner be liable for any claim or damages.
 */
<template lang="pug">
.my-tx-details-page
    br
    | {{txinfo}}
    span(v-if="loading")
      | Loading...
    span(v-else-if="loadError")
      .notification.is-danger() {{loadError}}
    template(v-else)
      b-field(label="Legacy Transaction Details")
        b-input.my-details-json(type="textarea", rows="37", v-model="transactionJSON", disabled)

      //- br
      //- | {{txinfo}}

      //- .columns
        .column.is-4
          div(@click="showTransactionDetails")
            | Transaction type:&nbsp;&nbsp;&nbsp;
            b {{txinfo.transactionType}}
          StepRunResult(v-for="rec in hierarchy", :step="rec", :key="rec.path", :level="0", :currentStepId="currentStepId", @showDetails="showDetails")

        .column.is-1
        .column.is-7
          //- .column.is-8
          // Right hand column with details
          template(v-if="currentStepId === ''")

            // Show the transaction details
            .is-pulled-right
              b-button(size="is-small", @click="reloadDetails") reload
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
            .is-pulled-right
              b-button(size="is-small", @click="reloadDetails") reload
            b.is-size-6 Step {{stepDetails.stepId}}
            br

            b-tabs(:animated="false")

              b-tab-item(value="log", label="Log entries")
                // Log entries
                b-table.my-table.is-size-7(:data="logEntries")
                  b-table-column(v-slot="props", field="when", label="Time")
                    | {{props.row.when}}
                  b-table-column(v-slot="props", field="source", label="Src")
                    b-tooltip(:label="longDetails(props.row)", position="is-bottom")
                      div {{shortDetails(props.row)}}
                  b-table-column(v-slot="props", field="message", label="Message")
                    span.dateTimeMessage(v-if="props.row.message.startsWith('***')")
                      // Date
                      | &nbsp;&nbsp;Time: {{props.row.message.substring(3)}}&nbsp;&nbsp;
                    span(v-else)
                      // Message
                      | {{props.row.message}}


              b-tab-item(value="details", label="Details")
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
              b-tab-item(value="input", label="Input")
                b-field(label="Input")
                  b-input(type="textarea", v-model="stepInputJSON", rows="19", size="is-small", readonly, disabled)

              b-tab-item(value="output", label="output")
                b-field(label="Output")
                  b-input(type="textarea", v-model="stepOutputJSON", rows="19", size="is-small", readonly, disabled)

              b-tab-item(value="definition", label="Definition")
                // Step definition
                b-field(label="Step definition")
                  b-input(type="textarea", v-model="stepDefinitionJSON", rows="19", size="is-small", readonly, disabled)

              //- b-tab-item(value="log2", label="Log entries")
                // Log entries
                b-table.my-table.is-size-7(
                  :data="logEntries",
                  :columns="logEntriesColumns",
                  hoverable)
                //- | {{logEntries}}

              //- b-tab-item(value="artifacts", label="Artifacts")
                | Not available at this time

              //- b-tab-item(value="audit", label="Audit trail")
                | Not available at this time

              b-tab-item(value="stepData", label="StepData")
                b-input(type="textarea", v-model="stepDetailsJSON", rows="19", size="is-small", readonly, disabled)
</template>

<script>
import MondatNotification from "~/components/MondatNotification.vue"
import MondatTable from "~/components/MondatTable.vue"
import StepRunResult from "~/components/StepRunResult.vue"

export default {
  components: {
    MondatNotification,
    MondatTable,
    StepRunResult,
  },

  props: {
    txId: String,
  },

  async mounted() {
    // Only run on the client
    if (process.server) {
      return { }
    }

    // console.log(this.txId)
    const url = `${this.$monitorEndpoint}/transaction/${this.txId}`
    try {
      console.log(`yarp 1`)
      this.txinfo = await this.$axios.$get(url)
      console.log(`this.txinfo=`, this.txinfo)
console.log(`yarp 2`)
      this.transactionJSON = JSON.stringify(this.txinfo, '', 2)
      this.steps = this.txinfo.steps
      this.hierarchy = formHierarchy(this.steps)
      this.loading = false
    } catch (e) {
      if (e.response && e.response.status === 404) {
        this.txinfo = null
        this.transactionJSON = ''
      }
      console.log(`url=`, url)
      console.log(`e=`, e)
      console.log(`e.response=`, e.response)
      this.loading = false
      this.loadError = e.toString()
    }
  }, //- asyncData

  watch: {
    txId: async function () {
      // The txid changes on the test page, when a new test is run.
      // We need to load the details of the new transaction, but we
      // wait a short while so the log has something to show.
      setTimeout(async () => {
        await this.reloadDetails()
        await this.showTransactionDetails()
      }, 500)
    }
  },

  data: function () {
    return {
      loading: true,
      loadError: null,

      // txId: '',
      txinfo: null,
      transactionJSON: '',
      steps: [ ],
      hierarchy: [ ],
      currentStepId: '',
      stepDetails: null,
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

        // Create JSON without the embedded logs
        const logs = this.stepDetails.logs
        delete this.stepDetails.logs
        const json = JSON.stringify(this.stepDetails, '', 2)
        this.stepDetails.logs = logs
        return json
      } catch (e) {
        return this.stepDetails
      }
    },

    logEntries: function() {
      // Insert short times into the log entries
      const list = [ ]
      let previousMinute = '---'
      for (const entry of this.stepDetails.logs) {
        const dat = new Date(entry.created)
        const day = dat.toLocaleDateString('PST')

        const time = dat.toLocaleTimeString('PST') + `.${dat.getMilliseconds()}s`
        const minute = time.substring(0, 5)
        const seconds = time.substring(6)
        if (minute != previousMinute) {
          list.push({ when: '', level: '', surce: '', message: `***${day} ${minute}`})
          previousMinute = minute
        }
        entry.when = seconds
        list.push(entry)
      }
      return list
      // return this.stepDetails.logs
    }
  },

  methods: {
    reloadDetails: async function() {
      // Same loading as asyncData
      this.loading = true
      const url = `${this.$monitorEndpoint}/transaction/${this.txId}`
      try {
        console.log(`yarp 3`)
        this.txinfo = await this.$axios.$get(url)
        console.log(`yarp 4`)
        this.transactionJSON = JSON.stringify(this.txinfo, '', 2)
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
        alert('Null stepId in showDetails() parent')
        return
      }
      // console.log(`showDetails in parent`, stepId)
      this.stepDetails = `Loaded details for step ${stepId}`
      // console.log(`stepId=`, stepId)

      // Get the details from the server
      for (const step of this.steps) {
        // console.log(`step=`, step)
        if (step.stepId === stepId) {
          // console.log(`found the step`)
          this.stepDetails = step
          this.currentStepId = stepId
          break
        }
      }
    },

    showTransactionDetails: async function() {
      this.stepDetails = null
      this.currentStepId = ''
    },

    shortDetails: function (row) {
      if (row.source && row.level) {
        return `${row.source.substring(0, 1).toUpperCase()} ${row.level.substring(0, 1).toUpperCase()}`
      }
      return ''
    },

    longDetails: function (entry) {
      return `Source: ${entry.source}, Level: ${entry.level}`
    },
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

.my-tx-details-page {
  .my-table-row {
    cursor: pointer;
  }
  .my-bold-cell span {
    font-weight: 600;
  }
  .dateTimeMessage {
    margin-top: 3px;
    margin-bottom: 2px;
    padding: 2px;
    font-weight: 500;
    font-size: 14px;
    font-family: 'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', Arial, sans-serif;
    border-radius: 4px;
    background-color: #594cb2;
  }
  // .yarp {
  //   background-color: yellow;
  // }

  .my-details-json textarea {
    // color: #e0e0e0 !important;
    font-size: 0.95em;
    line-height: 111%;
  }
}
</style>
