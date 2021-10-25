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
      b-button(type="is-success", @click="backToTransactions") Back
    h2.title.is-4.has-text-grey
      .datemon-heading-icon
        b-icon(icon="bank-transfer", size="is-medium")
      | Transaction {{txId}}
    br
    DatemonNotification
      p
        | The table below shows steps that have actually been run.
        | Steps that have not been initiated yet wil not be shown.
      p
        | Note that the steps shown here may not match up with the current pipeline definition
        | for the transaction type, if a new version of the pipeline is in use.

    span(v-if="loading")
      | Loading...
    span(v-else-if="loadError")
      .notification.is-danger() {{loadError}}
    template(v-else)
      .columns
        .column.is-5
          StepRunResult(v-for="rec in hierarchy", :step="rec", :key="rec.path", :level="0", :currentStepId="currentStepId", @showDetails="showDetails")
          //- | {{hierarchy}}
          //- pre
            | {{JSON.stringify(steps, '', 2)}}
        .column.is-1
        .column
          template(v-if="stepDetails")
            br
            h2.title.is-size-6 {{stepDetails.details.stepId}}
            b-tabs(:animated="false")
              b-tab-item(key="details", label="Details")
                table.table
                  tr
                    td Step Type:
                    td
                      b {{stepDetails.details.stepType}}
                  tr
                    td End Type:
                    td
                      b {{stepDetails.details.status}}
                  tr
                    td Start time:
                    td
                      | {{stepDetails.details.startTime}}
                  tr
                    td Completion time:
                    td
                      | {{stepDetails.details.completionTime}} - {{typeof(stepDetails.details.completionTime)}}
                  tr
                    td Progress:
                    td
                      | {{stepDetails.details.progress}}
              b-tab-item(key="data", label="Data")
                b-field(label="Result")
                  b-input(type="textarea", v-model="stepDetails.details.response", rows="25", zsize="is-small", readonly, disabled)
              b-tab-item(key="definition", label="Definition")
                b-field(label="Step definition")
                  b-input(type="textarea", v-model="stepDetails.details.definition", rows="25", zsize="is-small", readonly, disabled)
              b-tab-item(key="log", label="Log entries")
                | Not available at this time
              b-tab-item(key="artifacts", label="Artifacts")
                | Not available at this time

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
    console.log(params.txId);
    const txId = params.txId
    const url = `${$monitorEndpoint}/transaction/${txId}`
    try {
      const steps = await $axios.$get(url)

      const hierarchy = formHierarchy(steps)
      return { txId, steps, hierarchy, loading: false }
    } catch (e) {
      console.log(`url=`, url)
      console.log(`e.response=`, e.response)
      return { loading: false, loadError: e.toString() }
    }
  }, //- asyncData

  data: function () {
    return {
      loading: true,
      loadError: null,

      txId: '',
      steps: [ ],
      hierarchy: [ ],
      currentStepId: '',
      stepDetails: null,

      columns: [
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

  methods: {
    backToTransactions: function() {
      this.$router.push({ path: `/mondat/transactions` })
    },

    showDetails: async function(stepId) {
      // this.stepDetails = `Loaded details for step ${stepId}`
      // console.log(params.txId);
      // const txId = params.txId
      const url = `${this.$monitorEndpoint}/stepInstance/${stepId}`
      try {
        this.stepDetails = await this.$axios.$get(url)
        this.currentStepId = stepId
      } catch (e) {
        console.log(`url=`, url)
        console.log(`e.response=`, e.response)
        alert(`Could not load step details:`, e)
      }
    }
  }//- methods
}

function formHierarchy(steps) {
  // console.log(`formHierarchy()`)
  // const level0 = {
  //   record: null,
  //   arr: [ ], // record
  //   index: { } //
  // }

  // const level0 = [ ]
  const index = { } // fullSequence => entry
  const level0 = [ ]
  for (const step of steps) {
    // console.log(`step.fullSequence=`, step.fullSequence)
    // console.log(`   ${levels(step.fullSequence)} - ${endbit(step.fullSequence)}`)

    // If fullSequence is a.b.c, assumes a.b is already in the index
    const fs = step.fullSequence
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
  }//- for

  // console.log(`level0=`, level0)
  return level0
}

// class Item {
//   #id
//   #record
//   #children
//   constructor(id, record) {
//     this.#id = id
//     this.#record = record
//     this.#children = [ ]
//   }

//   find(id) {
//     for (const child of this.#children) {
//       if (child.id === id) {
//         return child
//       }
//     }
//     return null
//   }

//   add(item) {

//   }
// }

function endbit(sequence) {
  const pos = sequence.lastIndexOf('.')
  if (pos < 0) {
    return sequence
  }
  return sequence.substring(pos + 1)
}

function levels(sequence) {
  const arr = sequence.split('.')
  return arr.length
}
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
