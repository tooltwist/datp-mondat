<template lang="pug">
  .my-steps-page
    section.section
      .is-pulled-right
        b-button(type="is-warning", @click="savePipeline") Save
        | &nbsp;&nbsp;&nbsp;
        b-button(type="is-gray", @click="backToPipelines") Back
      h2.title.is-3
        .datemon-heading-icon
          b-icon(icon="bank-transfer", size="is-medium")
        | Pipeline '{{pipelineName}}'


      span(v-if="loading")
        | Loading...
      span(v-else-if="loadError")
        .notification.is-danger() {{loadError}}
      template(v-else)
        .columns
          .column.is-one-third
            .my-backdrop
              .my-pipeline-header {{pipelineName}}
              draggable(v-model="steps", :group="{ name: 'myList' }")
                transition-group
                  div(v-for="step in steps", :key="step.id")
                    StepBox(:step="step", @changed="onStepDefinitionChange", @deleted="onStepDelete")
          .column.is-one-quarter
          .column.is-one-third
            .my-backdrop
              .my-pipeline-header-2 Drag &amp; drop steps
              br
              b-field(horizontal, label="Filter", custom-class="is-small")
                b-input(name="subject", expanded, rounded, size="is-small", placeholder="search...", v-model="filter")
              draggable(v-model="filterdStepTypes", :sort="false", :group="{ name: 'myList', put: false, pull: 'clone' }", :clone="stepFromStepType")
                transition-group
                  div(v-for="st in filterdStepTypes", :key="st.id")
                    StepTypeBox(:stepType="st", :editing="true")
</template>

<script>
import draggable from "vuedraggable"
import StepBox from '~/components/StepBox.vue'
import StepTypeBox from '~/components/StepTypeBox.vue'

export default {
  components: {
    StepBox,
    StepTypeBox,
    draggable
  },

  data: function () {
    return {
      loading: true,
      loadError: null,

      pipelineName: '',
      description: '',
      // definition: { },
      steps: [ ],
      stepTypes: [ ],
      filter: '',

      // myArray: [
      //   { id: 0, name: 'this' },
      //   { id: 1, name: 'is' },
      //   { id: 2, name: 'pretty' },
      //   { id: 3, name: 'cool' },
      // ],

      node: { },
      nextId: 0,
      dirty: false, // needs to be updated
    }
  },

  async asyncData({ $axios, $monitorEndpoint, params }) {
    const pipelineName = params.pipelineName
    // A bit lazy here, we'll select all nodes...
    const url1 = `${$monitorEndpoint}/nodes`
    const url = `${$monitorEndpoint}/pipeline/${pipelineName}/definition`
    try {
      const nodes = await $axios.$get(url1)

      // Now find our node
      // const nodeId = params.nodeId
      const nodeName = 'master'
      let node = null
      // console.log(`nodeName=`, nodeName)
      for (const n of nodes) {
        // console.log(`n=`, n)
        if (n.name === nodeName) {
          // return { nodeId, node }
          node = n
          break
        }
      }
      // console.log(`node=`, node)
      const stepTypes = node.stepTypes.sort(compareStepTypes)

      // Get details of the specific pipeline
      // console.log(`url=`, url)
      const definition = await $axios.$get(url)

      // Add IDs so it can be draggable
      const description = definition.description
      const steps = definition.steps
      let nextId = resequence(steps)
      // console.log(`HMMO steps=`, definition.steps)
      let typeId = 100000
      for (const st of stepTypes) {
        st.id = typeId++
      }
      return { pipelineName, description, node, steps, stepTypes, nextId, loading: false }
    } catch (e) {
      console.log(`url1=`, url1)
      console.log(`url=`, url)
      console.log(`e.response=`, e.response)
      return { transactions: [ ], loading: false, loadError: e.toString() }
    }
  },

  computed: {
    filterdStepTypes: function() {
      //console.log(`filteredStepTypes()`)
      const words = this.filter.split(' ')
      const list = this.stepTypes.filter((stepType) => {
        const description = stepType.description.toUpperCase()
        const name = stepType.name.toUpperCase()
        for (let word of words) {
          const w2 = word.trim().toUpperCase()
          //console.log(`  -> ${w2}`)
          if (w2 && description.indexOf(w2) < 0 && name.indexOf(w2) < 0) {
            return false // no match
          }
        }
        return true
      })
      // console.log(`this.stepTypes=`, this.stepTypes)
      // list.sort((a, b) => {
      //   console.log(`${a.description} vs ${b.description}`)
      //   return a.description - b.description
      // })
      return list
    }
  },

  methods: {

    backToPipelines: function() {
      this.$router.push({ path: `/mondat/pipelines` })
    },

    savePipeline: async function () {
      // console.log(`savePipeline()`)

      this.nextId = resequence(this.steps)
      const definition = {
        stepType: 'pipeline',
        name: this.pipelineName,
        description: this.description,
        steps: this.steps,
      }

      const url = `${this.$monitorEndpoint}/pipeline/draft`
      // console.log(`url=`, url)
      const reply = await this.$axios.$post(url, definition)
      // console.log(`reply=`, reply)
    },

    // When dragging from the step type list to the steps list, we need to create a new step.
    stepFromStepType: function(stepType, arg2, arg3, arg4) {
      // console.log(`stepFromStepType(): stepType=`, stepType)

      // Return a step
      const rec = {
        id: this.nextId++,
        definition: stepType.defaultDefinition
      }
      rec.definition.stepType = stepType.name
      return rec
    },//- stepFromStepType

    onStepDefinitionChange({ id, definition }) {
      // console.log(`onStepDefinitionChange()`)
      // console.log(`id=`, id)
      // console.log(`definition=`, definition)

      for (const step of this.steps) {
        if (step.id === id) {
          // console.log(`found step`, step)
          step.definition = definition
          this.dirty = true
          return
        }
      }
      console.log(`Internal error 2726551 - upknown step has been edited (${id})`)

    },//- onStepDefinitionChange

    onStepDelete({ id }) {
      // console.log(`onStepDelete(${id})`)

      const before = JSON.stringify(this.steps, '', 2)
      // console.log(`before = ${before}`)

      for (let i = 0; i < this.steps.length; i++) {
        const step = this.steps[i]
      // for (const step of this.definition.steps) {
        if (step.id === id) {
          // console.log(`found step at ${i}`, step)
          this.$delete(this.steps, i)
          // console.log(`this.steps=`, this.steps)
          this.dirty = true
          break
        }
      }
      const after = JSON.stringify(this.steps, '', 2)
      // console.log(`after = ${after}`)
      // this.nextId = resequence(this.steps)
    },//- onStepDelete
  }
}

function compareStepTypes(stepType1, stepType2) {
  const a = stepType1.description.toUpperCase()
  const b = stepType2.description.toUpperCase()
  if (a < b) return -1
  if (a > b) return +1
  return 0
}

function resequence(steps) {
  let nextId = 0
  for (const step of steps) {
    step.id = nextId++
  }
  return nextId
}
</script>

<style lang="scss">
.my-steps-page {
  .pipeline-section {
    padding-left: 80px;
  }

  .my-table-row {
    cursor: pointer;
  }
  .my-bold-cell span {
    font-weight: 600;
  }

  .my-backdrop {
    // background-color: white;
    color: #999;
    height: 400px;
    padding: 20px;
  }

  .my-pipeline-header {
    font-size: 20px;
    color: white;
    text-align: center;
    width: 460px;
  }
  .my-pipeline-header-2 {
    font-size: 20px;
    color: white;
    text-align: left;
    width: 300px;
  }
}
</style>