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
        | Pipeline Assembly

      .columns
        .column.is-6
          .my-backdrop
            .my-pipeline-header {{pipelineName}}
            draggable(v-model="steps", :group="{ name: 'myList' }")
              transition-group
                div(v-for="step in steps", :key="step.id")
                  //- | {{step}}
                  StepBox(:step="step", @changed="onStepDefinitionChange", @deleted="onStepDelete")
          //- hr
          //- | {{steps}}
          //- hr
          //- | {{description}}
        .column.is-1
        .column.is-5
          .my-backdrop
            .my-pipeline-header-2 Available step types (drag)
            //- | {{stepTypes}}
            //- hr
            draggable(v-model="stepTypes", :sort="false", :group="{ name: 'myList', put: false, pull: 'clone' }", :clone="stepFromStepType")
              transition-group
                div(v-for="st in stepTypes", :key="st.id")
                  StepTypeBox(:stepType="st", :editing="true")
                  //- el-collapse(:v-model="true")
                    el-collapse-item
                      | here is
                      br
                      | more stuff



            //- | {{ stepTypes }}

          //- hr
          //- | dirty = {{dirty}}
          //- br

      //- h2.title.is-3.has-text-grey
        //- | Steps&nbsp;&nbsp;
        | Pipeline definition: '{{pipelineName}}'
      //- .pipeline-section
        StepBox(:definition="definition")
</template>

<script>
import StepBox from '~/components/StepBox.vue'
import StepTypeBox from '~/components/StepTypeBox.vue'
import draggable from "vuedraggable";

export default {
  components: {
    StepBox,
    StepTypeBox,
    draggable,
  },
  data: function () {
    return {
      pipelineName: '',
      description: '',
      // definition: { },
      steps: [ ],
      stepTypes: [ ],

      myArray: [
        { id: 0, name: 'this' },
        { id: 1, name: 'is' },
        { id: 2, name: 'pretty' },
        { id: 3, name: 'cool' },
      ],

      node: { },
      nextId: 0,
      dirty: false, // needs to be updated
    }
  },
  async asyncData({ $axios, $daptEndpoint, params }) {
    // console.log(`asyncData()`, params)
    // console.log(params.pipelineName);
    const pipelineName = params.pipelineName


    // A bit lazy here, we'll select all nodes...
    const url1 = `${$daptEndpoint}/nodes`
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
    const stepTypes = node.stepTypes



    // Get details of the specific pipeline
    const url = `${$daptEndpoint}/pipeline/${pipelineName}/definition`
    // console.log(`url=`, url)
    const definition = await $axios.$get(url)
    // const definition = await $axios.$get(`http://localhost:8080/pipeline/${pipelineName}/description`)
    // console.log(`definition=`, definition)

    // const url2 = `${$daptEndpoint}/pipeline/${pipelineName}/stepTypes`
    // console.log(`url2=`, url2)
    // const stepTypes = await $axios.$get(url2)

    // Add IDs so it can be draggable
    const description = definition.description
    const steps = definition.steps
    let nextId = resequence(steps)
    // console.log(`HMMO steps=`, definition.steps)
    let typeId = 100000
    for (const st of stepTypes) {
      st.id = typeId++
    }

    return { pipelineName, description, node, steps, stepTypes, nextId }
  },
  methods: {
    backToPipelines: function() {
      this.$router.push({ path: `/pipelines` })
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

      const url = `${this.$daptEndpoint}/pipeline/draft`
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