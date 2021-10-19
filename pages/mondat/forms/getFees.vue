<template lang="pug">
.my-getFees
  section.section
    h1.title Service Get Fees
    //- hr
    //- | {{ providers}}
    hr
    //- .field
    //-   label.label Subject
    //-     .control
    //-       .select
    //-         select
    //-           option(v-for="p in providers", :value="p.code", :key="p.code") {{p.description}}

    h1.title.is-size-5 Provider
      //- | {{providerCode}}
    .control
      .field
        label.radio(v-for="p in providers")
          input(type="radio", name="provider", @change="selectProvider(p)")
          | &nbsp;{{p.name}}&nbsp;&nbsp;
          //- | {{p.code}}
    hr
    div(v-show="providerCode !== ''")
      h1.title.is-size-5 Calculate fees for {{providerName}}
      .field.is-horizontal
        .field-label.is-normal
          .field-label.label Amount
        .field-body
          .field
            .control.is-expandedZ
              input.input(type="text", placeholder="Amount to be remitted", v-model="amount")
      .field.is-horizontal
        .field-label.is-normal
          .field-label.label Country
        .field-body
          .field
            //- .control.is-expandedZ
            //-   input.input(type="text", placeholder="Country of recipient", v-model="countryCode")
            //-   | {{countries}}
            .select
              select(v-model="countryCode")
                option(v-for="c in countries", :value="c.code", :key="c.code") {{c.name}}
      .field.is-horizontal
        .field-label.is-normal
          .field-label.label Currency {{currencyCode}}
        .field-body
          .field
            .select
              select(v-model="currencyCode")
                option(v-for="c in currencies", :value="c.code", :key="c.code") {{c.name}}
      .field.is-horizontal
        .field-label.is-normal
          .field-label.label Promo Code
        .field-body
          .field
            .control.is-expandedZ
              input.input(type="text", placeholder="", v-model="promoCode")

      .field.is-horizontal
        .field-label
          // Left empty for spacing
        .field-body
          .field
            .control
              button.button.is-info(@click="getFees") Calculate Fees
      hr
    //- | {{providerCode}}, {{providerName}}, {{amount}}, {{countryCode}}, {{currencyCode}}, {{promoCode}}
    //- hr
    .notification.is-danger(v-if="error") Invalid amount
    pre(v-else-if="fees")
      | {{fees}}


    //- amount: 1234.56,
    //- currency: 'AUD',
    //- promo_code: 'SAVEMORE',
    //- destination_country: 'AU'

</template>

<script>
import axios from "axios";

export default {
  name: "Messages",
  data() {
    return {
      providers: [
        {
          provider: 'cebuana',
          name: 'Cebuana'
        },
        {
          provider: 'wu',
          name: 'Western Union'
        }
      ],
      countries: [ ],
      currencies: [ ],

      // Selected Values
      providerCode: '',
      providerName: '',
      amount: 123.45,
      currencyCode: 'PHP',
      currentDescription: '',
      countryCode: 'PH',
      countryDescription: '',
      promoCode: 'ABC123',

      // Reply from server
      fees: null,

      // Error message
      error: ''
    };
  },
  methods: {
    async getFees() {
      // console.log(`getFees`)
      const OPERATION = 'getFees'

      this.error = ''
      const amount = parseInt(this.amount)
      if (isNaN(amount)) {
        this.error = `Invalid amount`
        return
      }

      // See https://www.npmjs.com/package/ava-http
      const endpoint = `${this.$datpEndpoint}//gateway`
      const url = `${endpoint}/${OPERATION}/${this.providerCode}`
      // console.log(`url=`, url)
      const body = {
        amount,
        destination_country: this.countryCode,
        currency: this.currencyCode,
        promo_code: this.promoCode,
      }
      // console.log(`body=`, body)
      const reply = await axios({
        method: 'post',
        url,
        data: body })
      // console.log(`reply.data=`, reply.data)
      this.fees = reply.data
    },

    async selectProvider (provider) {
      // console.log(`selectProvider(${provider})`)
      this.providerCode = provider.code
      this.providerName = provider.name

      // Load countries
      const url = `${this.$datpEndpoint}//gateway/countries/${provider.code}`;
      const reply = await axios.get(url);
      // console.log(`currencies=`, reply)
      this.countries = reply.data;
      // console.log(`this.countries=`, this.countries)

      // Load currencies
      const url2 = `${this.$datpEndpoint}//gateway/currencies/${provider.code}`;
      const reply2 = await axios.get(url2);
      // console.log(`currencies=`, reply2)
      this.currencies = reply2.data;
      // console.log(`this.currencies=`, this.currencies)
    }
  },

  async mounted() {
    // console.log(`mounted`)
    // this.loadLatestMessages();

    // Get the providers
    const url = `${this.$datpEndpoint}//gateway/metadata/domains`;
    const reply = await axios.get(url);
    // console.log(`reply=`, reply)
    this.providers = reply.data;
    // console.log(`this.providers=`, this.providers)

    // // Load currencies
    // const url2 = `${this.$datpEndpoint}//gateway/currencies`;
    // const reply2 = await axios.get(url2);
    // console.log(`currencies=`, reply2)
    // this.currencies = reply2.data;
    // console.log(`this.currencies=`, this.currencies)

  },
};
</script>

<style lang="scss" scoped>
.my-getFees {

}
</style>