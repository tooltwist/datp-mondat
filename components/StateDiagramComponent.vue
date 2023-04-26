/* Copyright Tooltwist Innovations Limited - All Rights Reserved
 * This file is part of DATP and as such is proprietary and confidential software.
 * Unauthorized copying of this file, via any medium is strictly prohibited. All
 * rights reserved. No warranty, explicit or implicit, provided. In no event shall
 * the author or owner be liable for any claim or damages.
 */
<template lang="pug">
.my-transactionDiagramComponent
  template(v-if="txDetails")
    svg(viewBox="0 0 600 200" width="506" height="150")
      //- svg(width="600" height="200")
      rect(x="10", y="30", width="120", height="50" rx="10" ry="10"  :style="boxIsSelected('queued') ? boxSelectedStyle : boxNotSelectedStyle")
      text(x="38", y="60",  :style="boxIsSelected('queued') ? boxSelectedTextStyle : boxNotSelectedTextStyle") queued

      rect(x="200", y="30", width="120", height="50" rx="10" ry="10" :style="boxIsSelected('processing') ? boxSelectedStyle : boxNotSelectedStyle")
      text(x="220" y="60" zfill="#fff"   :style="boxIsSelected('processing') ? boxSelectedTextStyle : boxNotSelectedTextStyle") processing

      rect(x="390", y="30", width="120", height="50" rx="10" ry="10"  :style="boxIsSelected('complete') ? boxSelectedStyle : boxNotSelectedStyle")
      text(x="415" y="60"  :style="boxIsSelected('complete') ? boxSelectedTextStyle : boxNotSelectedTextStyle") complete

      rect(x="200", y="100", width="120", height="50" rx="10" ry="10"  :style="boxIsSelected('sleeping') ? boxSelectedStyle : boxNotSelectedStyle")
      text(x="228" y="130"  :style="boxIsSelected('sleeping') ? boxSelectedTextStyle : boxNotSelectedTextStyle") sleeping

      rect(x="390", y="100", width="120", height="50" rx="10" ry="10"  :style="txDetails.inArchive ? boxSelectedStyle : boxNotSelectedStyle")
      text(x="417" y="130"  :style="txDetails.inArchive ? boxSelectedTextStyle : boxNotSelectedTextStyle") archived

      //- line(x1="120" y1="55" x2="200" y2="55" style="stroke:rgb(200,200,200);stroke-width:2")

      marker(id="arrowhead" markerWidth="10" markerHeight="7" refX="7" refY="3.5" fill="rgb(180,180,180)" orient="auto")
        polygon(points="0 0, 10 3.5, 0 7")

      g(stroke-width="1" stroke="rgb(200,200,200)" fill="none" stroke-linecap="round" stroke-linejoin="round" Ztransform="matrix(1,0,0,1,-14,0)")
        // queued -> processing
        polyline(points="130,55 195,55" marker-end="url(#arrowhead)")
        // processing -> sleeping
        polyline(points="321,70 350,70 350,125 322,125" marker-end="url(#arrowhead)")
        // processing -> complete
        polyline(points="321,55 386,55" marker-end="url(#arrowhead)")
        // sleeping -> processing
        polyline(points="200,125 170,125 170,70 195,70" marker-end="url(#arrowhead)")
        // processing -> queued
        polyline(points="321,45 350,45 350,10 70,10 70,30" marker-end="url(#arrowhead)")

      <defs>
        <marker markerWidth="10" markerHeight="10" refX="5" refY="5" viewBox="0 0 10 10" orient="auto" id="SvgjsMarker1502">
          <polyline points="0,5 5,2.5 0,0" fill="rgb(150,150,150)" stroke-width="1" stroke="rgb(200,200,200)" stroke-linecap="round" transform="matrix(1,0,0,1,1.6666666666666667,2.5)" stroke-linejoin="round">
          </polyline>
        </marker>
      </defs>

</template>

<script>

export default {
  props: {
    txDetails: Object
  },

  data: function () {
    return {
      boxSelectedStyle: "fill: rgb(72, 95, 199);stroke-width:1;stroke:rgb(0,0,0)",
      boxNotSelectedStyle: "fill:rgb(200,200,200);stroke-width:1;stroke:rgb(0,0,0)",
      boxSelectedTextStyle: "fill:#fff",
      boxNotSelectedTextStyle: "fill:#666",
    }
  }, //- data

  methods: {

    boxIsSelected: function(requiredProcessingStatus) {
      switch (requiredProcessingStatus) {
        case 'queued':
        case 'processing':
        case 'sleeping':
        case 'cancelled':
          return (this.txDetails.processingState === requiredProcessingStatus)

        case 'complete':
          return (
            this.txDetails.state.transactionData.status === 'success'
            || this.txDetails.state.transactionData.status === 'aborted'
            || this.txDetails.state.transactionData.status === 'failed'
            || this.txDetails.state.transactionData.status === 'internal-error'
            || this.txDetails.state.transactionData.status === 'timeout'
          )     
      }
      return false
    },
  },//- methods
    
}
</script>
