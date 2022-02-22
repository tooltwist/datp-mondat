/* Copyright Tooltwist Innovations Limited - All Rights Reserved
 * This file is part of DATP and as such is proprietary and confidential software.
 * Unauthorized copying of this file, via any medium is strictly prohibited. All
 * rights reserved. No warranty, explicit or implicit, provided. In no event shall
 * the author or owner be liable for any claim or damages.
 */
<template lang="pug">
.my-providers
  section.section(v-if="loadError")
    .notification.is-danger Error: {{loadError}}
  section.section(v-else)
    h2.title.is-4
      .datemon-heading-icon
        b-icon(icon="api", size="is-small")
      | Standard API Definitions

    MondatNotification
      | This screen is used to define our standard API for each type of service, as "forms".
      | The request and response are defined separately, and the&nbsp;
      b Field Mapping
      | &nbsp;page is used to define forms used elsewhere in the system, and to
      | map the fields between these API forms and those forms.
      | Using these definitions, we can provide initial validation of the data
      | passed to an API (e.g. mandatory fields, and field types), and automatically
      | the convert between form types.
    br

    span(v-if="loading")
      | Loading...
    span(v-else-if="loadError")
      .notification.is-danger() {{loadError}}
    template(v-else)
      b-field(horizontal, label="Service")
        b-select(placeholder="Select a service", v-model="serviceCode")
          optgroup(v-for="category in categories", :label="category.description")
            option(v-for="s in category.services", :value="s.service", :key="s.service")
              //- | {{s.label}}
              | {{s.service}} - {{s.description}}

      .is-pulled-right(v-if="currentView") {{currentView}}
      b-field(v-if="providerCode", horizontal, label="Message type")
        b-select(placeholder="Select a message type", v-model="messageType")
          option(v-for="mt in messageTypes", :value="mt.type", :key="mt.type")
            | {{mt.description}}

      br
      formservice-fields(v-if="currentView", :view="currentView", :fields="currentView.fields")

      hr
      .notification.is-danger(v-if="error") Invalid amount
</template>

<script>
import axios from "axios";
import FormserviceFields from '~/components/formservice-fields'
import FormserviceMappingVisual from '~/components/formservice-mapping-visual.vue'
import FormserviceMappingRequest from '~/components/formservice-mapping-request.vue'
import FormserviceMappingResponse from '~/components/formservice-mapping-response.vue'
import MondatNotification from "~/components/MondatNotification.vue"

export default {
  name: "Messages",
  components: {
    FormserviceFields,
    FormserviceMappingVisual,
    FormserviceMappingRequest,
    FormserviceMappingResponse,
    MondatNotification,
  },
  data() {
    return {
      loading: true,
      loadError: null,

      services: [ ],
      messageTypes: [
        { type: 'request', description: 'API Request' },
        { type: 'response', description: 'API Response' },
      ],
      views: [ ],

      mode: 'mapping',
      providerName: '',

      // The mapping screen has a problem setting arrow positions when it's
      // tab is not displayed, and also has a trouble knowing when it gets
      // displayed. This counter gets incremented each time the tab is changed,
      // and the mapping component can watch it's value.
      checkArrows: 1,


      // Selected Values
      providerCode: 'std',
      serviceCode: '',
      messageType: 'request',

      // Table definition
      fieldsColumns: [
        {
          field: 'name',
          label: 'Field',
          width: 300,
        },
        {
          field: 'type',
          label: 'Type'
        },
        {
          field: 'mandatory',
          label: 'Mandatory'
        }
      ],

      categories: [ ],

      // Error message
      error: ''
    };
  },

  async asyncData({ params, $http, $monitorEndpoint }) {
    // Only run on the client
    if (process.server) {
      return { }
    }

    const url = `${$monitorEndpoint}/metadata/services`;
    try {
      const reply = await axios.get(url);

      // Group the services by category
      const categories = [ ]
      let currentCategory = null
      for (const s of reply.data) {
        if (currentCategory === null || currentCategory.category !== s.category) {
          currentCategory = {
            category: s.category,
            description: s.category_description,
            services: [ ]
          }
          categories.push(currentCategory)
        }
        currentCategory.services.push(s)
      }
      // console.log(`categories=`, categories)
      return { categories, loading: false }
    } catch (e) {
      console.log(`url=`, url)
      console.log(`e.response=`, e.response)
      return { loading: false, loadError: e.toString() }
    }
  },

  computed: {
    currentView: function () {
      if (this.providerCode && this.serviceCode && this.messageType) {
        return `${this.providerCode}-${this.serviceCode}-${this.messageType}`
      }
      return null
    },
  },

  methods: {

  },
};
</script>

<style lang="scss" scoped>
.my-providers {
  .my-tab-section {
    min-height: 700px;
  }
}
</style>
