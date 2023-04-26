/* Copyright Tooltwist Innovations Limited - All Rights Reserved
 * This file is part of DATP and as such is proprietary and confidential software.
 * Unauthorized copying of this file, via any medium is strictly prohibited. All
 * rights reserved. No warranty, explicit or implicit, provided. In no event shall
 * the author or owner be liable for any claim or damages.
 */
<template lang="pug">
.my-transactionDetails
  template(v-if="txDetails && txDetails.state")
    section
      b-field(label="Transaction type:", horizontal)
        //- b-input(v-model="txDetails.state.transactionData.transactionType", readonly)
        | {{txDetails.state.transactionData.transactionType}}
      b-field(label="Status:", horizontal)
        //- b-input(v-model="txDetails.state.transactionData.status", readonly)
        | {{txDetails.state.transactionData.status}}
      b-field(label="Owner:", horizontal)
        //- b-input(v-model="txDetails.state.owner", readonly)
        | {{txDetails.state.owner}}
      b-field(label="externalId:", horizontal)
        //- b-input(v-model="txDetails.state.externalId", readonly)
        | {{txDetails.state.externalId}}
      b-field(label="Last updated:", horizontal)
        //- b-input(v-model="txDetails.state.externalId", readonly)
        | {{ lastUpdatedText }} &nbsp;&nbsp;&nbsp;&nbsp; ({{lastUpdatedDuration}}) 
      .columns 
        .column
          b-field(label="Input")
            b-input.my-state-json(type="textarea", rows="25", v-model="inputJSON", disabled)
        .column
          b-field(label="Output")
            b-input.my-state-json(type="textarea", rows="25", v-model="outputJSON", disabled)
  template(v-else)
    | Transaction not found

</template>

<script>
import { format } from 'date-fns'
import fromUnixTime from 'date-fns/fromUnixTime'
import formatDistanceToNow from 'date-fns/formatDistanceToNow'
import formatISO from 'date-fns/formatISO'
import formatRFC7231 from 'date-fns/formatRFC7231'

export default {
  components: {
  },

  props: {
    txDetails: Object,
    refreshCounter: Number,
  },

  computed: {
    lastUpdatedText: function () {
      try {
        const dat = fromUnixTime(this.txDetails.state.transactionData.lastUpdated / 1000)
        return formatRFC7231(dat)
      } catch (e) {
        return null
      }
    },
    lastUpdatedDuration: function() {
      try {
        const dat = fromUnixTime(this.txDetails.state.transactionData.lastUpdated / 1000)
        return formatDistanceToNow(dat)
      } catch (e) {
        return null
      }
    },
    inputJSON: function() {
      return JSON.stringify(this.txDetails.state.transactionData.transactionInput, '', 2)
    },
    outputJSON: function() {
      return JSON.stringify(this.txDetails.state.transactionData.transactionOutput, '', 2)
    },
  },

}
</script>

<style lang="scss">
@import "@/assets/scss/main.scss";
.my-transactionDetails {
  // color: pink;

  .my-state-json textarea {
    // color: #e0e0e0 !important;
    // font-size: 1.1em;
    font-size: 0.95em;
    // font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
    line-height: 111%;
  }
}
</style>
