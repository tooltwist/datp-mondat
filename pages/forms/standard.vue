<template lang="pug">
.my-providers
  section.section(v-if="loadError")
    .notification.is-danger Error: {{loadError}}
  section.section(v-else)
    //- h1.title Standard API Definitions
    h2.title.is-3
      .datemon-heading-icon
        b-icon(icon="api", size="is-medium")
      | Standard API Definitions

    DatemonNotification
      | This screen is used to define our standard API for each type of service, as "forms".
      | The request and response are defined separately, and the&nbsp;
      b Field Mapping
      | &nbsp;page is used to define forms used elsewhere in the system, and to
      | map the fields between these API forms and those forms.
      | Using these definitions, we can provide initial validation of the data
      | passed to an API (e.g. mandatory fields, and field types), and automatically
      | the convert between form types.
    br
    //- hr

    //- b-field(horizontal, label="Remittance Provider")
      b-select(placeholder="Select a remittance provider", v-model="providerCode", @input="changeProvider")
        option(v-for="p in providers", :value="p.code", :key="p.code") {{p.name}}
        //- option(v-for="s in services", :value="s.service", :key="s.service")
          | {{s.service}} - {{s.description}}
      .is-pulled-right.is-size-7(v-show="currentView") {{currentView}}

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


    //- b-tabs(v-if="currentView", @input="checkArrows++")
    //-   b-tab-item(key="fields", label="Fields")
    //-     formservice-fields(:view="currentView", :fields="currentView.fields")

    br
    formservice-fields(v-if="currentView", :view="currentView", :fields="currentView.fields")

      //- b-tab-item(key="mapping", label="Mapping")
        //- b-table(v-if="messageType.toLowerCase().indexOf('request')>=0", :data="currentView.mapping", :columns="mappingRequestColumns")
        //- b-table(v-else, :data="currentView.mapping", :columns="mappingResponseColumns")
        formservice-mapping-request(v-if="messageType.toLowerCase().indexOf('request')>=0", :view="currentView", :provider="providerCode", :service="serviceCode", :messageType="messageType")
        formservice-mapping-response(v-else, :view="currentView", :provider="providerCode", :service="serviceCode", :messageType="messageType")

      //- b-tab-item(key="visual", label="Visual")
        formservice-mapping-visual(:view="currentView", :provider="providerCode", :service="serviceCode", :messageType="messageType", :checkArrows="checkArrows")



    //- div(v-if="serviceCode")
      br
      b-field(horizontal, label="Show")
        .block
          b-radio(v-model="mode"
                name="mode"
                native-value="mapping")
            | Mapping
          b-radio(v-model="mode"
                name="mode"
                native-value="fields")
            | Fields
          b-radio(v-model="mode"
                name="mode"
                native-value="definition")
            | Map definition
      br


      //- b-tabs()
        b-tab-item(v-for="v in views", :key="v.message", :label="tabLabel(v)")

          //
          //  Show mappings
          //
          div.my-tab-section(v-if="mode === 'mapping'")
            // Heading
            //- .is-pulled-right.is-size-7 {{v.view}}
            div(v-if="v.message==='request'")
              h1.title.is-size-4
                | API request&nbsp;
                b-icon(icon="arrow-right", size="is-small")
                | &nbsp;Backend request
              formservice-mapping(:view="v.view", :fields="v.fields")
              // table
              //- b-table(:data="v.mapping", :columns="mappingRequestColumns")
            div(v-if="v.message==='response'")
              h1.title.is-size-4
                | API response&nbsp;
                b-icon(icon="arrow-left", size="is-small")
                | &nbsp;Backend response
              formservice-mapping(:view="v.view", :fields="v.fields")
              // table
              //- b-table(:data="v.mapping", :columns="mappingResponseColumns")

          //
          //  Show fields
          //
          div.my-tab-section(v-else-if="mode === 'fields'")
            // Heading
            .is-pulled-right.is-size-7 {{v.view}}
            div(v-if="v.message==='request'")
              b-notification These are the fields we send to the {{providerName}} API.
              formservice-fields(:view="v.view", :fields="v.fields")
            div(v-if="v.message==='response'")
              b-notification
                | These are the fields returned by the {{providerName}} API, back to the PETNET gateway.
              formservice-fields(:view="v.view", :fields="v.fields")

          //
          // Show definition
          //
          div.my-tab-section(v-else-if="mode === 'definition'")
            h1.title.is-size-1 DEFINITION
            // Heading
            //- .is-pulled-right.is-size-7 {{v.view}}
            div(v-if="v.message==='request'")
              h1.title.is-size-4
                | API request&nbsp;
                b-icon(icon="arrow-right", size="is-small")
                | &nbsp;Backend request
              // table
              b-table(:data="v.mapping", :columns="mappingRequestColumns")
            div(v-if="v.message==='response'")
              h1.title.is-size-4
                | API response&nbsp;
                b-icon(icon="arrow-left", size="is-small")
                | &nbsp;Backend response
              // table
              b-table(:data="v.mapping", :columns="mappingResponseColumns")

    hr
    .notification.is-danger(v-if="error") Invalid amount
