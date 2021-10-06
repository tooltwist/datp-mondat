<template lang="pug">
.my-providers
  section.section
    //- h1.title Providers / Messages
    h2.title.is-3
      .datemon-heading-icon
        b-icon(icon="arrow-left-right-bold", size="is-medium")
      | Field mapping

    DatemonNotification
      | This page allows forms to be defined, and mapped against our standard API forms.

    hr

    b-field(horizontal, label="Remittance Provider")
      b-select(
        placeholder="Select a remittance provider",
        v-model="providerCode",
        @input="changeProvider"
      )
        option(v-for="p in providers", :value="p.code", :key="p.code") {{ p.name }}
        //- option(v-for="s in services", :value="s.service", :key="s.service")
          | {{s.service}} - {{s.description}}
      .is-pulled-right.is-size-7(v-show="currentView") {{ currentView }}

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

    b-field(v-if="providerCode && serviceCode", horizontal, label="Connector")
      b-select(
        placeholder="Select a backend connector",
        v-model="connector"
      )
        option(
          v-for="c in connectors",
          :value="c.connector",
          :key="c.connector"
        )
          | {{ c.description }}

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


    //- b-field(v-if="providerCode", horizontal, label="Message type")
      b-select(
        placeholder="Select a message type",
        v-model="messageType",
        @input="changeView"
      )
        option(v-for="mt in messageTypes", :value="mt.type", :key="mt.type")
          | {{ mt.description }}

    br
    //- | {{currentlyLoadedView}} VS {{currentView}}
    b-tabs(v-if="currentlyLoadedView === currentView", @input="checkArrows++")
      b-tab-item(key="fields", label="Fields")
        formservice-fields(:view="currentView", :fields="currentView.fields")

      b-tab-item(key="visual", label="Visual mapping")
        formservice-mapping-visual(
          :view="currentView",
          :provider="providerCode",
          :service="serviceCode",
          :messageType="messageType",
          :checkArrows="checkArrows"
        )

      b-tab-item(key="mapping", label="Mapping table")
        //- b-table(v-if="messageType.toLowerCase().indexOf('request')>=0", :data="currentView.mapping", :columns="mappingRequestColumns")
        //- b-table(v-else, :data="currentView.mapping", :columns="mappingResponseColumns")
        formservice-mapping-request(
          v-if="messageType.toLowerCase().indexOf('request') >= 0",
          :view="currentView",
          :provider="providerCode",
          :service="serviceCode",
          :messageType="messageType"
        )
        formservice-mapping-response(
          v-else,
          :view="currentView",
          :provider="providerCode",
          :service="serviceCode",
          :messageType="messageType"
        )

    hr
    .notification.is-danger(v-if="error") Invalid amount
</template>

<script>
import axios from "axios";
import FormserviceMisc from "../../lib/formservice-misc";
import FormserviceFields from '../../components/formservice-fields'
import FormserviceMappingVisual from '../../components/formservice-mapping-visual.vue'
import FormserviceMappingRequest from '../../components/formservice-mapping-request.vue'
import FormserviceMappingResponse from '../../components/formservice-mapping-response.vue'
import DatemonNotification from "../../components/DatmonNotification.vue"

