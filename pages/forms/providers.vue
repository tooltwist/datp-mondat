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

    //- | {{checkArrows}}
    //- hr
    //- span(style="font-size:9px; line-height:0.5;")
    //-   b {{theLeftViewName}}
    //-   | : {{theLeftView}}
    //- //- hr
    //- br
    //- span(style="font-size:9px; line-height:0.9;")
    //-   b {{theRightViewName}}
    //-   | : {{theRightView}}
    //- br
    //- span(style="font-size:9px; line-height:0.9;")
    //-   b mappng:&nbsp;
    //-   | {{theMapping}}
    //- hr
    br

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

    //- b-field(v-if="providerCode && serviceCode", horizontal, label="Connector")
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
    //- | {{currentlyLoadedView}} VS {{currentViewName}}
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
    //- formservice-mapping-request(
          v-if="messageType.toLowerCase().indexOf('request') >= 0",
          :view="currentViewName",
          :provider="providerCode",
          :service="serviceCode",
          :messageType="messageType"
        )
    //- hr
    //- formservice-mapping-response(
          v-else,
          :view="currentViewName",
          :provider="providerCode",
          :service="serviceCode",
          :messageType="messageType"
        )

    //- hr
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
import formserviceMisc from '../../lib/formservice-misc';

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
      // connectors: [
      //   {
      //     connector: 'mock-generic',
      //     description: 'Generic mock backend'
      //   },
      //   {
      //     connector: 'mock-cebuana',
      //     description: 'Mock Cebuana backend'
      //   },
      //   {
      //     connector: 'mock-ussc',
      //     description: 'Mock USSC backend'
      //   },
      //   {
      //     connector: 'mock-wu',
      //     description: 'Mock Western Union backend'
      //   }
      // ],
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
    // console.log(`providers.vue:asyncData()`)
    const url = `http://localhost:57990/gateway/metadata/domains`
    // console.log(`url=`, url)
    const reply = await axios.get(url);
    // console.log(`reply=`, reply)
    const providers = reply.data;
    // console.log(`providers=`, providers)
    return { providers }
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
    currentViewName: function () {
      return formserviceMisc.viewName(this.providerCode, this.serviceCode, this.messageType)
      // if (this.providerCode && this.serviceCode && this.messageType) {
      //   return `${this.providerCode}-${this.serviceCode}-${this.messageType}`
      // }
      // return null
    },

    stdViewName: function () {
      const provider = 'std'
      return formserviceMisc.viewName(provider, this.serviceCode, this.messageType)
      // if (this.serviceCode && this.messageType) {
      //   return `${provider}-${this.serviceCode}-${this.messageType}`
      // }
      // return null
    },

    activeProviders: function () {
      return this.providers.filter(p => {
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
      // const url3 = `http://localhost:57990/gateway/metadata/services/${this.providerCode}`;
      const url3 = `http://localhost:57990/gateway/metadata/services`;
      const reply3 = await axios.get(url3);
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
};
</script>

<style lang="scss" scoped>
.my-providers {
  .my-tab-section {
    min-height: 700px;
  }
}
</style>