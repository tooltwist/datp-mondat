/* Copyright Tooltwist Innovations Limited - All Rights Reserved
 * This file is part of DATP and as such is proprietary and confidential software.
 * Unauthorized copying of this file, via any medium is strictly prohibited. All
 * rights reserved. No warranty, explicit or implicit, provided. In no event shall
 * the author or owner be liable for any claim or damages.
 */
<template lang="pug">
  section.section
    //- b-field.is-pulled-right
      b-checkbox(v-model="autoUpdate") Auto-update
    button.button.is-primary.is-pulled-right(@click="newMapping") Add Mapping
    h2.title.is-4
      .datemon-heading-icon
        b-icon(icon="shape", size="is-small")
      | Transaction types

    DatemonNotification
      | Each transaction type is mapped to a specific pipeline version.

    span(v-if="loading")
      | Loading...
    span(v-else-if="loadError")
      .notification.is-danger() {{loadError}}
    template(v-else)
      DatemonTable(:data="mapping", :columns="columns", :rows="0", @select="selectMapping")


    //
    //  Modal to edit mapping
    //
    b-modal(v-model="showModal", :width="640", scroll="keep")
      .card
        .card-content
          .content
            h1.title.is-3
              | Transaction to Pipeline mapping
            //- | {{mappingForModal}}
            hr
            section
              b-field(label="Transaction type")
                b-input(v-model="mappingForModal.transactionType", :readonly="!mappingIsNew")
              //- b-field(label="Pipeline")
                b-input(v-model="mappingForModal.pipelineName")
              b-field(label="Pipeline")
                b-select(placeholder="Select a name", v-model="mappingForModal.pipelineName")
                  option(v-for="pipeline in pipelines", :value="pipeline.name", :key="pipeline.name")
                    | {{ pipeline.name }}
                    //- | {{ pipeline.name }}, {{pipeline.version}}
              //- | {{pipelines}}
            hr
            .is-pulled-right
              | &nbsp;&nbsp;
              button.button.is-primary(@click="saveMapping") Save
            .is-pulled-left(v-if="!mappingIsNew")
              | &nbsp;&nbsp;
              button.button.is-danger(@click="deleteMapping") Delete
            .is-pulled-right
              | &nbsp;&nbsp;
              button.button(@click="cancelModal") Cancel
            .is-size-5.has-text-danger(v-if="mappingError") {{mappingError}}
            .is-clearfix
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
      mapping: [ ],
      pipelines: [ ],
      loading: true,
      loadError: null,


      columns: [
        {
            field: 'transactionType',
            label: 'Transaction type',
            // width: '500',
            // numeric: true
        },
        {
            field: 'pipelineName',
            label: 'Pipeline',
            // width: '500',
            // numeric: true
        },
        {
            field: 'pipelineVersion',
            label: 'Version',
        },
      ],//- columns

      // Editing a single row.
      showModal: false,
      mappingForModal: { },
      mappingIsNew: false,
      mappingError: '',
    }
  },//- data

  async asyncData({ $axios, $monitorEndpoint }) {
    // Only run on the client
    if (process.server) {
      return { }
    }

    const url = `${$monitorEndpoint}/transactionMapping`
    const url2 = `${$monitorEndpoint}/pipelines`
    try {
      const mapping = await $axios.$get(url)
      const pipelines = await $axios.$get(url2)
      return { mapping, pipelines, loading: false }
    } catch (e) {
      console.log(`url=`, url)
      console.log(`url2=`, url2)
      console.log(`e.response=`, e.response)
      return { nodes: [ ], loading: false, loadError: e.toString() }
    }
  },//- asyncData

  methods: {
    selectMapping(row) {
      // console.log(`selectMapping()`)
      // console.log(`row=`, row)

      this.mappingForModal = row
      this.mappingIsNew = false
      this.showModal = true
      this.mappingError = ''
    },

    newMapping() {
      // console.log(`newMapping()`)
      this.mappingForModal = {
        transactionType: '',
        pipelineName: '',
        pipelineVersion: '1.0'
      }
      this.mappingIsNew = true
      this.showModal = true
      this.mappingError = ''
    },

    async saveMapping() {
      // console.log(`saveMapping()`, this.mappingForModal)
      if (this.mappingIsNew) {
        // Check the type is not already used
        if (!this.mappingForModal.transactionType) {
          this.mappingError = 'Missing transaction type'
          return
        }
        for (const map of this.mapping) {
          if (map.transactionType === this.mappingForModal.transactionType) {
            this.mappingError = 'Type already exists'
            return
          }
        }
      }

      // Save the mapping
      const url = `${this.$monitorEndpoint}/transactionMapping`
      // console.log(`url=`, url)
      const result = await this.$axios.$post(url, this.mappingForModal)
      // console.log(`result=`, result)
      if (result.status !== 'ok') {
        this.mappingError = 'Unable to save mapping'
        return
      }
      this.mappingError = ''
      this.showModal = false

      // Reload all the mappings
      const url2 = `${this.$monitorEndpoint}/transactionMapping`
      this.mapping = await this.$axios.$get(url2)
    },

    async deleteMapping() {
      // console.log(`deleteMapping()`, this.mappingForModal)
      try {
        const url = `${this.$monitorEndpoint}/transactionMapping/${this.mappingForModal.transactionType}`
        // console.log(`url=`, url)
        const result = await this.$axios.$delete(url)
        // console.log(`result=`, result)

        this.mappingError = ''
        this.showModal = false

        // Reload all the mappings
        const url2 = `${this.$monitorEndpoint}/transactionMapping`
        this.mapping = await this.$axios.$get(url2)

      } catch (e) {
        console.log(`e=`, e)
      }
    },

    cancelModal() {
      // console.log(`cancelModal()`)
      this.showModal = false
    },
  },//- methods
}

</script>