</template>

<script>
import axios from "axios";
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
      // providers: [
      //   {
      //     provider: 'cebuana',
      //     name: 'Cebuana'
      //   },
      //   {
      //     provider: 'wu',
      //     name: 'Western Union'
      //   }
      // ],
      services: [ ],
      messageTypes: [
        { type: 'request', description: 'API Request' },
        { type: 'response', description: 'API Response' },
      ],
      views: [ ],

      // ZZZview: { },


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
      loadError: '',
      error: ''
    };
  },

  async asyncData({ params, $http }) {
    console.log(`asyncData()`)
    try {
      // const url = `http://localhost:57990/gateway/metadata/domains`;
      // const reply = await axios.get(url);
      // // console.log(`reply=`, reply)
      // const providers = reply.data;
      // console.log(`providers=`, providers)
      // const providerCode = 'std'
      // const url3 = `http://localhost:57990/gateway/metadata/services/${providerCode}`;
      const url3 = `http://localhost:57990/gateway/metadata/services`;
      const reply3 = await axios.get(url3);
      // console.log(`reply3=`, reply3)

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
      // console.log(`categories=`, categories)
      return { categories }
    } catch (e) {
      console.log(`e=`, e)
      return { loadError: 'Could not load services' }
    }
  },

  // mounted: async function () {
  //   console.log(`mounted`)
  //   // this.loadLatestMessages();

  //   // Get the providers
  //   const url = `http://localhost:57990/gateway/metadata/domains`;
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
    //   const endpoint = `http://localhost:57990/gateway`
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

    // changeProvider: async function () {
    //   // console.log(`changeProvider(${this.providerCode})`)

    //   // Get the provider name
    //   this.providerName = '???'
    //   for (const p of this.providers) {
    //     if (p.code === this.providerCode) {
    //       this.providerName =  p.name
    //       break
    //     }
    //   }

    //   // Load services
    //   const url3 = `http://localhost:57990/gateway/metadata/services/${this.providerCode}`;
    //   const reply3 = await axios.get(url3);
    //   console.log(`reply3=`, reply3)
    //   this.services = reply3.data;
    //   console.log(`this.services=`, this.services)

    //   // this.serviceCode = ''
    // },

    // changeService: async function () {
    //   console.log(`changeService(${this.serviceCode})`)
    // //   this.loadViews()
    // // },

    // // async loadViews () {

    //   // Load views
    //   // const url = `http://localhost:57990/gateway/metadata/views/${this.providerCode}/${this.serviceCode}?fields=true&mappings=true`;
    //   const url = `http://localhost:57990/gateway/metadata/views/${this.providerCode}/${this.serviceCode}?createIfNotFound=true`;
    //   console.log(`url=`, url)
    //   const reply = await axios.get(url);
    //   // console.log(`views=`, reply)
    //   this.views = reply.data;
    //   console.log(`this.views=`, this.views)
    // },

    // tabLabel(view) {
    //   if (view.message === 'request') {
    //     // Request
    //     switch (this.mode) {
    //       case 'mapping': return `Map the request to the ${this.providerCode.toUpperCase()} API`
    //       case 'fields': return 'Fields in request to backend'
    //       case 'definition': return 'Rules for converting the request'
    //     }
    //   } else {
    //     // Response
    //     switch (this.mode) {
    //       case 'mapping': return `Map the response from the ${this.providerCode.toUpperCase()} API`
    //       case 'fields': return 'Fields in backend response'
    //       case 'definition': return 'Rules for converting the Response'
    //     }
    //   }
    //   return view.view + 'Z'
    // },

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