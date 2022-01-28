/* Copyright Tooltwist Innovations Limited - All Rights Reserved
 * This file is part of DATP and as such is proprietary and confidential software.
 * Unauthorized copying of this file, via any medium is strictly prohibited. All
 * rights reserved. No warranty, explicit or implicit, provided. In no event shall
 * the author or owner be liable for any claim or damages.
 */
<template lang="pug">
.my-providers
  section.section
    //- h1.title Providers / Messages
    h2.title.is-4
      .datemon-heading-icon
        b-icon(icon="arrow-left-right-bold", size="is-small")
      | Field mapping

    DatemonNotification
      | This page allows forms to be defined, and mapped against our standard API forms.
    br


    span(v-if="loading")
      | Loading...
    span(v-else-if="loadError")
      .notification.is-danger() {{loadError}}
    template(v-else)
      b-field(horizontal, label="Remittance Provider")
        b-select(
          placeholder="Select a remittance provider",
          v-model="providerCode",
          @input="changeProvider"
        )
          //- option(v-for="p in activeProviders", :value="p.code", :key="p.code") {{ p.name }} {{p.status}}
          option(v-for="p in activeProviders", :value="p.code", :key="p.code") {{ p.name }}
          //- option(v-for="s in services", :value="s.service", :key="s.service")
            | {{s.service}} - {{s.description}}
        .is-pulled-right.is-size-7(v-show="currentViewName") {{ currentViewName }}

      b-field(v-if="providerCode", horizontal, label="Service")
        b-select(
          placeholder="Select a service",
          v-model="serviceCode",
          @input="changeView"
        )
          //- option(v-for="s in services", :value="s.service", :key="s.service")
          //-   | {{s.service}} - {{s.description}}
          optgroup(v-for="category in categories", :label="category.description")
            option(
              v-for="s in category.services",
              :value="s.service",
              :key="s.service"
            )
              //- | {{s.label}}
              | {{ s.service }} - {{ s.description }}

      b-field(v-if="providerCode", horizontal, label="Message type")
        div
          button.button(:class="{ 'is-primary is-light' : messageType==='request'}", @click="messageType='request'; changeView()")
            | Request (API &nbsp;
            b-icon(icon="arrow-right", size="is-small ", centered)
            | &nbsp; {{providerCode}})
          | &nbsp;&nbsp;&nbsp;
          button.button(:class="{ 'is-primary is-light' : messageType==='response'}", @click="messageType='response'; changeView()")
            | Reponse (API &nbsp;
            b-icon(icon="arrow-left", size="is-medium ", centered)
            | &nbsp; {{providerCode}})

      br
      | {{currentViewName}}
      hr
      b-tabs(v-if="currentlyLoadedView === currentViewName", @input="checkArrows++")
        b-tab-item(key="fields", label="Fields")
          //ZZZZZ Does this work????
          formservice-fields(:view="currentViewName", :fields="currentViewName.fields", @updated="rightSideViewHasChanged")

        b-tab-item(key="visual", label="Visual mapping")
          formservice-mapping-visual(
            :view="currentViewName",
            :provider="providerCode",
            :service="serviceCode",
            :messageType="messageType",
            :checkArrows="checkArrows"
          )

        b-tab-item(key="mapping", label="Mapping table")
          //- b-table(v-if="messageType.toLowerCase().indexOf('request')>=0", :data="currentViewName.mapping", :columns="mappingRequestColumns")
          //- b-table(v-else, :data="currentViewName.mapping", :columns="mappingResponseColumns")
          formservice-mapping-request(
            v-if="messageType.toLowerCase().indexOf('request') >= 0",
            :messageType="messageType"
          )

        b-tab-item(key="details", label="Details")
          template(v-if="theRightView")
            b-field(label="Description")
              b-input(v-model="description")
            b-field(label="Notes")
              textarea.textarea(rows="15", v-model="notes", placeholder="Enter any notes here...")
      //- .notification.is-danger(v-if="error") Invalid amount
</template>

<script>
import axios from "axios"
import FormserviceFields from '~/components/formservice-fields'
import FormserviceMappingVisual from '~/components/formservice-mapping-visual.vue'
import FormserviceMappingRequest from '~/components/formservice-mapping-request.vue'
import FormserviceMappingResponse from '~/components/formservice-mapping-response.vue'
import DatemonNotification from "~/components/DatmonNotification.vue"
import FormserviceMisc from '~/lib/formservice-misc'

