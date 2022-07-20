/* Copyright Tooltwist Innovations Limited - All Rights Reserved
 * This file is part of DATP and as such is proprietary and confidential software.
 * Unauthorized copying of this file, via any medium is strictly prohibited. All
 * rights reserved. No warranty, explicit or implicit, provided. In no event shall
 * the author or owner be liable for any claim or damages.
 */
<template lang="pug">
  .my-pipelines-page
    section.section
      .is-pulled-right
        template
          b-button(type="is-warning", @click="showNewPipelineModal") Add pipeline
          | &nbsp;&nbsp;&nbsp;
      h2.title.is-4
        .datemon-heading-icon
          b-icon(icon="transit-connection", size="is-small")
        | Pipelines

      MondatNotification
        | A pipeline is a series of steps used to process a transaction.
        | Each transaction type maps onto a specific pipeline, however the steps in a pipeline may delegate their funcrtionality
        | by invoking further pipelines.

      span(v-if="loading")
        | Loading...
      span(v-else-if="loadError")
        .notification.is-danger() {{loadError}}
      template(v-else)
        MondatTable(:data="uniquePipelines", :columns="columns", @select="selectPipeline")

    
    b-modal(v-model="newPipelineModalVisible", :width="450", scroll="keep")
      .card
        header.card-header
          p.card-header-title Create new pipeline
        .card-content
          .content.has-text-centered
            br
            b-field.is-size-6(label="Name", horizontal)
              b-input.is-size-6(v-model="newPipelineName")
            br
            br

        footer.card-footer
          a.card-footer-item(href="#", @click="newPipelineModalVisible = false") Cancel
          a.card-footer-item(href="#", @click="createNewPipeline") Create Pipeline
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

      pipelines: [ ],

      columns: [
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
            field: '_shortVersion',
            label: 'Version',
        },
        {
            field: 'nodeGroup',
            label: 'Node Group',
        },
      ],

      newPipelineModalVisible: false,
      newPipelineName: '',
    }
  },//- data

  async asyncData({ $axios, $monitorEndpoint }) {
    // Only run on the client
    if (process.server) {
      return { }
    }
    const { pipelines, loadError } = await loadPipelines($axios, $monitorEndpoint)
    return { pipelines, loading: false, loadError }
  },

  computed: {
    uniquePipelines: function () {
      const arr = { }
      for (const pipeline of this.pipelines) {
        arr[pipeline.name] = pipeline
      }
      const list = Object.values(arr)
      return list
    }
  },

  methods: {
    selectPipeline: function (row) {
      const pipelineName = row.name
      this.$router.push({ path: `/mondat/pipeline/${pipelineName}` })
    },

    toggleDarkMode: function() {
      const htmlClassName = 'is-dark-mode-active'
      const state = { isDarkModeActive: true }

      if (state.isDarkModeActive) {
        document.documentElement.classList.add(htmlClassName)
      } else {
        document.documentElement.classList.remove(htmlClassName)
      }
    },//- toggleDarkMode

    showNewPipelineModal: function () {
      this.newPipelineName = ''
      this.newPipelineModalVisible = true
    },

    createNewPipeline: async function () {
      // console.log(`this.newPipelineName=`, this.newPipelineName)
      // console.log(`this.uniquePipelines=`, this.uniquePipelines)

      // Check the pipeline name is not alrady used.
      for (const pipeline of this.uniquePipelines) {
        if (this.newPipelineName === pipeline.name) {
          this.$buefy.toast.open({ message: "This name is already used", type: "is-warning" })
          return
        }
      }

      // Create the new pipeline
      try {
        const url = `${this.$monitorEndpoint}/pipelineType/${this.newPipelineName}/new`
        const response = await this.$axios.$put(url, { })
      } catch (e) {
        console.log(`e=`, e)
        this.$buefy.toast.open({ message: "Error creating new pipeline.", type: "is-danger" })
      }

      // reload the pipelines
      const { pipelines, loadError } = await loadPipelines(this.$axios, this.$monitorEndpoint)
      this.pipelines = pipelines
      this.loadError = loadError
      this.newPipelineModalVisible = false

    },//- createNewPipeline
  }//- methods
}

async function loadPipelines($axios, $monitorEndpoint) {
  // console.log(`loadPipelines()`)

  let url
  try {
    url = `${$monitorEndpoint}/pipelineTypes`
    // console.log(`url=`, url)
    const pipelines = await $axios.$get(url)
    // console.log(`pipelines=`, pipelines)

    for (const pipeline of pipelines) {
      pipeline._shortVersion = pipeline.pipelineVersion ?? ''
      if (pipeline._shortVersion.length > 7) {
        pipeline._shortVersion = pipeline._shortVersion.substring(0, 7)
      }
    }
    return { pipelines, loadError: null }

  } catch (e) {

    // Something went wrong
    console.log(`url=`, url)
    console.log(`e.response=`, e.response)
    return { pipelines: [ ], loadError: e.toString() }
  }
}

</script>

<style lang="scss">
@import "@/assets/scss/main.scss";

.my-pipelines-page {
  .my-table-row {
    cursor: pointer;
  }

  // table.table {
  //   border: solid 1px $dark-mode-border-color;
  //   th {
  //     border-bottom: solid 1px $dark-mode-border-color;
  //   }
  //   td:hover {
  //     color: #3e8ed0;
  //   }
  // }
}
</style>
