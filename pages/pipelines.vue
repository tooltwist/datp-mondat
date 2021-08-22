<template lang="pug">
  .my-pipelines-page
    section.section
      h2.title.is-3.has-text-grey
        | Pipelines
        b-icon(icon="transit-connection", size="is-large")
      .container
        .notification.is-primary
          p A pipeline is a series of steps used to process a transaction.
          p Each transacion type maps onto a specific pipeline, however the steps in a pipeline may delegate their funcrtionality
            | by invoking further pipelines.
      br
      br
      //- h3.subtitle.is-6.has-text-grey
      //- br
      b-table(:data="pipelines", :columns="columns", :hoverable="true", @select="selectPipeline", :row-class="() => 'my-table-row'")
      //- br
      //- | {{pipelines}}
</template>

<script>
export default {
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
  async asyncData({ $axios }) {
    // console.log(`asyncData()`)
    const pipelines = await $axios.$get('http://localhost:8080/pipelines')
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
.my-pipelines-page {
  .my-table-row {
    cursor: pointer;
  }
}
</style>