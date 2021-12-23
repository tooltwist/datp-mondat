/* Copyright Tooltwist Innovations Limited - All Rights Reserved
 * This file is part of DATP and as such is proprietary and confidential software.
 * Unauthorized copying of this file, via any medium is strictly prohibited. All
 * rights reserved. No warranty, explicit or implicit, provided. In no event shall
 * the author or owner be liable for any claim or damages.
 */
<template lang="pug">
  .my-stepRunResult
    //- table.my-table(:class="`colors${level % 2}`", @click.stop="showMe")
    table.my-table(:class="myClass", @click.stop="showMe")
      tr
        td.my-top
          .is-size-6(v-if="step.step.stepType === 'hidden/pipeline'")
            | pipeline
          h2.title.is-size-6(v-else)
            | {{step.step.stepDefinition.stepType}}
      tr
        td.my-middle
          StepRunResult(v-for="rec in step.children", :step="rec", :key="rec.path", :level="level + 1", :currentStepId="currentStepId", @showDetails="showDetails")
      tr
        td.my-bottom
          .has-text-right.is-size-7
            p status:&nbsp;
              b {{step.step.status}}
            p
              b {{step.step.note}}
</template>

<script>
export default {
  props: {
    step: {
      type: Object,
      required: true
    },
    level: {
      type: Number,
      required: true
    },
    currentStepId: {
      type: String,
      required: true
    }
  },
  data: function () {
    return {
      id: '',
      definition: { },

      description: '',
      json: '',

      // open: false,
      errorMsg: '',

      originalId: '',
      originalStepType: '',
      originalDescription: '',
      originalJson: '',
    }
  },

  computed: {
    myClass() {
      let cls = `colors${this.level % 2}`
      console.log(`${this.step.step.stepId} VERSUS ${this.currentStepId}`)
      if (this.step.step.stepId === this.currentStepId) {
        cls += ' selected'
      }
      return cls
    }
  },

  methods: {
    showMe(step) {
      console.log(`showMe`)
      console.log(`step=`, this.step)
      const stepId = this.step.step.stepId
      console.log(`stepId=`, stepId)
      this.$emit('showDetails', stepId)
    },

    showDetails(stepId) {
      console.log(`showDetails() in child`)
      console.log(`stepId=`, stepId)
      // Pass it back up the component hierarchy
      this.$emit('showDetails', stepId)
    }

  }, //- methods

}
</script>

<style lang="scss" scoped>
.my-stepRunResult {

  .my-table {
    margin-top: 20px;
    margin-bottom: 20px;
    min-width: 300px;
  }

  .colors0 {
    // Pipeline
    background-color: #36334b;
    border: dashed 1px #909090;

    &.selected {
      background-color: darkcyan;
    }

    .my-top {
      padding: 20px;
      padding-bottom: 5px;
      color: white;
    }

    .my-middle {
      padding-top: 0px;
      padding-bottom: 0px;
      padding-left: 20px;
      padding-right: 20px;
    }

    .my-bottom {
      padding: 20px;
      padding-bottom: 5px;
    }
  }

  .colors1 {
    // Non-pipeline step
    background-color: #606060;
    border: solid 1px #f0f0f0;
    border-radius: 10px;
    cursor: pointer;

    &.selected {
      background-color: darkcyan;
    }

    &.my-top {
      padding: 5px;
      padding-bottom: 0px;
    }

    &.my-middle {
      padding-left: 50px;
      padding-right: 10px;
    }

    &.my-bottom {
      padding: 5px;
      padding-bottom: 0px;
    }
  }
}//- .my-stepRunResult
</style>
