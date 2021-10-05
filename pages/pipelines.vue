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

      DatemonTable(:data="pipelines", :columns="columns", @select="selectPipeline")


      //- br
      //- br
      //- b-table(:data="pipelines", :columns="columns", :hoverable="true", :bordered="false", :narrowed="true", @select="selectPipeline", :row-class="() => 'my-table-row'")
      //- br
      //- | {{pipelines}}
</template>

<script>
import DatemonNotification from "../components/DatmonNotification.vue"
import DatemonTable from "../components/DatmonTable.vue"

export default {
  components: {
    DatemonNotification,
    DatemonTable,
  },

  data: function () {
    return {
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
  async asyncData({ $axios, $daptEndpoint }) {
    // console.log(`asyncData()`)
    const url = `${$daptEndpoint}/pipelines`
    console.log(`url=`, url)
    const pipelines = await $axios.$get(url)

    // const pipelines = await $axios.$get('http://localhost:8080/pipelines')
    return { pipelines }
  },
  // async fetch() {
  //   console.log(`fetch()`)
  // },
  // created() {
  //   // alert('yarp')
  //   console.log(`created()`)
  // },
  methods: {
    selectPipeline: function (row) {
      const pipelineName = row.name
      console.log(`selectPipeline(${pipelineName})`)
      this.$router.push({ path: `/pipeline/${pipelineName}` })
    },

    toggleDarkMode: function() {
      // alert(`toggle`)
      const htmlClassName = 'is-dark-mode-active'

      // state.isDarkModeActive = !state.isDarkModeActive

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