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
      b-button(type="is-success", @click="backToNodes") Back
    h2.title.is-4.has-text-grey
      .mondat-heading-icon
        b-icon(icon="state-machine", size="is-small")
      | Node Group {{nodeGroup}}

    span(v-if="loading")
      | Loading...

    span(v-else-if="loadError")
      .notification.is-danger() {{loadError}}

    template(v-else)
      //- | StepTypres {{stepTypes}}
      b-tabs(type="is-boxed")

        b-tab-item(label="Configuration", icon="cog")
          br
          //- pre
            | {{ JSON.stringify(nodeGroupDetails, '', 2) }}
          table
            tr
              td(colspan="2")
                h2.title.is-size-4 Pipeline Processing
            tr
              td.my-label Worker threads:
              td.my-value
                input.my-field(type="text", v-model="nodeGroupDetails.eventloopWorkers", readonly)
              tr
              td.my-label Pause between scans:
              td.my-value
                input.my-field(type="text", v-model="nodeGroupDetails.eventloopPause", readonly)
                .my-note ms
            tr
              td.my-label Pause after all workers busy:
              td.my-value
                input.my-field(type="text", v-model="nodeGroupDetails.eventloopPauseBusy", readonly)
                .my-note ms
            tr
              td.my-label Pause if no workers are busy:
              td.my-value
                input.my-field(type="text", v-model="nodeGroupDetails.eventloopPauseIdle", readonly)
                .my-note ms
            tr
              td
                br
            tr
              td(colspan="2")
                h2.title.is-size-4 MONDAT
            tr
              td.my-label
                input(type="checkbox", v-model="nodeGroupDetails.serveMondatApi", readonly)
                | &nbsp;Serve the MONDAT backend API
            tr
              td
                br
            tr
              td(colspan="2")
                h2.title.is-size-4 Wakeup Processing
            tr
              td.my-label
                input(type="checkbox", v-model="nodeGroupDetails.wakeupProcessing" readonly)
                | &nbsp;Enabled
            tr
              td.my-label Pause between runs:
              td.my-value
                input.my-field(type="text", v-model="nodeGroupDetails.webhookWorkers", readonly)
                .my-note ms
            tr
              td
                br
            tr
              td(colspan="2")
                h2.title.is-size-4 Webhook Processing
            tr
              td.my-label
                input(type="checkbox", v-model="nodeGroupDetails.webhookProcessing", readonly)
                | &nbsp;Enabled
            tr
              td.my-label Number of Worker threads:
              td.my-value
                input.my-field(type="text", v-model="nodeGroupDetails.webhookWorkers", readonly)
            tr
              td.my-label Pause between iterations:
              td.my-value
                input.my-field(type="text", v-model="nodeGroupDetails.webhookPause", readonly)
                .my-note ms
            tr
              td.my-label Pause if no workers used:
              td.my-value
                input.my-field(type="text", v-model="nodeGroupDetails.webhookPauseIdle", readonly)
                .my-note ms
            tr
              td.my-label Pause after all workers were used:
              td.my-value
                input.my-field(type="text", v-model="nodeGroupDetails.webhookPauseBusy", readonly)
                .my-note ms
              //- "webhookProcessing": 1,
              //- "webhookWorkers": 0,
              //- "webhookPause": 0,
              //- "webhookPauseBusy": 0,
              //- "webhookPauseIdle": 0,
            tr
              td
                br
            tr
              td(colspan="2")
                h2.title.is-size-4 Archive Processing
            tr
              td.my-label
                input(type="checkbox", v-model="nodeGroupDetails.archiveProcessing", readonly)
                | &nbsp;Enabled
            tr
              td.my-label Batch size:
              td.my-value
                input.my-field(type="text", v-model="nodeGroupDetails.archiveBatchSize", readonly)
                .my-note transactions
            tr
              td.my-label Pause between runs:
              td.my-value
                input.my-field(type="text", v-model="nodeGroupDetails.archivePause", readonly)
                .my-note ms
            tr
              td.my-label Pause after nothing was archived:
              td.my-value
                input.my-field(type="text", v-model="nodeGroupDetails.archivePauseIdle", readonly)
                .my-note ms

          //- "archiveProcessing": 1,
          //- "archiveBatchSize": 0,
          //- "archivePause": 500,
          //- "archivePauseIdle": 0,

        b-tab-item(label="Pipelines", icon="transit-connection")
          MondatTable(:data="pipelines", :columns="pipelineColumns")

        b-tab-item(label="Step Types", icon="google-photos")
          MondatTable(:data="stepTypes", :columns="stepTypeColumns")

