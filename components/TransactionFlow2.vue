/* Copyright Tooltwist Innovations Limited - All Rights Reserved
 * This file is part of DATP and as such is proprietary and confidential software.
 * Unauthorized copying of this file, via any medium is strictly prohibited. All
 * rights reserved. No warranty, explicit or implicit, provided. In no event shall
 * the author or owner be liable for any claim or damages.
 */
<template lang="pug">
.my-transactionFlow
  span(v-if="loading")
    | Loading...
  span(v-else-if="loadError")
    .notification.is-danger() {{loadError}}
  template(v-else)
    section
      table
      template(v-for="(f, f2i) in transaction.f2")
        tr

        // Display columns before this
        template(v-for="(n,index) in columnForF2(f)")
          td.my-nodeGroup-column

        // Display this
        td.my-nodeGroup-column(:class="{ 'my-selected-f2' : isSelected(f2i) }")
          div(v-if="f2Type(f) === 'TX_START'")
            .f2-tx(@click="selectFlow(f2i)")
              b Start TX
            .f2-index {{f2i}}
          div(v-else-if="f2Type(f) === 'TX_CALLBACK'")
            .f2-tx(@click="selectFlow(f2i)")
              | {{f.callback}}
            .f2-index {{f2i}}
          div(v-else-if="f2Type(f) === 'PIPELINE_START'")
            .f2-pipeline-start(@click="selectFlow(f2i)")
              | Pipeline {{f._pipelineName}}
              template(v-if="f.nodeGroup")
                br
                | ({{f.nodeGroup}})
            .f2-index {{f2i}}
          div(v-else-if="f2Type(f) === 'PIPELINE_CALLBACK'")
            .f2-pipeline(@click="selectFlow(f2i)")
              | {{f.callback}}
              //- template(v-if="f.nodeGroup")
                br
                | ({{f.nodeGroup}})
            .f2-index {{f2i}}
          div(v-else-if="f2Type(f) === 'STEP'")
            .f2-step(@click="selectFlow(f2i)")
              | {{stepTypeDescription(f)}}
            .f2-index {{f2i}}

        // Display columns to the right
        template(v-for="n in remainingColumnsForF2(f)")
          td.my-nodeGroup-column
      br
      .columns 
        .column
          b-field(label="Flow")
            b-input.my-state-json(type="textarea", rows="20", v-model="selectedFlowJSON", disabled)
          .my-flowMsg {{flowMsg}}
        .column
          b-field(label="Step")
            b-input.my-state-json(type="textarea", rows="20", v-model="selectedStepJSON", disabled)

</template>

<script>
import { FLOWTYPE_TYPES } from '@babel/types'


