/* Copyright Tooltwist Innovations Limited - All Rights Reserved
 * This file is part of DATP and as such is proprietary and confidential software.
 * Unauthorized copying of this file, via any medium is strictly prohibited. All
 * rights reserved. No warranty, explicit or implicit, provided. In no event shall
 * the author or owner be liable for any claim or damages.
 */
<template lang="pug">
.my-transactionComponent
  span(v-if="loading")
    | Loading...
  span(v-else-if="loadError")
    .notification.is-danger() {{loadError}}
  template(v-if="details.inCache || details.inArchive")  
    StateDiagramComponent(:txDetails="details")

    br
    b-tabs(v-model="activeTab", type="is-toggle-rounded")
      b-tab-item(label="Transaction")
        TransactionDetailsComponent(:txDetails="details", :refreshCounter="refreshCounter")

      b-tab-item(label="Flow")
        TransactionFlow2Component(:txDetails="details", :refreshCounter="refreshCounter")

      b-tab-item(label="Cache/Archive")
        TransactionCacheComponent(:txDetails="details", :refreshCounter="refreshCounter", @refresh="$emit('refresh')")

      b-tab-item(label="State")
        TransactionStateComponent(:txDetails="details", :refreshCounter="refreshCounter")

  template(v-else)
    br
    .notification.is-danger Unknown transaction
</template>

<script>

export default {
  components: {
  },

  props: {
    txId: String,
    refreshCounter: Number,
  },

  async mounted() {
    // Only run on the client
    if (process.server) {
      return { }
    }
    console.log(`mounted`)
    this.reloadDetails()
  }, //- asyncData

  watch: {
    txId: async function () {
      // The txid changes on the test page, when a new test is run.
      // We need to load the details of the new transaction, but we
      // wait a short while so the log has something to show.
      // setTimeout(async () => {
        await this.reloadDetails()
        // await this.showTransactionDetails()
      // }, 500)
    },

    refreshCounter: async function () {
      await this.reloadDetails()
    },
  },

  data: function () {
    return {
      loading: true,
      loadError: null,

      // // txId: '',
      // txinfo: null,
      // steps: [ ],
      // hierarchy: [ ],
      // currentStepId: '',
      // stepDetails: null,
      details: { },
      // transactionStateJSON: '',

      activeTab: 0,
      // refreshCounter: 1,

      boxSelectedStyle: "fill: rgb(72, 95, 199);stroke-width:1;stroke:rgb(0,0,0)",
      boxNotSelectedStyle: "fill:rgb(200,200,200);stroke-width:1;stroke:rgb(0,0,0)",
      boxSelectedTextStyle: "fill:#fff",
      boxNotSelectedTextStyle: "fill:#666",
    }
  }, //- data

  computed: {
  },

  methods: {
    reloadDetails: async function() {
      // Same loading as asyncData
      this.loading = true
      this.loadError = null
      const url = `${this.$monitorEndpoint}/transaction/${this.txId}/stateStatus`
      console.log(`reloadDetails(): url=${url}`)
      try {
        const txDetails = await this.$axios.$get(url)
        delete txDetails._status
        delete txDetails._statusText
        console.log(`txDetails=`, txDetails)

        if (!txDetails.state) {
          txDetails.state = { }
        }
        if (!txDetails.state.transactionData) {
          txDetails.state.transactionData = { }
        }
        if (!txDetails.state.f2) {
          txDetails.state.f2 = [ ]
        }
        if (!txDetails.state.retry) {
          txDetails.state.retry = { }
        }
        this.details = txDetails
        // this.transactionStateJSON = reply.state ? JSON.stringify(reply.state, '', 2) : ''
        // console.log(`txinfo=`, this.txinfo)
        // this.steps = this.txinfo.steps
        // this.hierarchy = formHierarchy(this.steps)
      } catch (e) {
        console.log(`e=`, e)
        console.log(`e.response=`, e.response)
        console.log(`url was`, url)
        this.loadError = e.toString()
      }
      this.loading = false
    },//- reloadDetails

    boxIsSelected: function(requiredProcessingStatus) {
      switch (requiredProcessingStatus) {
        case 'queued':
        case 'processing':
        case 'sleeping':
        case 'cancelled':
          return (this.details.processingState === requiredProcessingStatus)

        case 'complete':
          return (
            this.details.state.transactionData.status === 'success'
            || this.details.state.transactionData.status === 'aborted'
            || this.details.state.transactionData.status === 'failed'
            || this.details.state.transactionData.status === 'internal-error'
            || this.details.state.transactionData.status === 'timeout'
          )     
      }
      return false
    },
    

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
.my-transactionComponent {

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

  .my-box {
    margin: 0px;
    background-color: #eee;
    width: 120px;
    height: 50px;
    text-align: center;
    margin-bottom: 10px;
  }

  .my-arrow {
    width: 80px;
  }
}
</style>
