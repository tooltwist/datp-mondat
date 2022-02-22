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
      .datemon-heading-icon
        b-icon(icon="state-machine", size="is-small")
      | Node {{nodeId}}

    span(v-if="loading")
      | Loading...
    span(v-else-if="loadError")
      .notification.is-danger() {{loadError}}

    // If the node was not found
    template(v-else-if="node === null")
      MondatNotification
        p
          | Unknown node.

    // When the node is found
    template(v-else)
      b-tabs(type="is-boxed")
        b-tab-item(label="Pipelines", icon="google-photos")
          MondatTable(:data="node.pipelines", :columns="pipelineColumns")

        b-tab-item(label="Step Types", icon="google-photos")
          MondatTable(:data="node.stepTypes", :columns="stepTypeColumns")

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
    // Only run on the client
    if (process.server) {
      return { }
    }


    // A bit lazy here, we'll select all nodes...
    const url = `${$monitorEndpoint}/activeNodes`
    try {
      const nodes = await $axios.$get(url)

      console.log(`nodes=`, nodes)
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
</style>