export default {
  components: {
  },

  props: {
    txId: String,
  },

  async mounted() {
    // Only run on the client
    if (process.server) {
      return { }
    }
    this.reloadDetails()
  }, //- asyncData

  watch: {
    txId: async function () {
      // The txid changes on the test page, when a new test is run.
      // We need to load the details of the new transaction, but we
      // wait a short while so the log has something to show.
      setTimeout(async () => {
        await this.reloadDetails()
        // await this.showTransactionDetails()
      }, 500)
    }
  },

  data: function () {
    return {
      loading: true,
      loadError: null,

      transaction: null,
      selectedFlowIndex: -1,
      selectedFlowJSON: '',
      selectedStepJSON: '',
      flowMsg: '',
    }
  }, //- data

  computed: {
    maxLevel: function () {
      console.log(`maxLevel`)
      let max = 0
      for (const f of this.transaction.f2) {
        // console.log(`f=`, f)
        max = Math.max(max, this.f2Level(f))
      }
      return max
    },

    numColumns: function () {
      return Math.floor((this.maxLevel + 2) / 2)
    }
  },

  methods: {
    reloadDetails: async function() {
      // Same loading as asyncData
      this.loading = true
      const url = `${this.$monitorEndpoint}/transaction/${this.txId}/state`
      console.log(`reloadDetails(): url=${url}`)
      try {
        const reply = await this.$axios.$get(url)
        delete reply._status
        delete reply._statusText
        console.log(`reply=`, reply)
        this.transaction = reply
        // this.transactionStateJSON = JSON.stringify(this.transaction, '', 2)
        // console.log(`txinfo=`, this.txinfo)
        // this.steps = this.txinfo.steps
        // this.hierarchy = formHierarchy(this.steps)
      } catch (e) {
        console.log(`url=`, url)
        console.log(`e.response=`, e.response)
        this.loadError = e.toString()
      }
      this.loading = false
    },//- reloadDetails

    // The levels in f2 are unusual...
    // 0 = transaction
    // 1,2 = first pipeline and it's steps
    // 3,4 = next pipeline and it's steps, etc
    // We place these in columns, and position within the column according to odd or even.
    columnForF2(f2) {
      const level = this.f2Level(f2)
      if (level === 0) {
        // The transaction
        return 0
      }
      // return level
      return Math.floor((level + 1) / 2)
    },

    remainingColumnsForF2(f2) {
      return this.numColumns - this.columnForF2(f2)
    },

    classForF2Level(level) {
      if (level === 0) {
        return { 'f2-tx': true }
      }
      return ((level + 1) % 2) ? {'f2-step':true} : {'f2-pipeline':true}
    },

    forPipeline(level) {
      if (level === 0) {
        return false
      }
      return ((level + 1) % 2) ? false : true
    },

    f2Type(f2) {
      if (typeof(f2.__type) !== 'undefined') {
        return f2.__type
      } else {
        return f2.t
      }
    },

    f2Level(f2) {
      if (typeof(f2.__level) !== 'undefined') {
        return f2.__level
      } else {
        return f2.l
      }
    },

    isPlumbing(f2) {
      switch (this.f2Type(f2)) {
        case 'TX_START':
        // case 'TX_PIPELINE_COMPLETE':
        case 'TX_CALLBACK':
        case 'PIPELINE_START':
        // case 'PIPELINE_STEP_COMPLETE':
        case 'PIPELINE_CALLBACK':
          return true
      }
      return false
    },

    classForFlow(f2) {
      switch (this.f2Type(f2)) {
        case 'TX_START':
        // case 'TX_PIPELINE_COMPLETE':
        case 'TX_CALLBACK':
          return 'f2-tx'

        case 'PIPELINE_START':
          return 'f2-pipeline-start'

        // case 'PIPELINE_STEP_COMPLETE':
        case 'PIPELINE_CALLBACK':
          return 'f2-pipeline'

        case 'STEP':
          return 'f2-step'
      }
    },

    stepTypeDescription(flow) {
      if (flow.stepId) {
        // console.log(`flow.stepId=`, flow.stepId)
        // console.log(`this.transaction.steps=`, this.transaction.steps)
        // return flow.description
        // console.log(`this.transaction.steps=`, this.transaction.steps)
        const step = this.transaction.steps[flow.stepId]
        if (step.stepDefinition && step.stepDefinition.stepType) {
          return step.stepDefinition.stepType
        }
        // return step
      }
      return ''
    },

    selectFlow(index) {
      // Show the selected flow
      const flow = this.transaction.f2[index]
      if (this.selectedFlowIndex === index) {
        this.selectedFlowIndex = -1
        return
      }
      this.selectedFlowIndex = index
      this.selectedFlowJSON = JSON.stringify(flow, '', 2)
      let s = ''
      if (flow.ts1 !== undefined && flow.ts2 !== undefined) {
        s = `   queue: ${flow.ts2 - flow.ts1}ms`
      }
      if (flow.ts2 !== undefined && flow.ts3 !== undefined) {
        if (s) s += ', '
        s += `   run: ${flow.ts3 - flow.ts2}ms`
      }
      this.flowMsg = s

      // Show the step definition (if there is one for this flow)
      if (flow.stepId) {
        const step = this.transaction.steps[flow.stepId]
        if (step) {
          this.selectedStepJSON = JSON.stringify(step, '', 2)
          return
        }
      }
      this.selectedStepJSON = ''
    },

    isSelected(index) {
      return (index === this.selectedFlowIndex)
    },

  }//- methods
}
</script>

<style lang="scss">
@import "@/assets/scss/main.scss";
.my-transactionFlow {
  // color: pink;

  .my-state-json textarea {
    color: #e0e0e0 !important;
    font-size: 0.95em;
    line-height: 111%;
  }

  .my-nodeGroup-column {
    padding-left: 25px;
  }

  .f2-tx {
    display: inline-block;
    font-family: Arial, Helvetica, sans-serif;
    font-size: 1.0em;
    font-style: italic;
    padding: 6px;
    padding-left: 12px;
    padding-right: 12px;
    color: #ccc;
    text-align: center;
    border: solid 1px #485fc7;
    cursor: pointer;
  }

  .f2-index {
    display: inline-block;
    padding-left: 10px;
    color: #555;
    font-size: 0.8em;
  }


  .f2-pipeline-start {
    display: inline-block;
    font-size: 0.9em;
    color: white;
    background-color: #a20f2c;
    text-align: center;
    padding: 1px;
    border-top: solid 1px #aaa;
    border-left: solid 1px #aaa;
    border-bottom: solid 1px #333;
    border-right: solid 1px #333;
    cursor: pointer;
  }

  .f2-pipeline {
    display: inline-block;
    font-family: Arial, Helvetica, sans-serif;
    font-size: 1.0em;
    font-style: italic;
    color: #ccc;
    padding: 8px;
    text-align: center;
    border: solid 1px #485fc7;
    cursor: pointer;
  }

  .f2-step {
    display: inline-block;
    font-size: 1.1em;
    color: white;
    background-color: #485fc7;
    padding: 4px;
    margin-top: 1px;
    margin-bottom: 1px;
    margin-left: 10px;
    text-align: center;
    border: solid 1px #485fc7;
    border-top: solid 1px #aaa;
    border-left: solid 1px #aaa;
    border-bottom: solid 1px #333;
    border-right: solid 1px #333;
    cursor: pointer;
  }

  .my-flowMsg {
    color: #485fc7;
  }

  .my-selected-f2 div div {
    border: solid 1px magenta;
    // background-color: blue;

    &.f2-index {
      border: none;
    }
  }
}
</style>
