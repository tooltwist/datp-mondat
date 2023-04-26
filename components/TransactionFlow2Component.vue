/* Copyright Tooltwist Innovations Limited - All Rights Reserved
 * This file is part of DATP and as such is proprietary and confidential software.
 * Unauthorized copying of this file, via any medium is strictly prohibited. All
 * rights reserved. No warranty, explicit or implicit, provided. In no event shall
 * the author or owner be liable for any claim or damages.
 */
<template lang="pug">
.my-transactionFlow
  template(v-if="txDetails && txDetails.state")
    section
      table
        template(v-for="(f, f2i) in txDetails.state.f2")
          tr

          // Display columns before this
          template(v-for="(n,index) in columnForF2(f)")
            td.my-nodeGroup-column

          // Display this
          td.my-nodeGroup-column(:class="{ 'my-selected-f2':isSelected(f2i), 'my-sibling-f2':isSibling(f2i)  }")
            div(v-if="f2Type(f) === 'TX_START'")
              div(:class="flowClass(f2i)", @click="selectFlow(f2i)")
                .f2-tx
                  | tx
                  b &nbsp;{{ f.__transactionType }}
                b-icon.my-icon(:icon="flowIcon(f2i)", size="is-small")
                | &nbsp;
                .f2-index {{f2i}}
            div(v-else-if="f2Type(f) === 'TX_CALLBACK'", :class="indentForF2Level(f)")
              div(:class="flowClass(f2i)", @click="selectFlow(f2i)")
                .f2-tx
                  | {{f2Callback(f)}}()
                b-icon.my-icon(:icon="flowIcon(f2i)", size="is-small")
                | &nbsp;
                .f2-index {{f2i}}
            div(v-else-if="f2Type(f) === 'PIPELINE_START'", :class="indentForF2Level(f)")
              div(:class="flowClass(f2i)", @click="selectFlow(f2i)")
                .f2-pipeline-start
                  | pipeline
                  b &nbsp;{{f.__pipeline}}
                b-icon.my-icon(:icon="flowIcon(f2i)", size="is-small")
                | &nbsp;
                template(v-if="f.nodeGroup")
                  br
                  | ({{f.nodeGroup}})
                .f2-index {{f2i}}
            div(v-else-if="f2Type(f) === 'PIPELINE_CALLBACK'", :class="indentForF2Level(f)")
              div(:class="flowClass(f2i)", @click="selectFlow(f2i)")
                .f2-callback
                  | {{f2Callback(f)}}()
                b-icon.my-icon(:icon="flowIcon(f2i)", size="is-small")
                | &nbsp;
                //- template(v-if="f.nodeGroup")
                    br
                    | ({{f.nodeGroup}})
                .f2-index {{f2i}}
            div(v-else-if="f2Type(f) === 'STEP'", :class="indentForF2Level(f)")
              div(:class="flowClass(f2i)", @click="selectFlow(f2i)")
                .f2-step
                  | {{stepTypeDescription(f)}}
                b-icon.my-icon(:icon="flowIcon(f2i)", size="is-small")
                | &nbsp;
                .f2-index {{f2i}}

          // Display columns to the right
          template(v-for="n in remainingColumnsForF2(f)")
            td.my-nodeGroup-column
      br
      .columns 
        .column
          //- | {{selectedF2i}}, {{siblingF2i}}
          b-field(:label="(selectedF2i>=0) ? `Flow    (#${selectedF2i})` : `Flow`")
            b-input.my-state-json(type="textarea", rows="20", v-model="selectedFlowJSON", disabled)
          .my-flowMsg {{flowMsg}}
        .column
          b-field(:label="stepJSONIsForSibling ? `Definition of related step` : `Step definition`")
            b-input.my-state-json(type="textarea", rows="20", v-model="selectedStepJSON", disabled, :class="{'my-sibling-step': stepJSONIsForSibling}")
  template(v-else)
    | Transaction not found
