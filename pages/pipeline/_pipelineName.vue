<template lang="pug">
  .my-steps-page
    section.section
      .is-pulled-right
        b-button(type="is-success", @click="backToPipelines") Back
      h2.title.is-3.has-text-grey
        //- | Steps&nbsp;&nbsp;
        | Pipeline '{{pipelineName}}'&nbsp;&nbsp;
      .pipeline-section
        StepBox(:definition="definition")
</template>

<script>
import StepBox from '~/components/StepBox.vue'

export default {
  components: {
    StepBox
  },
  data: function () {
    return {
      pipelineName: '',
      definition: { },
    }
  },
  async asyncData({ $axios, route, params }) {
    console.log(`asyncData()`, params)
    console.log(params.pipelineName);
    const pipelineName = params.pipelineName
    const definition = await $axios.$get(`http://localhost:8080/pipeline/${pipelineName}/description`)
    console.log(`definition=`, definition)
    return { pipelineName, definition }
  },
  methods: {
    backToPipelines: function() {
      this.$router.push({ path: `/pipelines` })
    }
  }
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
}
</style>