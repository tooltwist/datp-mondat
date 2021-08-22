<template lang="pug">
  .my-stepbox
    .with-children(v-if="haveChildren")
      table
        tr
          td
            .is-size-4.my-description.has-text-centered
              | {{definition.description}}
        template(v-for="child in definition.children")
          tr
            td
              .line-box
          tr
            td
              .my-child
                StepBox(:definition="child")
                //- | {{child}}
    .without-children(v-else)
      .my-description {{definition.description}}
      .my-stepType {{definition.stepType}}
</template>

<script>
export default {
  props: {
    definition: {
      type: Object,
      required: true
    },
  },
  data: function () {
    return {
      numDelegates: 3
    }
  },
  computed: {
    haveChildren() {
      return this.definition.children ? true : false
    }
  }
}
</script>

<style lang="scss" scoped>
.my-stepbox {
  // display: inline-block;
  min-width: 300px;
  // margin: 10px;
  padding: 10px;

  .with-children {
    position: relative;

  }

  .my-description {

  }
  .my-stepType {
    color: #999;
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
    width: 150px;
    // height: 100%;
    height: 30px;
    // background-color: yellow;
    border-right: solid 1px #999;
    // z-index: 50;
    // padding: 2px;
  }
}//- .my-stepbox
</style>