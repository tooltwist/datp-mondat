/* Copyright Tooltwist Innovations Limited - All Rights Reserved
 * This file is part of DATP and as such is proprietary and confidential software.
 * Unauthorized copying of this file, via any medium is strictly prohibited. All
 * rights reserved. No warranty, explicit or implicit, provided. In no event shall
 * the author or owner be liable for any claim or damages.
 */
<template lang="pug">
.my-transactionState
  template(v-if="txDetails && txDetails.state")
    //- section
    br
    .is-pulled-right.has-text-grey {{ this.refreshCounter }}&nbsp;&nbsp;
    b-field(label="Full Transaction State")
      b-input.my-state-json(type="textarea", rows="37", v-model="transactionStateJSON", disabled)
  template(v-else)
    | Transaction not found

</template>

<script>
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
    transactionStateJSON: function () {
      return (this.txDetails && this.txDetails.state) ? JSON.stringify(this.txDetails.state, '', 2) : ''
    }
  },

  methods: {

    // timeText: function (time) {
    //   if (!time) return ''
    //   try {
    //     if (typeof(time) === 'string') {
    //       time = parseInt(time)
    //       if (time === NaN) {
    //         return ''
    //       }
    //     }
    //     const dat = fromUnixTime(time / 1000)
    //     const result = formatRFC7231(dat)
    //     return result
    //   } catch (e) {
    //     console.log(`e=`, e)
    //     return null
    //   }
    // },

    // durationText: function(time, prefix, suffix) {
    //   if (!time) return ''
    //   try {
    //     if (typeof(time) === 'string') {
    //       time = parseInt(time)
    //       if (time === NaN) {
    //         return ''
    //       }
    //     }
    //     const dat = fromUnixTime(time / 1000)
    //     return prefix + formatDistanceToNow(dat) + suffix
    //   } catch (e) {
    //     return null
    //   }
    // },

  }//- methods
}
</script>

<style lang="scss">
@import "@/assets/scss/main.scss";
.my-transactionState {

  .my-state-json textarea {
    // color: #e0e0e0 !important;
    // font-size: 1.1em;
    font-size: 0.95em;
    // font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
    line-height: 111%;
  }

  .my-table-label {
    text-align: right;
    padding-right: 10px;
  }

  .my-table-time {
    padding-right: 30px;
  }

  .my-table-duration {
    padding-right: 30px;
  }

  .my-flag {
    display: inline-block;
    // color: yellow;
    padding-right: 5px;
  }
}
</style>
