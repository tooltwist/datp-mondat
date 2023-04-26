/* Copyright Tooltwist Innovations Limited - All Rights Reserved
 * This file is part of DATP and as such is proprietary and confidential software.
 * Unauthorized copying of this file, via any medium is strictly prohibited. All
 * rights reserved. No warranty, explicit or implicit, provided. In no event shall
 * the author or owner be liable for any claim or damages.
 */
<template lang="pug">
.my-transactionCache

  .notification.is-danger(v-if="queuedError")
    .content A queued transaction should be:
      ul
        li Not in the processing list
        li Not in the sleeping list

  .notification.is-danger(v-if="processingError")
    .content A transaction in 'processing' state should be:
      ul
        li In the processing list
        li Not in the sleeping list

  .notification.is-danger(v-if="sleepingError")
    .content A sleeping transaction should be:
      ul
        li In the sleeping list
        li Not the processing list
        li Have sleepingSince set
        li Have sleepCounter set
        li Have wakeTime and/or wakeSwitch set

  .notification.is-danger(v-if="notSleepingError")
    .content If a transaction is NOT sleeping, it should:
      ul
        li Not be in the sleeping list
        li Not have sleepingSince set
        //- li Not have sleepCounter set
        li Not have wakeTime set
        li Not have wakeSwitch set
        li Not have wakeF2i set


  .notification.is-danger(v-if="completeError")
    .content A completed transaction must:
      ul
        li Not be in the processing list
        li Not be in the sleeping list

  template(v-if="txDetails && txDetails.state && txDetails.state.transactionData")
      .is-pulled-right(v-if="txDetails.processingState !== 'complete'")
        | name:
        input.my-testfield(v-model="switchName")
        | value:
        input.my-testfield(v-model="switchValue")
        button.button.is-small(@click="manuallySetSwitch") Set switch
        | &nbsp;&nbsp;&nbsp;
      table
        tr
          td Transaction
          td.my-table-label Owner:
          td.my-table-value {{ txDetails.state.owner }}
        tr
          td
          td.my-table-label External Id:
          td.my-table-value {{ txDetails.state.externalId }}
        tr
          td
          td.my-table-label Transaction type:
          td.my-table-value {{ txDetails.state.transactionData.transactionType }}
        tr
          td
          td.my-table-label Status:
          td.my-table-value {{ txDetails.state.transactionData.status }}
        tr
          td
          td.my-table-label Switches:
          td.my-table-value {{ txDetails.state.transactionData.switches }}
        tr
          td
          td.my-table-label Node group:
          td.my-table-value {{ txDetails.nodeGroup }}
        tr
          td
          td.my-table-label Pipeline:
          td.my-table-value {{ txDetails.pipeline }}
        tr
          td
          td.my-table-label Queue:
          td.my-table-value {{ txDetails.queue }}

      hr
      .is-pulled-right
        //- template(v-if="txDetails.state.retry.wakeSwitch")
          button.button.is-small(@click="testGetSwitch") Get switch
          | &nbsp;&nbsp;&nbsp;
          button.button.is-small(@click="manuallySetSwitch") Set switch
          | &nbsp;&nbsp;&nbsp;
        template(v-if="txDetails.processingState === 'sleeping'")
          button.button.is-small(@click="manuallyWake") Manually wake
      table
        tr
          td Cache &amp; REDIS
          td.my-table-label Processing State:
          td.my-table-value
            span.my-processingState &nbsp;&nbsp;{{ txDetails.processingState }}&nbsp;&nbsp;
        tr
          td
          td.my-table-label
            | Is in the cache:
          td.my-table-value {{ txDetails.inCache ? 'Y' : 'N' }}
        tr
          td
          td.my-table-label
            | Remove from cache at:
          td.my-table-value {{ txDetails.ttl }}
        tr
          td
          td.my-table-label In processing list:&nbsp;
          td.my-table-value {{ timeText(txDetails.inProcessingList) }}
          td.my-table-duration {{ durationText(txDetails.inProcessingList, 'for ', '') }}
        tr
          td
          td.my-table-label In sleeping list:&nbsp;
          td.my-table-value {{ timeText(txDetails.inSleepingList) }}
          td.my-table-duration {{ durationText(txDetails.inSleepingList, '', ' to go') }}
        tr
          td
          td.my-table-label timestamp: 
          td.my-table-value {{ timeText(txDetails.ts) }}
          td.my-table-duration {{ durationText(txDetails.ts, '', ' ago') }}

      hr
      table
        tr
          td Archiving
          td.my-table-label
            | Is archived:
          td.my-table-value {{ txDetails.inArchive ? 'Y' : 'N' }}
        tr
          td
          td.my-table-label Archive at (toArchive):
          td.my-table-value {{ timeText(txDetails.toArchive) }} &nbsp;
          td.my-table-duration {{ durationText(txDetails.toArchive, 'in ', '') }}
      hr
      .is-pulled-right(v-if="txDetails.state.retry.wakeSwitch")
        button.button.is-small(@click="testGetSwitchAsIfFromStep") Get wake switch value for step
      table
        tr
          td Sleeping
          td.my-table-label Sleeping since:&nbsp;
          td.my-table-value {{ timeText(txDetails.state.retry.sleepingSince) }}
          td.my-table-duration {{ durationText(txDetails.state.retry.sleepingSince, '', ' ago') }}
        tr
          td
          td.my-table-label Sleep counter:&nbsp;
          td.my-table-value {{ txDetails.state.retry.sleepCounter }}
        tr
          td
          td.my-table-label Wake time:&nbsp;
          td.my-table-value {{ timeText(txDetails.state.retry.wakeTime) }}
          td.my-table-duration {{ durationText(txDetails.state.retry.wakeTime, 'in ', '') }}
        tr
          td
          td.my-table-label Wake switch:&nbsp;
          td.my-table-value {{ txDetails.state.retry.wakeSwitch }}
        //- tr
          td.my-table-label Node group:&nbsp;
          td.my-table-value {{ txDetails.state.retry.wakeNodeGroup }}
        //- tr
          td.my-table-label Flow index:&nbsp;
          td.my-table-value {{ txDetails.state.retry.wakeF2i }}
      hr
      table(v-if="txDetails.inWebhookList")
        tr
          td Webhook
          td.my-table-label Queued for:&nbsp;
          td.my-table-value {{ timeText(txDetails.inWebhookList) }}
          td.my-table-duration {{ durationText(txDetails.inWebhookList, 'in ', '') }}
        tr
          td
          td.my-table-label Status:&nbsp;
          td.my-table-value {{ txDetails.state.webhook.status }}
        tr
          td
          td.my-table-label Attempts:&nbsp;
          td.my-table-value {{ txDetails.state.webhook.retryCount }}
        tr
          td
          td.my-table-label Initial:&nbsp;
          td.my-table-value {{ txDetails.state.webhook.initialAttempt }}
          td.my-table-duration {{ durationText(txDetails.state.webhook.initialAttempt, '', ' ago') }}
        tr
          td
          td.my-table-label Latest:&nbsp;
          td.my-table-value {{ txDetails.state.webhook.latestAttempt }}
          td.my-table-duration {{ durationText(txDetails.state.webhook.latestAttempt, '', ' ago') }}
        tr
          td
          td.my-table-label Next:&nbsp;
          td.my-table-value {{ txDetails.state.webhook.nextAttempt }}
          td.my-table-duration {{ durationText(txDetails.state.webhook.nextAttempt, 'in ', '') }}
      table(v-else)
        tr
          td Webhook
          td.my-table-label Not scheduled
      hr
      //- br

  template(v-else)
    | Transaction not found

  //- pre
    | {{ JSON.stringify(txDetails, '', 2) }}

