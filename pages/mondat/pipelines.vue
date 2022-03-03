/* Copyright Tooltwist Innovations Limited - All Rights Reserved
 * This file is part of DATP and as such is proprietary and confidential software.
 * Unauthorized copying of this file, via any medium is strictly prohibited. All
 * rights reserved. No warranty, explicit or implicit, provided. In no event shall
 * the author or owner be liable for any claim or damages.
 */
<template lang="pug">
  .my-pipelines-page
    section.section
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
      ]
    }
  },

  async asyncData({ $axios, $monitorEndpoint }) {
    // alert('pipelines 1')
    // Only run on the client
    if (process.server) {
      return { }
    }
    // alert('pipelines 2')

    const url = `${$monitorEndpoint}/pipelineTypes`
    console.log(`url=`, url)
    try {
      const pipelines = await $axios.$get(url)
      // console.log(`pipelines=`, pipelines)

      for (const pipeline of pipelines) {
        pipeline._shortVersion = pipeline.pipelineVersion ?? ''
        if (pipeline._shortVersion.length > 7) {
          pipeline._shortVersion = pipeline._shortVersion.substring(0, 7)
        }
      }
      return { pipelines, loading: false }
    } catch (e) {
      console.log(`url=`, url)
      console.log(`e.response=`, e.response)
      return { pipelines: [ ], loading: false, loadError: e.toString() }
    }
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
    }//- toggleDarkMode
  }//- methods
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
