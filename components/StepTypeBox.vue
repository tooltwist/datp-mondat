<template lang="pug">
  .my-stepType-box
    .my-z-box-cell
      .my-description {{stepType.description}}
      .my-stepType {{stepType.name}}
</template>

<script>
export default {
  props: {
    stepType: {
      type: Object,
      required: true
    },
  },
}
</script>

<style lang="scss" scoped>
.my-stepType-box {

  $box-width: 300px;
  $line-position: 120px;
  font-size: 13px;

  min-width: $box-width;
  margin: 0px;
  padding: 0px;

  .my-description {
    color: black;
  }
  .my-stepType {
    color: #333;
    color: #666;
    font-size: 10px;
    text-align: right;
  }

  .my-z-box-cell {
    width: $box-width;
    background-color: lightblue;
    margin-top: 8px;
    padding: 3px;
    padding-left: 5px;
    padding-right: 5px;
    border-top: solid 1px white;
    border-left: solid 1px white;
    border-bottom: solid 1px black;
    border-right: solid 1px black;
    cursor: pointer;
  }
}//- .my-stepbox
</style>