</template>

<script>
import fromUnixTime from 'date-fns/fromUnixTime'
import formatDistanceToNow from 'date-fns/formatDistanceToNow'
import formatISO from 'date-fns/formatISO'
import formatRFC7231 from 'date-fns/formatRFC7231'
import formatISO9075 from 'date-fns/formatISO9075'

export default {
  props: {
    txDetails: Object,
    refreshCounter: Number,
  },

  data: function () {
    return {
      switchName: '',
      switchValue: ''
    }
  },

  computed: {

    queuedError: function() {
      if (this.txDetails.processingState === 'queued') {
        if (this.txDetails.inProcessingList) return true
        if (this.txDetails.inSleepingList) return true
      }
      return false
    },

    processingError: function() {
      if (this.txDetails.processingState === 'processing') {
        if (!this.txDetails.inProcessingList) return true
        if (this.txDetails.inSleepingList) return true
      }
      return false
    },

    sleepingError: function() {
      if (this.txDetails.processingState === 'sleeping') {
        if (this.txDetails.inProcessingList) return true
        if (!this.txDetails.inSleepingList) return true

        if (this.txDetails.state) {
          if (!this.txDetails.state.retry.sleepingSince) return true
          if (!this.txDetails.state.retry.sleepCounter) return true
          if (!this.txDetails.state.retry.wakeTime && !this.txDetails.state.retry.wakeSwitch) return true
          // if (!this.txDetails.state.retry.wakeNodeGroup) return true
          // if (!this.txDetails.state.retry.wakeF2i) return true
        }
      }
      return false
    },

    notSleepingError: function() {
      if (this.txDetails.processingState !== 'sleeping') {
        if (this.txDetails.inSleepingList) return true

        if (this.txDetails.state) {
          if (this.txDetails.state.retry.sleepingSince) return true
          // if (this.txDetails.state.retry.sleepCounter) return true
          if (this.txDetails.state.retry.wakeTime) return true
          if (this.txDetails.state.retry.wakeSwitch) return true
          if (this.txDetails.state.retry.wakeNodeGroup) return true
          if (this.txDetails.state.retry.wakeF2i) return true
        }
      }
      return false
    },

    completeError: function() {
      if (this.txDetails.processingState === 'complete') {
        if (this.txDetails.inProcessingList) return true
        if (this.txDetails.inSleepingList) return true
      }
      return false
    },

  },

  methods: {
    timeText: function (time) {
      if (!time) return ''
      try {
        if (typeof(time) === 'string') {
          time = parseInt(time)
          if (time === NaN) {
            return ''
          }
        }
        const dat = fromUnixTime(time / 1000)
        const result = formatRFC7231(dat)
        // const result = formatISO9075(dat)
        return result
      } catch (e) {
        console.log(`e=`, e)
        return null
      }
    },//- timeText

    durationText: function(time, prefix, suffix) {
      if (!time) return ''
      try {
        if (typeof(time) === 'string') {
          time = parseInt(time)
          if (time === NaN) {
            return ''
          }
        }
        const dat = fromUnixTime(time / 1000)
        return prefix + formatDistanceToNow(dat) + suffix
      } catch (e) {
        return null
      }
    },//- durationText

    manuallyWake: async function() {
      console.log(`manuallyWake()`)

      console.log(`this.txDetails=`, this.txDetails)
      const url = `${this.$monitorEndpoint}/manuallyWake/${this.txDetails.state.txId}`
      console.log(`url=`, url)
      const result = await this.$axios.$post(url)
      console.log(`result=`, result)
      if (!result.woken) {
        alert(`Could not wake:\n${result.log}`)
      }
      const self = this
      setTimeout(async () => { self.$emit('refresh') }, 500)
    },//- manuallyWake


    manuallySetSwitch: async function() {
      // console.log(`manuallySetSwitch()`)

      // console.log(`this.txDetails=`, this.txDetails)
      // const switchName = this.txDetails.state.retry.wakeSwitch.trim()
      // const value = 'pink'

      const switchName = this.switchName
      const switchValue = this.switchValue

      if (switchName === '') {
        return
      }
      
      // const switchName = 'b'
      // const value = 'XYZ'

      const url = `${this.$monitorEndpoint}/manuallySetSwitch/${this.txDetails.state.txId}/${switchName}/${switchValue}`
      console.log(`url=`, url)
      const result = await this.$axios.$post(url)
      console.log(`result=`, result)
      // if (!result.action) {
      //   alert(`Could not set switch:\n${result.log}`)
      // }
      const self = this
      setTimeout(async () => { self.$emit('refresh') }, 500)
    },//- manuallySetSwitch

    testGetSwitchAsIfFromStep: async function() {
      // console.log(`testGetSwitch()`)

      const switchName = this.txDetails.state.retry.wakeSwitch.trim()
      const url = `${this.$monitorEndpoint}/zzzGetSwitch/${this.txDetails.state.txId}/${switchName}`
      console.log(`url=`, url)
      const result = await this.$axios.$get(url)
      // console.log(`result=`, result)
      this.$buefy.dialog.alert(`Switch ${switchName} has value ${result.value}`)

      // Update the status from the server
      const self = this
      setTimeout(async () => { self.$emit('refresh') }, 500)
    },//- testGetSwitch

  }//- methods
}
</script>

<style lang="scss">
@import "@/assets/scss/main.scss";
.my-transactionCache {

  .my-table-label {
    // text-align: right;
    // padding-right: 10px;

    font-family: "Open Sans", sans-serif;
    font-size: 16px;
    font-weight: 600;
    height: 24px;
    line-height: 24px;
    text-align: right;
    text-rendering: optimizeLegibility;
    width: 240px;
    // margin-right: 120px;
  }

  .my-table-value {
    display: inline-block;
    min-width: 330px;
    padding-left: 20px;
    padding-right: 5px;
  }

  .my-table-duration {
    padding-right: 30px;
  }

  .my-testfield {
    width: 75px;
    margin-left: 7px;
    margin-right: 20px;
    background-color: #ccc;
  }

  .my-processingState {
    color: #485fc7;
    color: white;
    background-color: #485fc7;
    // font-size: 1.1em;
    font-weight: 600;
  }
}
</style>
