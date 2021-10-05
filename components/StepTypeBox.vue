<template lang="pug">
  .my-stepType-box
    //- table.my-z-table
      tr
        td
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
  // data: function () {
  //   return {
  //     numDelegates: 3
  //   }
  // },
  // computed: {
  //   haveChildren() {
  //     return this.definition.children ? true : false
  //   }
  // }
}
</script>

<style lang="scss" scoped>
.my-stepType-box {

  $box-width: 250px;
  $line-position: 120px;

  // display: inline-block;
  min-width: $box-width;
  // margin: 10px;
  // padding: 0px;
  // background-color: yellow;
  // border: dashed 1px purple;
  // margin: 5px;
  // width: 300px;
  margin: 0px;
  padding: 0px;

  .with-children {
    position: relative;

  }

  .my-description {
    color: black;
  }
  .my-stepType {
    color: #333;
    font-size: 12px;
    text-align: right;
  }

  .my-child {
    position: relative;
    border: solid 1px #999;
    // background-color: beige;
    // margin-bottom: 20px;
    // z-index: 100;
    // background-color: white;
  }

  .line-box {
    // position: absolute;
    width: $line-position;
    // height: 100%;
    height: 30px;
    // background-color: yellow;
    border-right: solid 1px #999;
    color: pink;
    // z-index: 50;
    // padding: 2px;
  }

  .line {
    border: solid 1px red;
    width: 300px;
  }

  .my-z-table {
    // background-color: cyan;
  }
  .my-z-line-cell {
    width: $line-position;
    // height: 100%;
    height: 20px;
    // background-color: blue;
    border-right: solid 1px #999;
    color: pink;
  }

  .my-z-box-cell {
    width: $box-width;
    background-color: lightblue;
    margin-top: 20px;
    padding: 5px;
    border-top: solid 2px white;
    border-left: solid 2px white;
    border-bottom: solid 2px black;
    border-right: solid 2px black;
    cursor: pointer;
  }
}//- .my-stepbox
</style>