</template>

<script>

export default {
  props: {
    txId: String,
    txDetails: Object,
    refreshCounter: Number,
  },

  data: function () {
    return {
      loading: false,
      loadError: null,

      transaction: null,
      selectedF2i: -1,
      siblingF2i: -1,
      selectedFlowJSON: '',
      selectedStepJSON: '',
      stepJSONIsForSibling: false,
      flowMsg: '',

      stepSelectedStyle: "fill: rgb(72, 95, 199);stroke-width:1;stroke:rgb(0,0,0)",
      stepNotSelectedStyle: "fill:rgb(200,200,200);stroke-width:1;stroke:rgb(0,0,0)",
      stepSelectedTextStyle: "fill:#fff",
      stepNotSelectedTextStyle: "fill:#666",
    }
  }, //- data

  computed: {
    maxLevel: function () {
      let max = 0
      for (const f of this.txDetails.state.f2) {
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

    indentForF2Level(f2) {
      const level = this.f2Level(f2)
      if (level === 0) {
        return { }
      }
      // return ((level + 1) % 2) ? {'f2-step':true} : {'f2-pipeline':true}
      return ((level + 1) % 2) ? {'f2-indent':true} : { }
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
      // console.log(`------\nf2Level()`, f2)
      // console.log(`this.txDetails.state.f2=`, this.txDetails.state.f2)

      let level = 0
      const state = this.txDetails.state
      for ( ; ; ) {
        // console.log(`f2=`, f2)
        if (typeof(f2.__sibling) !== 'undefined') {
          // The parent will be in the sibling
          // console.log(`- get sibling ${f2.__sibling}`)
          f2 = state.f2[f2.__sibling]
        } else if (typeof(f2.__parent) !== 'undefined') {
          // Check out the parent
          if (f2.__parent < 0) {
            // At the root
            // console.log(`level=`, level)
            return level
          } else {
            // Up a level to the parent
            // console.log(`- jump to parent ${f2.__parent}`)
            level++
            f2 = state.f2[f2.__parent]
          }
        } else {
          // Should not happen
          alert('Internal error 277362551 - No sibling or parent in f2')
        }
      }
    },

    f2StepId(f2) {
      if (typeof(f2.__stepId) !== 'undefined') {
        return f2.__stepId
      } else {
        return f2.stepId
      }
    },

    f2Description(f2) {
      if (typeof(f2.__description) !== 'undefined') {
        return f2.__description
      } else {
        return f2.description
      }
    },

    f2Sibling(f2) {
      if (typeof(f2.__sibling) !== 'undefined') {
        return f2.__sibling
      }
      if (typeof(f2.s) !== 'undefined') {
        return f2.s
      }
      return -1      
    },

    f2Callback(f2) {
      if (typeof(f2.__callback) !== 'undefined') {
        return f2.__callback
      } else {
        return f2.callback
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
      const stepId = this.f2StepId(flow)
      if (stepId) {
        // console.log(`stepId=`, stepId)
        // console.log(`this.txDetails.state.steps=`, this.txDetails.state.steps)
        // return flow.description
        // console.log(`this.txDetails.state.steps=`, this.txDetails.state.steps)
        const stepId = this.f2StepId(flow)
        const step = this.txDetails.state.steps[stepId]
        if (step.stepDefinition && step.stepDefinition.stepType) {
          return step.stepDefinition.stepType
        }
        // return step
      }
      return ''
    },

    selectFlow(f2i) {
      // Show the selected flow
      const flow = this.txDetails.state.f2[f2i]
      if (this.selectedF2i === f2i) {
        this.selectedF2i = -1
        this.siblingF2i = -1
        return
      }
      this.selectedF2i = f2i
      this.siblingF2i = this.f2Sibling(flow)
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
      const stepId = this.f2StepId(flow)
      if (stepId) {
        const step = this.txDetails.state.steps[stepId]
        if (step) {
          this.selectedStepJSON = JSON.stringify(step, '', 2)
          this.stepJSONIsForSibling = false
          return
        }
      } else if (this.siblingF2i >= 0) {
        // Show the step definition of the sibling (the step this callback refers to).
        const siblingFlow = this.txDetails.state.f2[this.siblingF2i]
        const siblingStepId = this.f2StepId(siblingFlow)
        if (siblingStepId) {
          const siblingStep = this.txDetails.state.steps[siblingStepId]
          if (siblingStep) {
            this.selectedStepJSON = JSON.stringify(siblingStep, '', 2)
            this.stepJSONIsForSibling = true
            return
          }
        }
      }
      this.selectedStepJSON = ''
    },

    flowIcon(f2i) {
      const f2 = this.txDetails.state.f2[f2i]
      // console.log(`f2=`, f2)
      if (f2.ts3) {
        // Finished
        return 'check'
      } else if (f2.ts2) {
        // Started
        return 'run'
      } else {
        // Not started
        return ''
        // return 'timer-sand'
      }
    },

    flowClass(f2i) {
      const f2 = this.txDetails.state.f2[f2i]
      // console.log(`f2=`, f2)
      if (f2.ts3) {
        return 'done'
      } else if (f2.ts2) {
        return 'running'
      } else {
        return 'waiting'
      }
    },

    isSelected(f2i) {
      return (f2i === this.selectedF2i)
    },

    isSibling(f2i) {
      return (f2i === this.siblingF2i)
    },

  }//- methods
}
</script>

<style lang="scss">
@import "@/assets/scss/main.scss";

.my-transactionFlow {
  // $heading-font-family: Arial, Helvetica, sans-serif;
  $heading-font-family: Verdana, Geneva, Tahoma, sans-serif;

  $heading-color: white;
  $heading-font-size: 0.8em;
  $heading-font-weight: 500;

  $waiting-color: #999;
  $waiting-background: #222;
  $running-color: #c0c0c0;
  $running-background: #333;
  $done-color: green;
  $done-background: #d0d0d0;

  .my-state-json textarea {
    font-size: 0.95em;
    line-height: 111%;
  }

  .my-nodeGroup-column {
    padding-left: 25px;
  }


  .waiting {
    .f2-tx, .f2-pipeline-start, .f2-callback {
      color: $waiting-color;
      background-color: $waiting-background;
      border: dashed 1px $waiting-color;
    }
    .f2-step {
      color: $waiting-color;
      background-color: rgb(200,200,200);
    }
  }
  .running {
    .f2-tx, .f2-pipeline-start, .f2-callback {
      color: $running-color;
      background-color: $running-background;
      border: solid 1px $running-color;
    }
    .f2-step {
      color: white;
      background-color: rgb(72, 95, 199);
    }
  }
  .done {
    .f2-tx, .f2-pipeline-start, .f2-callback {
      color: $done-color;
      background-color: $done-background;
    }
    .f2-step {
      color: white;
      background-color: rgb(72, 95, 199);
      background-color: green;
    }
  }



  .f2-tx {
    display: inline-block;
    font-family: $heading-font-family;
    font-size: $heading-font-size;
    font-weight: $heading-font-weight;
    // color: $heading-color;
    padding: 2px;
    padding-left: 12px;
    padding-right: 12px;
    text-align: center;
    // border: solid 1px #485fc7;
    cursor: pointer;
    margin-right: 5px;

    // frame
    border: solid 1px #666;
    border-radius: 5px;
  }

  .f2-index {
    display: inline-block;
    position: relative;
    top: 3px;
    padding-left: 5px;
    color: #999;
    font-size: 0.7em;
  }


  .f2-pipeline-start {
    display: inline-block;
    font-family: $heading-font-family;
    font-size: $heading-font-size;
    font-weight: $heading-font-weight;
    // color: $heading-color;
    // color: blue;
    // background-color: #a20f2c;
    text-align: center;
    padding: 1px;
    padding-left: 10px;
    padding-right: 5px;
    // border-top: solid 1px #aaa;
    // border-left: solid 1px #aaa;
    // border-bottom: solid 1px #333;
    // border-right: solid 1px #333;
    cursor: pointer;

    // frame
    border: solid 1px #666;
    border-radius: 5px;

    // &.waiting {
    //   color: $waiting-color;
    //   background-color: $waiting-background;
    //   border: solid 1px $waiting-color;
    // }
    // &.running {
    //   color: $running-color;
    //   background-color: $running-background;
    //   border: solid 1px $running-color;
    // }
    // &.done {
    //   color: red;
    // }
  }

  .f2-callback {
    display: inline-block;
    font-family: $heading-font-family;
    font-size: $heading-font-size;
    font-weight: $heading-font-weight;
    color: $heading-color;
    padding: 2px;
    padding-left: 5px;
    padding-right: 5px;
    margin-top: 5px;
    text-align: center;
    // border: solid 1px #666;
    cursor: pointer;

    // frame
    border: solid 1px #666;
    border-radius: 5px;


    // &.waiting {
    //   color: $waiting-color;
    //   background-color: $waiting-background;
    //   border: dashed 1px $waiting-color;
    // }
    // &.running {
    //   color: $running-color;
    //   background-color: $running-background;
    //   border: solid 1px $running-color;
    // }
    // &.done {
    //   color: red;
    // }
  }

  .f2-step {
    display: inline-block;
    font-size: 1.0em;
    // font-weight: $heading-font-weight;
    font-family: Verdana, Geneva, Tahoma, sans-serif;
    color: white;
    // background-color: #485fc7;
    background-color: #666;
    padding: 5px;
    padding-left: 10px;
    padding-right: 10px;
    margin-top: 5px;
    text-align: center;
    // border: solid 1px #485fc7;
    // border-top: solid 1px #aaa;
    // border-left: solid 1px #aaa;
    // border-bottom: solid 1px #333;
    // border-right: solid 1px #333;
    cursor: pointer;

    border-radius: 5px;
    font-size: 0.75em;
    color: black;

    // &.waiting {
    //   color: $waiting-color;
    //   background-color: rgb(200,200,200);
    // }
    // &.running {
    //   color: white;
    //   background-color: rgb(72, 95, 199);
    // }
    // &.done {
    //   color: red;
    //   background-color: rgb(200,200,200);
    // }
    // "fill:rgb(200,200,200);stroke-width:1;stroke:rgb(0,0,0)"
  }

  .f2-indent {
    margin-left: 20px;
  }

  .my-flowMsg {
    color: #485fc7;
  }

  .my-selected-f2 div div {
    // border: solid 2px magenta;
    // background-color: magenta;

    .f2-pipeline-start, .f2-pipeline, .f2-step, .f2-tx, .f2-callback {
      // background-color: magenta;
      background-color: #f14668;
      // background-color: white;
      color: black;
    }

    &.f2-index {
      border: none;
    }
  }

  .my-sibling-f2 div div {
    // border: solid 1px magenta;

    &.f2-pipeline-start, &.f2-step, &.f2-tx {
      // border: dashed 1px #f14668;
      border: solid 1px #f14668;
      // background-color: magenta;
      color: red;
      // font-weight: 550;
    }

    &.f2-index {
      border: none;
    }
  }

  .my-sibling-step .textarea {
    color: #f14668 !important;
  }

  // &.waiting {
  //   color: $waiting-color;
  //   background-color: rgb(200,200,200);
  // }
  // &.running {
  //   color: white;
  //   background-color: rgb(72, 95, 199);
  // }
  .done {
    .my-icon {
      color: lightgreen;
    }
  }

  .my-icon {
    color: white;
    margin-left: 4px;
    &.done {
      color: green;
    }
  }
}
</style>
