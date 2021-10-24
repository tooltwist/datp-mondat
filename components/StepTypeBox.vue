/* Copyright Tooltwist Innovations Limited - All Rights Reserved
 * This file is part of DATP and as such is proprietary and confidential software.
 * Unauthorized copying of this file, via any medium is strictly prohibited. All
 * rights reserved. No warranty, explicit or implicit, provided. In no event shall
 * the author or owner be liable for any claim or damages.
 */
<template lang="pug">
  .my-stepType-box
    .my-z-box-cell
      .my-description {{stepType.description}}
      //- .my-stepType {{stepTypeGroup(stepType)}} / {{stepTypeName(stepType)}}
      .my-stepType {{stepTypeName(stepType)}}
</template>

<script>
export default {
  props: {
    stepType: {
      type: Object,
      required: true
    },
  },

  methods: {
    stepTypeGroup: function (stepType) {
      const pos = stepType.name.indexOf('/')
      if (pos >= 0) {
        return stepType.name.substring(0, pos)
      }
      return ''
    },

    stepTypeName: function(stepType) {
      const pos = stepType.name.indexOf('/')
      if (pos >= 0) {
        return stepType.name.substring(pos + 1)
      }
      return stepType.name
    }
  }
}
</script>

<style lang="scss" scoped>
.my-stepType-box {

  $box-width: 300px;
  $line-position: 120px;
  font-size: 15px;

  min-width: $box-width;
  margin: 0px;
  padding: 0px;

  .my-stepType {
    font-size: 11px;
    text-align: right;
  }

  .my-z-box-cell {
    width: $box-width;
    background-color: #101010;
    margin-top: 12px;
    margin-left: 25px;
    padding: 3px;
    padding-left: 5px;
    padding-right: 5px;
    cursor: pointer;
    border: solid 1px rgb(153, 153, 153);;
    border-radius: 5px;
  }
}//- .my-stepbox
</style>
