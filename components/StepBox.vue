<template lang="pug">
  .my-stepbox
    //- b-collapse(:open="false" aria-id="contentIdForA11y1")
      template(#trigger)
        b-button(label="Click me!", type="is-primary", aria-controls="contentIdForA11y1")
      notification
        .content
          h3
            | Subtitle
          p
            | Lorem ipsum dolor sit amet, consectetur adipiscing elit. <br/>
            | Nulla accumsan, metus ultrices eleifend gravida, nulla nunc varius lectus, nec rutrum justo nibh eu lectus. <br/>
            | Ut vulputate semper dui. Fusce erat odio, sollicitudin vel erat vel, interdum mattis neque.

    //- b-collapse.card(animation="slide" aria-id="contentIdForA11y3")
      template(#trigger="props")
          div.card-header(role="button", aria-controls="contentIdForA11y3")
            .is-pulled-right
              a.card-header-icon
                b-icon(:icon="props.open ? 'menu-down' : 'menu-up'")
            p.card-header-title
              | {{definition.description}}
            .has-text-rightZ
              //- br
              br
              .my-stepType {{definition.stepType}}

      .card-content
        .content
          | Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus nec iaculis mauris.
          a #buefy
          textarea.textarea(rows="8")
            | {
            |
            | }


      //- footer.card-footer
        a.card-footer-item Save
        a.card-footer-item Edit
        a.card-footer-item Delete

    //- .with-children(v-if="haveChildren")
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
    //- .without-children(v-else)
    table.my-z-table
      tr
        td
          .my-z-line-cell
      tr
        td
          //- .my-z-box-cell
            .my-description {{description}}
            .my-stepType {{definition.stepType}}

          b-collapse.card.my-card(animation="slide" :aria-id="`contentId${id}`", :open="false")
            template(#trigger="props")
              .card-header(role="button", :aria-controls="`contentId${id}`")
                .is-pulled-right
                  a.card-header-icon
                    b-icon(:icon="props.open ? 'menu-down' : 'menu-right'")
                p.card-header-title
                  | {{bestDescription}}
                .has-text-rightZ
                  //- br
                  br
                  .my-stepType {{originalStepType}}

            .card-content
              .content
                a.is-pulled-right.my-trash-can(@click="onDelete")
                  b-icon(icon="trash-can-outline")
                b-field(label="Description")
                  //- b-input(v-model="description", :readonly="!editing")
                  b-input(v-model="description", @blur="onBlur", :placeholder="bestDescription")
                b-field(label="Description")
                  textarea.textarea(rows="8", v-model="json", @input="onInput", @blur="onBlur")
                .is-danger.is-size-7 {{errorMsg}}
                //- div
                  | description={{description}}
                  br
                  | json={{json}}
                  br
                  | dirty={{needToUpdate}}
                  hr
                  | originalId={{originalId}}
                  br
                  | originalStepType={{originalStepType}}
                  br
                  | originalDescription={{originalDescription}}
                  br
                  | originalJson={{originalJson}}
                  hr
                  | s:{{step}}
                  br
                  | d:{{definition}}

                //- | {{definition}}





</template>

<script>
export default {
  props: {
    step: {
      type: Object,
      required: true
    },
    editing: Boolean,
  },
  data: function () {
    return {
      id: '',
      definition: { },

      description: '',
      json: '',

      open: false,
      errorMsg: '',

      originalId: '',
      originalStepType: '',
      originalDescription: '',
      originalJson: '',
    }
  },

  created: function () {
    // Set the JSON string version of the definition
    console.log(`created()`)
    this.definition = this.step.definition

    // Save the values we came in with
    this.originalId = this.step.id
    this.originalDescription = this.definition.description
    this.originalStepType = this.definition.stepType
    const clone = { ... this.definition }
    delete clone.id
    delete clone.description
    delete clone.stepType
    this.originalJson = JSON.stringify(clone, '', 4)

    // We'll modify copies of the original values
    this.description = this.originalDescription
    this.json = this.originalJson
  },

  methods: {
    onInput () {
      console.log(`onInput()`)
      console.log(`this.json=`, this.json)
      try {
        const obj = JSON.parse(this.json)
        this.errorMsg = ''
        return
      } catch (e) {
        console.log(`Invalid JSON`)
        this.errorMsg = e.toString()
        console.log(`this.errorMsg=`, this.errorMsg)
      }
    },//- definitionChanged

    onBlur () {
      if (this.json !== this.originalJson || this.description !== this.originalDescription) {
        try {
          // Accept and format the changes
          const obj = JSON.parse(this.json)
          this.json = JSON.stringify(obj, '', 2)
          this.originalJson = this.json

          // Patch the original stepType and the description into the definition
          const newDefinition = obj
          newDefinition.stepType = this.originalStepType
          newDefinition.description = this.description
          console.log(`EMMITTING`)
          this.$emit('changed', { id: this.originalId, definition: newDefinition })
        } catch (e) {
          console.log(`Invalid JSON`)
          this.errorMsg = e.toString()
          console.log(`NOT EMMITTING`)
          console.log(`this.errorMsg=`, this.errorMsg)
        }
      }
    },

    onDelete () {
      // alert(`onDelete()`)
      console.log(`Deleting step ${this.originalId}`)
      this.$emit('deleted', { id: this.originalId })
    }
  },//- methods


  computed: {
    bestDescription: function () {
      if (this.description) {
        return this.description
      }
      if (this.definition.msg) {
        return this.definition.msg
      }
      return `Step #${this.originalId}`
    },

    needToUpdate: function () {
      if (this.description !== this.originalDescription) {
        return true
      }
      if (this.json !== this.originalJson) {
        return true
      }
      return false
    }
  },//- computed

}
</script>

<style lang="scss" scoped>
.my-stepbox {

  $box-width: 505px;
  $line-position: 230px;

  min-width: $box-width;
  margin: 0px;
  padding: 0px;

  .with-children {
    position: relative;

  }

  .my-description {
    font-size: 14px;
    // color: black;
    // color: white;
    color: #000022;
  }
  .my-stepType {
    color: #333;
    color: silver;
    font-size: 13px;
    text-align: right;
    margin-right: 8px;
  }

  .my-child {
    position: relative;
    border: solid 1px #999;
  }

  .line-box {
    width: $line-position;
    height: 30px;
    border-right: solid 1px #999;
    color: pink;
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
    height: 20px;
    border-right: solid 1px #999;
    color: pink;
  }

  .my-z-box-cell {
    width: $box-width;
    background-color: silver;
    padding: 5px;
    padding-left: 10px;
    // padding-right: 10px;
    border-top: solid 2px white;
    border-left: solid 2px white;
    border-bottom: solid 2px black;
    border-right: solid 2px black;
    cursor: pointer;
    min-height: 60px;
  }

  .my-card {
    min-width: 505px;
  }

  .my-trash-can {
    color: silver;
    opacity: 0.6;
  }
}//- .my-stepbox
</style>