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
        b-button(type="is-warning", @click="savePipeline") Save
        | &nbsp;&nbsp;&nbsp;
        b-button(type="is-gray", @click="backToPipelines") Back
      h2.title.is-4
        .datemon-heading-icon
          b-icon(icon="bank-transfer", size="is-small")
        | Pipeline '{{pipelineName}}'


      span(v-if="loading")
        | Loading...
      span(v-else-if="loadError")
        .notification.is-danger() {{loadError}}
      template(v-else)
        .columns
          .column.is-one-third
            .my-backdrop
              //- .my-pipeline-header {{pipelineName}}
              draggable(v-model="steps", :group="{ name: 'myList' }")
                transition-group
                  div(v-for="(step, index) in steps", :key="step.id")
                    StepBox(:step="step", :stepNo="index", @changed="onStepDefinitionChange", @deleted="onStepDelete", :open="stepOpen===index", @open="stepOpen = index")
          .column.is-one-quarter
          .column.is-one-third
            .my-backdrop
              .my-pipeline-header-2 Drag &amp; drop steps
              br
              b-field(horizontal, label="Filter", custom-class="is-small")
                b-input(name="subject", expanded, rounded, size="is-small", placeholder="search...", v-model="filter")
              //draggable(v-model="filterdStepTypes", :sort="false", :group="{ name: 'myList', put: false, pull: 'clone' }", :clone="stepFromStepType")
                transition-group
                  div(v-for="st in filterdStepTypes", :key="st.id")
                    StepTypeBox(:stepType="st", :editing="true")
              //- div(v-for="group in filteredStepTypeGroups")
                | {{group.group}}
                draggable(v-model="group.types", :sort="false", :group="{ name: 'myList', put: false, pull: 'clone' }", :clone="stepFromStepType")
                  transition-group
                    div(v-for="st in group.types", :key="st.id")
                      StepTypeBox(:stepType="st", :editing="true")
              b-collapse(animation="slide", v-for="(group, index) in filteredStepTypeGroups", :key="index", :open="stepTypeGroupOpen===index", @open="stepTypeGroupOpen = index")
                template(#trigger="props")
                  .my-group-name {{group.group}}
                draggable(v-model="group.types", :sort="false", :group="{ name: 'myList', put: false, pull: 'clone' }", :clone="stepFromStepType")
                  transition-group
                    div(v-for="st in group.types", :key="st.id")
                      StepTypeBox(:stepType="st", :editing="true")
            //- | {{filteredSteps}}
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
      for (const type of node.stepTypes) {
        type._group = 'miscellaneous'
        type._name = type.name
        const pos = type.name.indexOf('/')
        if (pos >= 0) {
          type._group = type.name.substring(0, pos)
          type._name = type.name.substring(pos + 1)
        }
      }
      const stepTypes = node.stepTypes.sort(compareStepTypes)

      // Get details of the specific pipeline
      // console.log(`url=`, url)
      const definition = await $axios.$get(url)

      // Add IDs so it can be draggable
      const description = definition.description
      const steps = definition.steps
      const nextId = resequence(steps)
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
      return { loading: false, loadError: e.toString() }
    }
  },

  data: function () {
    return {
      loading: true,
      loadError: null,

      stepOpen: -1,
      stepTypeGroupOpen: 0, // expanded step type group

      pipelineName: '',
      description: '',
      steps: [ ],
      stepTypes: [ ],
      groups: [ ],
      filter: '',

      node: { },
      nextId: 0,
      dirty: false, // needs to be updated
    }
  },

  computed: {
    filteredSteps: function () {
      //console.log(`filteredStepTypeGroups()`)
      const words = this.filter.split(' ')
      const list = this.stepTypes.filter((stepType) => {
        const description = stepType.description.toUpperCase()
        const name = stepType.name.toUpperCase()
        for (const word of words) {
          const w2 = word.trim().toUpperCase()
          //console.log(`  -> ${w2}`)
          if (w2 && !description.includes(w2) && !name.includes(w2)) {
            return false // no match
          }
        }
        return true
      })
      return list
    },

    filteredStepTypeGroups: function () {
      // Organise the step types into groups
      const list = this.filteredSteps
      const groups = [ ]
      let currentGroup = null
      for (const type of list) {
        // Do not display the hidden group
        if (type._group === 'hidden') {
          continue
        }
        if (currentGroup === null || currentGroup.group !== type._group) {
          currentGroup = { group: type._group, types: [ ] }
          groups.push(currentGroup)
        }
        currentGroup.types.push(type)
      }
      // console.log(`groups=`, groups)
      return groups
    }
  },

  methods: {

    backToPipelines () {
      this.$router.push({ path: `/mondat/pipelines` })
    },

    async savePipeline () {
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
      await this.$axios.$post(url, definition)
    },

    // When dragging from the step type list to the steps list, we need to create a new step.
    stepFromStepType (stepType, arg2, arg3, arg4) {
      // console.log(`stepFromStepType(): stepType=`, stepType)

      // Return a step
      const rec = {
        id: this.nextId++,
        definition: stepType.defaultDefinition
      }
      rec.definition.stepType = stepType.name
      return rec
    }, //- stepFromStepType

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
    }, //- onStepDefinitionChange

    onStepDelete({ id }) {
      // console.log(`onStepDelete(${id})`)

      // const before = JSON.stringify(this.steps, '', 2)
      // console.log(`before = ${before}`)

      for (let i = 0; i < this.steps.length; i++) {
        const step = this.steps[i]
        if (step.id === id) {
          // console.log(`found step at ${i}`, step)
          this.$delete(this.steps, i)
          // console.log(`this.steps=`, this.steps)
          this.dirty = true
          break
        }
      }
      // const after = JSON.stringify(this.steps, '', 2)
      // console.log(`after = ${after}`)
      // this.nextId = resequence(this.steps)
    }, //- onStepDelete
  }
}

function compareStepTypes(stepType1, stepType2) {
  // Sort by group
  if (stepType1._group < stepType2._group) { return -1 }
  if (stepType1._group > stepType2._group) { return +1 }

  // Sort by description (yep, not name)
  const a = stepType1.description.toUpperCase()
  const b = stepType2.description.toUpperCase()
  if (a < b) { return -1 }
  if (a > b) { return +1 }
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

  .my-group-name {
    margin-top: 5px;
    color: #16aa58;
    font-size: 1em;
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
