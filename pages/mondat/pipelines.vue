<template lang="pug">
  .my-pipelines-page
    section.section
      h2.title.is-3
        .datemon-heading-icon
          b-icon(icon="transit-connection", size="is-medium")
        | Pipelines

      DatemonNotification
        | A pipeline is a series of steps used to process a transaction.
        | Each transaction type maps onto a specific pipeline, however the steps in a pipeline may delegate their funcrtionality
        | by invoking further pipelines.

      span(v-if="loading")
        | Loading...
      span(v-else-if="loadError")
        .notification.is-danger() {{loadError}}
      template(v-else)
        DatemonTable(:data="pipelines", :columns="columns", @select="selectPipeline")
</template>

<script>
import DatemonNotification from "~/components/DatmonNotification.vue"
import DatemonTable from "~/components/DatmonTable.vue"

export default {
  components: {
    DatemonNotification,
    DatemonTable,
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
            field: 'version',
            label: 'Version',
        },
      ]
    }
  },

  async asyncData({ $axios, $monitorEndpoint }) {
    const url = `${$monitorEndpoint}/pipelines`
    try {
      const pipelines = await $axios.$get(url)
      return { pipelines, loading: false }
    } catch (e) {
      console.log(`url=`, url)
      console.log(`e.response=`, e.response)
      return { nodes: [ ], loading: false, loadError: e.toString() }
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