</template>

<script>
import MondatNotification from "~/components/MondatNotification.vue"
import MondatTable from "~/components/MondatTable.vue"

export default {
  components: {
    MondatNotification,
    MondatTable,
  },

  data: function () {
    return {
      loading: true,
      loadError: null,

      nodeGroup: '',
      stepTypes: [ ],
      pipelines: [ ],

      pipelineColumns: [
        {
            field: 'name',
            label: 'Pipeline name',
            // width: '500',
            // numeric: true
        },
        {
            field: 'description',
            label: 'Description',
        },
        {
            field: 'version',
            label: 'Version',
        },
      ],// pipelineColumns

      stepTypeColumns: [
        {
            field: 'name',
            label: 'Step Type',
            // width: '500',
            // numeric: true
        },
        {
            field: 'description',
            label: 'Description',
            cellClass: "my-bold-cell",
            // cellClass: "is-primary",
        },
      ]//- stepTypeColumns
    }
  },//- data

  async asyncData({ $axios, $monitorEndpoint, params }) {

    // Only run on the client
    if (process.server) {
      return { }
    }
    const nodeGroup = params.nodeGroup


    // A bit lazy here, we'll select all nodes then take the step types
    // from the first node we find in our node group.
    let myStepTypes = [ ]
    const url = `${$monitorEndpoint}/activeNodes?stepTypes=true`
    try {
      const nodes = await $axios.$get(url)
      for (const node of nodes) {
        if (node.nodeGroup === nodeGroup) {
          console.log(`node=`, node)

          myStepTypes = node.stepTypes
          break
        }
      }

    } catch (e) {
      console.log(`url=`, url)
      console.log(`e.response=`, e.response)
      return { loading: false, loadError: e.toString() }
    }

    // Get a list of all pipelines, then find those for this node group
    const myPipelines = [ ]
    const url2 = `${$monitorEndpoint}/pipelineTypes`
    try {
      const pipelines = await $axios.$get(url2)
      for (const pipeline of pipelines) {
        if (pipeline.nodeGroup === nodeGroup) {
          pipeline._shortVersion = pipeline.pipelineVersion ?? ''
          if (pipeline._shortVersion.length > 7) {
            pipeline._shortVersion = pipeline._shortVersion.substring(0, 7)
          }
          myPipelines.push(pipeline)
        }
      }

    } catch (e) {
      console.log(`url=`, url2)
      console.log(`e.response=`, e.response)
      return { loading: false, loadError: e.toString() }
    }

    let nodeGroupDetails = null
    const url3 = `${$monitorEndpoint}/nodeGroups`
    try {
      const groups = await $axios.$get(url3)
      for (const grp of groups) {
        if (grp.nodeGroup === nodeGroup) {
          nodeGroupDetails = grp
          break
        }
      }
    } catch (e) {
      console.log(`url=`, url3)
      console.log(`e.response=`, e.response)
      return { loading: false, loadError: e.toString() }
    }


    return { nodeGroup, nodeGroupDetails, stepTypes: myStepTypes, pipelines: myPipelines, loading: false }

  },//- asyncData

  methods: {
    backToNodes: function() {
      this.$router.push({ path: `/mondat/nodeGroups` })
    }
  }//- methods
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

.my-label {
  padding-left: 30px;
  padding-right: 10px;
  text-align: right;
}

.my-value {
  padding-left: 10px;
}

.my-field {
  width: 50px;
}

.my-note {
  display: inline;
  padding-left: 10px;
  font-size: 0.8em;
}
</style>
