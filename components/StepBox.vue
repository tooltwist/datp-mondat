/* Copyright Tooltwist Innovations Limited - All Rights Reserved
 * This file is part of DATP and as such is proprietary and confidential software.
 * Unauthorized copying of this file, via any medium is strictly prohibited. All
 * rights reserved. No warranty, explicit or implicit, provided. In no event shall
 * the author or owner be liable for any claim or damages.
 */
<template lang="pug">
  .my-stepbox

    table
      tr(v-if="stepNo > 0")
        td
          // Place a vertical line above the step
          .my-z-line-cell
      tr
        td
          b-collapse.card.my-card(animation="slide" :aria-id="`contentId${id}`", :open="open", @open="onExpand")
            template(#trigger="props")
              .card-header(role="button", :aria-controls="`contentId${id}`", :class="{ invalidStep: !isValidStepType(originalStepType) }")
                a.card-header-icon.my-card-header-icon
                  b-icon(:icon="props.open ? 'menu-down' : 'menu-right'")
                p.card-header-title.my-card-header-title
                  | {{bestDescription}}
                p {{isValidStepType(originalStepType) ? '' : 'INVALID STEP TYPE&nbsp;'}}

            .card-content.my-card-content
              .content
                .has-text-right.is-size-7 {{originalStepType}}
                a.is-pulled-right.my-trash-can(v-if="editable", @click="onDelete")
                  b-icon(icon="trash-can-outline")
                b-field(label="Description")
                  b-input(v-model="description", :readonly="!editable", @blur="onBlur", :placeholder="bestDescription")
                //- br
                //- | step.definition.description: {{ step.definition.description }}
                //- br
                //- | step.description: {{ step.description }}
                //- br
                //- | step.definition.stepType: {{ step.definition.stepType }}
                //- br
                //- | step.stepType: {{ step.stepType }}
                //- br
                //- | json: {{ json }}
                //- br
                b-field(label="Definition", v-if="stepHasDefinition(originalStepType)")
                  textarea.textarea(rows="8", v-model="json", :readonly="!editable", @input="onInput", @blur="onBlur")
                .is-danger.is-size-7 {{errorMsg}}
</template>

<script>
export default {
  props: {
    step: {
      type: Object,
      required: true
    },
    stepNo: {
      type: Number,
      required: true
    },
    validStepTypes: {
      type: Object,
      required: true
    },
    open: Boolean,
    editable: Boolean,
  },
  data: function () {
    return {
      id: '',
      // definition: { },

      // Edited values
      description: '',
      json: '',

      // open: false,
      errorMsg: '',

      originalId: '',
      originalStepType: '',
      originalDescription: '',
      originalJson: '',
    }
  },

  computed: {
    bestDescription: function () {
      if (this.description) {
        return this.description
      }
      if (this.step.definition.msg) {
        return this.step.definition.msg
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
  }, //- computed

  created: function () {
    // Set the JSON string version of the definition
    // console.log(`created()`)
    // this.definition = this.step.definition

    this.gottaStep(this.step)
  },

  watch: {
    'step': function () {
      // alert('step changed')
      // console.log(`STEP CHANGED`)
      this.gottaStep(this.step)
    }
  },

  methods: {

    gottaStep: function (step) {
      // console.log(`gottaStep()`)
      // Save the values we came in with
      this.originalId = step.id
      this.originalDescription = step.definition.description
      this.originalStepType = step.definition.stepType
      // future?
      // this.originalDescription = step.description ?? step.definition.description
      // this.originalStepType = step.stepType ?? step.definition.stepType
this.originalStepType = step.stepType ?? step.definition.stepType
this.originalDescription = step.description ?? step.definition.description

      // Create a JSON version of the step definition
      const clone = { ...step.definition }
      delete clone.id
      delete clone.description
      delete clone.stepType
      this.originalJson = JSON.stringify(clone, '', 4)

      // We'll modify copies of the original values
      this.description = this.originalDescription
      this.json = this.originalJson
    },

    onExpand () {
      this.$emit('open', { })
    },

    onInput () {
      try {
        JSON.parse(this.json)
        this.errorMsg = ''
        return
      } catch (e) {
        console.log(`Invalid JSON`)
        this.errorMsg = e.toString()
        console.log(`this.errorMsg=`, this.errorMsg)
      }
    }, //- definitionChanged

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
          // console.log(`EMMITTING`)
          this.$emit('changed', { id: this.originalId, description: this.description, definition: newDefinition })
        } catch (e) {
          console.log(`Invalid JSON`)
          this.errorMsg = e.toString()
          // console.log(`NOT EMMITTING`)
          console.log(`this.errorMsg=`, this.errorMsg)
        }
      }
    },

    isValidStepType(stepType) {
      return this.validStepTypes[stepType] ? true : false
    },

    stepHasDefinition(stepType) {

      const type = this.validStepTypes[stepType]
      if (type && type.defaultDefinition && type.defaultDefinition.noDefinition) {
        return false
      }
      return true
    },

    onDelete () {
      this.$emit('deleted', { id: this.originalId })
    }
  }, //- methods

}
</script>

<style lang="scss" scoped>
.my-stepbox {

  $box-width: 305px;
  $line-position: 230px;

  min-width: $box-width;
  margin: 0px;
  padding: 0px;

  .my-description {
    font-size: 14px;
    color: #000022;
  }

  .my-stepType {
    color: #333;
    color: silver;
    font-size: 13px;
    text-align: right;
    margin-right: 8px;
  }

  .my-z-line-cell {
    width: $line-position;
    height: 40px;
    border-right: solid 1px #999;
    color: pink;
  }

  .my-card {
    min-width: 450px;
    background-color: #171717;

    .my-card-header-icon {
      padding-left: 5px;
      padding-right: 5px;
    }

    .my-card-header-title {
      padding-left: 0px;
    }

    .my-card-content {
      padding-top: 5px;
    }
  }

  .my-trash-can {
    color: silver;
    opacity: 0.6;
  }

  .invalidStep {
    background-color: crimson;
  }
}//- .my-stepbox
</style>