export default {
  name: "Messages",
  components: {
    FormserviceFields,
    FormserviceMappingVisual,
    FormserviceMappingRequest,
    FormserviceMappingResponse,
    DatemonNotification,
  },
  data() {
    return {
      providers: [
        // {
        //   provider: 'cebuana',
        //   name: 'Cebuana'
        // },
        // {
        //   provider: 'wu',
        //   name: 'Western Union'
        // }
      ],

      categories: [ ],
      // services: [ ],
      messageTypes: [
        { type: 'request', description: 'Request to backend' },
        { type: 'response', description: 'Response from backend' },
      ],
      connectors: [
        {
          connector: 'mock-generic',
          description: 'Generic mock backend'
        },
        {
          connector: 'mock-cebuana',
          description: 'Mock Cebuana backend'
        },
        {
          connector: 'mock-ussc',
          description: 'Mock USSC backend'
        },
        {
          connector: 'mock-wu',
          description: 'Mock Western Union backend'
        }
      ],
      // views: [ ],

      ZZZview: { },


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
      connector: '',

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
      // mappingRequestColumns: [
      //   {
      //     field: 'source',
      //     label: 'Source'
      //   },
      //   {
      //     field: 'converter',
      //     label: 'Converter'
      //   },
      //   {
      //     field: 'field',
      //     label: 'Field',
      //     // width: 200,
      //   },
      // ],
      // mappingResponseColumns: [
      //   {
      //     field: 'field',
      //     label: 'Field',
      //     // width: 200,
      //   },
      //   {
      //     field: 'converter',
      //     label: 'Converter'
      //   },
      //   {
      //     field: 'source',
      //     label: 'Source'
      //   }
      // ],

      // Error message
      error: ''
    };
  },

  async asyncData({ params, $http }) {
    console.log(`asyncData()`)
    const url = `http://0.0.0.0:4000/gateway/providers`;
    const reply = await axios.get(url);
    // console.log(`reply=`, reply)
    const providers = reply.data;
    console.log(`providers=`, providers)
    return { providers }
  },

  // mounted: async function () {
  //   console.log(`mounted`)
  //   // this.loadLatestMessages();

  //   // Get the providers
  //   const url = `http://0.0.0.0:4000/gateway/providers`;
  //   const reply = await axios.get(url);
  //   // console.log(`reply=`, reply)
  //   this.providers = reply.data;
  //   console.log(`this.providers=`, this.providers)
  // },

  computed: {
    // providerName: function () {
    //   for (const p of this.providers) {
    //     if (p.code === this.providerCode) {
    //       return this.providerName
    //     }
    //   }
    //   return '???'
    // }
    currentView: function () {
      if (this.providerCode && this.serviceCode && this.messageType) {
        return `${this.providerCode}-${this.serviceCode}-${this.messageType}`
      }
      return null
    },
  },

  methods: {
    // getFees: async function () {
    //   console.log(`getFees`)
    //   const OPERATION = 'getFees'

    //   this.error = ''
    //   const amount = parseInt(this.amount)
    //   if (isNaN(amount)) {
    //     this.error = `Invalid amount`
    //     return
    //   }

    //   // See https://www.npmjs.com/package/ava-http
    //   const endpoint = `http://0.0.0.0:4000/gateway`
    //   const url = `${endpoint}/${OPERATION}/${this.providerCode}`
    //   // console.log(`url=`, url)
    //   const body = {
    //     amount,
    //     destination_country: this.countryCode,
    //     currency: this.currencyCode,
    //     promo_code: this.promoCode,
    //   }
    //   // console.log(`body=`, body)
    //   const reply = await axios({
    //     method: 'post',
    //     url,
    //     data: body })
    //   // console.log(`reply.data=`, reply.data)
    //   this.fees = reply.data
    // },

    changeProvider: async function () {
      // console.log(`changeProvider(${this.providerCode})`)

      // Get the provider name
      this.providerName = '???'
      for (const p of this.providers) {
        if (p.code === this.providerCode) {
          this.providerName =  p.name
          break
        }
      }

      // Load services
      // const url3 = `http://0.0.0.0:4000/gateway/metadata/services/${this.providerCode}`;
      const url3 = `http://0.0.0.0:4000/gateway/metadata/services`;
      const reply3 = await axios.get(url3);
      console.log(`reply3=`, reply3)
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
      console.log(`changeView(${this.currentView}) ----- START`)

      // We load the view here, not to load it, but so it gets created if necessary
      const requiredView = this.currentView // computed from provider/service/messageType
      const createIfNotFound = true
      this.viewDef = await FormserviceMisc.getView(requiredView, createIfNotFound)

      // setTimeout(() => {
        // console.log(`set currentlyLoadedView`)
        this.currentlyLoadedView = requiredView
      // }, 3000)
      console.log(`changeView(${this.currentView}) ----- END`)

      // ZZZZZ Hack to set connector
      if (this.providerCode === 'cebuana') {
        this.connector = 'mock-cebuana'
      } else {
        this.connector = 'mock-generic'
      }

    // //   this.loadViews()
    // // },

    // // async loadViews () {

    //   // Load views
    //   // const url = `http://0.0.0.0:4000/gateway/metadata/views/${this.providerCode}/${this.serviceCode}?fields=true&mappings=true`;
    //   const url = `http://0.0.0.0:4000/gateway/metadata/views/${this.providerCode}/${this.serviceCode}`;
    //   console.log(`url=`, url)
    //   const reply = await axios.get(url);
    //   // console.log(`views=`, reply)
    //   this.views = reply.data;
    //   console.log(`this.views=`, this.views)
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

  },

  // async messageDescription(message) {
  //   switch (message) {
  //     case
  //   }
  // }
};
</script>

<style lang="scss" scoped>
.my-providers {
  .my-tab-section {
    min-height: 700px;
  }
}
</style>