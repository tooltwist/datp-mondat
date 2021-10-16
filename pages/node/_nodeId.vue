<template lang="pug">
.my-steps-page
  section.section
    .is-pulled-right
      b-button(type="is-success", @click="backToNodes") Back
    h2.title.is-3.has-text-grey
      | Node {{nodeId}}

    // If the node was not found
    template(v-if="node === null")
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
import DatemonNotification from "../../components/DatmonNotification.vue"
import DatemonTable from "../../components/DatmonTable.vue"

export default {
  components: {
    DatemonNotification,
    DatemonTable,
  },

  data: function () {
    return {
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

  async asyncData({ $axios, $daptEndpoint, params }) {
    // console.log(`asyncData()`)
    // return { node: {} }

    // A bit lazy here, we'll select all nodes...
    const url = `${$daptEndpoint}/nodes`
    const nodes = await $axios.$get(url)

    // Now find our node
    const nodeId = params.nodeId
    // console.log(`nodeId=`, nodeId)
    for (const node of nodes) {
      if (node.nodeId === nodeId) {
        return { nodeId, node }
      }
    }
    return { nodeId, node: null }

    // const nodeId = params.nodeId
    // const url = `${$daptEndpoint}/node/${nodeId}`
    // console.log(`url=`, url)
    // const node = await $axios.$get(url)
    // // const steps = await $axios.$get(`http://localhost:8080/transaction/${txId}`)
    // return { node }
  },//- asyncData

  methods: {
    backToNodes: function() {
      this.$router.push({ path: `/nodes` })
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
