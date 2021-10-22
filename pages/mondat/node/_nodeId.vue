<template lang="pug">
.my-steps-page
  section.section
    .is-pulled-right
      b-button(type="is-success", @click="backToNodes") Back
    h2.title.is-4.has-text-grey
      .datemon-heading-icon
        b-icon(icon="state-machine", size="is-small")
      | Node {{nodeId}}

    span(v-if="loading")
      | Loading...
    span(v-else-if="loadError")
      .notification.is-danger() {{loadError}}

    // If the node was not found
    template(v-else-if="node === null")
      DatemonNotification
        p
          | Unknown node.

    // When the node is found
    template(v-else)
      b-tabs(type="is-boxed")
        b-tab-item(label="Pipelines", icon="google-photos")
          DatemonTable(:data="node.pipelines", :columns="pipelineColumns")

        b-tab-item(label="Step Types", icon="google-photos")
          DatemonTable(:data="node.stepTypes", :columns="stepTypeColumns")

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

      nodeId: '',
      node: null,

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

    // A bit lazy here, we'll select all nodes...
    const url = `${$monitorEndpoint}/nodes`
    try {
      const nodes = await $axios.$get(url)
      const nodeId = params.nodeId
      // console.log(`nodeId=`, nodeId)
      for (const node of nodes) {
        if (node.nodeId === nodeId) {
          return { nodeId, node, loading: false }
        }
      }
      return { nodeId, node: null, loading: false }
    } catch (e) {
      console.log(`url=`, url)
      console.log(`e.response=`, e.response)
      return { loading: false, loadError: e.toString() }
    }
  },//- asyncData

  methods: {
    backToNodes: function() {
      this.$router.push({ path: `/mondat/nodes` })
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
</style>