export default {
  name: "Messages",
  components: {
    FormserviceFields,
    FormserviceMappingVisual,
    FormserviceMappingRequest,
    FormserviceMappingResponse,
    DatemonNotification,
  },

  async asyncData({ params, $http, $monitorEndpoint }) {
    // Only run on the client
    if (process.server) {
      return { }
    }

    const url = `${$monitorEndpoint}/metadata/domains`
    try {
      const reply = await axios.get(url)
      const providers = reply.data
      return { providers, loading: false }
    } catch (e) {
      console.log(`url=`, url)
      console.log(`e.response=`, e.response)
      return { loading: false, loadError: e.toString() }
    }
  },

  data() {
    return {
      loading: true,
      loadError: null,

      providers: [ ],
      categories: [ ],
      // services: [ ],
      messageTypes: [
        { type: 'request', description: 'Request to backend' },
        { type: 'response', description: 'Response from backend' },
      ],

      mode: 'mapping',
      providerName: '',

      // The mapping screen has a problem setting arrow positions when it's
      // tab is not displayed, and also has a trouble knowing when it gets
      // displayed. This counter gets incremented each time the tab is changed,
      // and the mapping component can watch it's value.
      checkArrows: 1,


      // Selected Values
      providerCode: '',
      serviceCode: '',
      messageType: 'request',
      // connector: '',

      // This view has been confirmed to exist
      currentlyLoadedView: '',

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
    }
  },

  computed: {
    currentViewName: function () {
      return FormserviceMisc.viewName(this.providerCode, this.serviceCode, this.messageType)
    },

    stdViewName: function () {
      const provider = 'std'
      return FormserviceMisc.viewName(provider, this.serviceCode, this.messageType)
    },

    activeProviders: function () {
      return this.providers.filter((p) => {
        return (p.status !== 'inactive') && (p.status !== 'noplugin')
      })
    },

    theMapping: function () {
      return this.$store.state.viewMapping.mapping
    },

    theLeftViewName: function () {
      return this.$store.state.viewMapping.leftViewName
    },

    theLeftView: function () {
      return this.$store.state.viewMapping.leftView
    },

    theRightView: function () {
      return this.$store.state.viewMapping.rightView
    },

    theRightViewName: function () {
      return this.$store.state.viewMapping.rightViewName
    },

    theRightViewNotes: function () {
      const view = this.theRightView
      if (view) {
        return view.notes
      }
      return ''
    },

    description: {
      get() {
        return this.$store.state.viewMapping.rightView.description
      },
      set(description) {
        console.log(`description=`, description)
        this.$store.dispatch('viewMapping/setRightViewDetails', { description })
      }
    },

    notes: {
      get() {
        return this.$store.state.viewMapping.rightView.notes
      },
      set(notes) {
        console.log(`notes=`, notes)
        this.$store.dispatch('viewMapping/setRightViewDetails', { notes })
      }
    }
  },

  methods: {

    changeProvider: async function () {
      // console.log(`changeProvider(${this.providerCode})`)

      // Get the provider name
      this.providerName = '???'
      for (const p of this.providers) {
        if (p.code === this.providerCode) {
          this.providerName = p.name
          break
        }
      }

      // Load services
      // const url3 = `${this.$monitorEndpoint}/metadata/services/${this.providerCode}`;
      const url3 = `${this.$monitorEndpoint}/metadata/services`
      const reply3 = await axios.get(url3)
      // console.log(`reply3=`, reply3)
      // this.services = reply3.data;
      // console.log(`this.services=`, this.services)


      // Group the services by category
      const categories = [ ]
      let currentCategory = null
      for (const s of reply3.data) {
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
      this.categories = categories

      // Perhaps update the view, if service has already been set.
      if (this.serviceCode) {
        this.changeView()
      }

      // this.serviceCode = ''
    },

    changeView: async function () {
      // console.log(`changeView(${this.currentViewName}) ----- START`)

      // We load the view here, not to load it, but so it gets created if necessary
      const requiredView = this.currentViewName // computed from provider/service/messageType
      const mappingId = this.currentViewName
      this.$store.dispatch('viewMapping/prepare', { leftViewName: this.stdViewName, rightViewName: this.currentViewName, mappingId })
      this.currentlyLoadedView = requiredView
      // console.log(`changeView(${this.currentViewName}) ----- END`)
    },

    tabLabel(view) {
      if (view.message === 'request') {
        // Request
        switch (this.mode) {
          case 'mapping': return `Map the request to the ${this.providerCode.toUpperCase()} API`
          case 'fields': return 'Fields in request to backend'
          case 'definition': return 'Rules for converting the request'
        }
      } else {
        // Response
        switch (this.mode) {
          case 'mapping': return `Map the response from the ${this.providerCode.toUpperCase()} API`
          case 'fields': return 'Fields in backend response'
          case 'definition': return 'Rules for converting the Response'
        }
      }
      return view.view + 'Z'
    },

    rightSideViewHasChanged() {
      console.log('rightSideViewHasChanged()')
      this.$store.dispatch('viewMapping/reloadRightView', { })
    },
  },
}
</script>

<style lang="scss" scoped>
.my-providers {
  .my-tab-section {
    min-height: 700px;
  }
}
</style>
