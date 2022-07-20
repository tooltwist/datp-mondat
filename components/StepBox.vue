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
                //- | {{haveFieldDescriptions}}
                //- br
                //- | {{fieldDescriptions}}
                //- br
                //- hr
                template(v-if="haveFieldDescriptions")
                  // Have field descriptions
                  br
                  template(v-for="field in fieldDescriptions")
                    template(v-if="field.type === 'text'")
                      b-field.my-field(:label="field.label")
                        input.input(v-model="fieldValues[field.name]", :readonly="!editable", @blur="onBlurField(field)")
                    template(v-else-if="field.type === 'textarea'")
                      b-field.my-field(:label="field.label")
                        textarea.textarea(v-model="fieldValues[field.name]", rows="8", :readonly="!editable", @blur="onBlurField(field)")
                    template(v-else-if="field.type === 'checkbox'")
                      b-checkbox.my-field(v-model="fieldValues[field.name]", @input="onBlurField(field)") {{field.label}}
                      br
                    template(v-else-if="field.type === 'select'")
                      //- | {{field.values}}
                      b-field.my-field(:label="field.label")
                        b-select(v-model="fieldValues[field.name]", @input="onBlurField(field)")
                          option(v-for="option in field.options", :value="option.value", :key="option.value") {{option.label}}
                    template(v-else-if="field.type === 'standard-form'")
                      b-field.my-field(:label="field.label")
                        b-select(placeholder="Select a service", v-model="fieldValues[field.name]", @input="onBlurStandardForm(field)")
                          optgroup(v-for="category in formCategories", :label="category.description")
                            option(v-for="s in category.services", :value="`std-${s.service}-request`", :key="s.service")
                              | {{s.service}} - {{s.description}}
                    template(v-else)
                      | {{field.name}} {{field.type}} {{field.label}}
                      br

                template(v-if="showJSONField")
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
      fieldValues: {
        // Non-reactive values get added in here
      },
      formCategories: [ ],

      // open: false,
      errorMsg: '',

      originalId: '',
      originalStepType: '',
      originalDescription: '',
      originalJson: '',
    }
  },

  computed: {

    showJSONField: function () {
      console.log(`showJSONField()`)
      console.log(`this.originalStepType=`, this.originalStepType)
      const type = this.validStepTypes[this.originalStepType]
      console.log(`type=`, type)
      if (type) {
        const definition = type.defaultDefinition ? type.defaultDefinition : { }
        const showJSON = definition._showJSON
        if (typeof(showJSON) === 'undefined') {
          return this.fieldDescriptions.length == 0
        } else {
          return showJSON
        }
      }
      return true
    },

    /**
     * If default definition contains fields starting with an underscore, these
     * are field type definitions, not actual field values.
     * 
     *  _a: 'text:Label for field a',
     *  _b: 'textarea:Label for field b',
     *  _c: 'checkbox:Label for checkbox c',
     *  _d: 'select:Label for d:value1=Label 1:value2=Label 2',
     * 
     * If no field definition fields are provided then the UI will allow
     * a JSON version of the field definition to be edited. The exception is
     * a field named `_editJSON` to override the default behaviour.
     * 
     *  _showJSON: false,
     * 
     */
    fieldDescriptions: function () {
      try {
        const type = this.validStepTypes[this.originalStepType]
        const definition = type.defaultDefinition
        // console.log(`definition=`, definition)
        const list = [ ]
        for (const fieldName in definition) {
          if (fieldName === '_showJSON') {
            continue
          }
          if (fieldName.startsWith('_')) {
            const name = fieldName.substring(1)
            const def = definition[fieldName]
            const arr = def.split(':')
            const type = arr[0]
            const label = (arr.length > 1) ? arr[1] : name
            const field = { name, type, label }
            if (type === 'select') {
              field.options = [ ]
              for (let i = 2; i < arr.length; i++) {
                const str = arr[i]
                const pos = str.indexOf('=')
                if (pos >= 0) {
                  field.options.push({ value: str.substring(0, pos), label: str.substring(pos + 1) })
                } else {
                  field.options.push({ value: str, label: str })
                }
              }
            }
            list.push(field)
          }
        }
        // console.log(`list=`, list)
        return list
      } catch (e) { }
      return [ ]
    },

    haveFieldDescriptions: function () {
      
      // const type = this.validStepTypes[this.originalStepType]
      // console.log(`type=`, type)
      // if (type && type.defaultDefinition && type.defaultDefinition.noDefinition) {
      //   console.log(`YARP`)
      // }
      const list = this.fieldDescriptions
      return list.length > 0
    },

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
    },

  }, //- computed

  created: async function () {
    // Set the JSON string version of the definition
    // console.log(`created()`)
    // this.definition = this.step.definition

    this.gottaStep(this.step)

    // See if any of the fields require a list of information
    try {
      const type = this.validStepTypes[this.originalStepType]
      if (type) {
        const definition = type.defaultDefinition
        // console.log(`definition=`, definition)
        let requireStandardForms = false
        for (const fieldName in definition) {
          if (fieldName.startsWith('_')) {
            const name = fieldName.substring(1)
            const def = definition[fieldName]
            // console.log(`def=`, def)
            if (def && typeof(def) === 'string') {
              const arr = def.split(':')
              const type = arr[0]
              if (type === 'standard-form') {
                requireStandardForms = true
              }
            }
          }
        }//- for
      } else {
        alert(`Unknown type ${this.originalStepType}`)
      }

      const url = `${this.$monitorEndpoint}/metadata/services`
      const reply = await this.$axios.$get(url);
      const categories = [ ]
      let currentCategory = null
      for (const s of reply) {

        // Is this a new category?
        if (currentCategory === null || currentCategory.category !== s.category) {
          currentCategory = {
            category: s.category,
            description: s.category_description,
            services: [ ]
          }
          categories.push(currentCategory)
        }

        // Add the service to the category
        currentCategory.services.push(s)
      }
      this.formCategories = categories

    } catch (e) {
      console.log(`e=`, e)
    }
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
      // console.log(`gottaStep()`, step)
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

      // Get the description of fields
      const fields = this.fieldDescriptions
      for (const f of fields) {
        // console.log(`f=`, f)
        if (typeof(clone[f.name]) === 'undefined') {

          // Set a default value
          // console.log(`SETTING ${f.name}`)
          switch (f.type) {
            case 'checkbox':
              clone[f.name] = false
              break

            case 'text':
            case 'textarea':
            default:
              clone[f.name] = ''
              break
          }
        }
        const value = clone[f.name]
        // console.log(`value=`, value)
        this.fieldValues[f.name] = (typeof(value) === 'undefined') ? '' : value
      }
      this.originalJson = JSON.stringify(clone, '', 4)
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
          this.json = JSON.stringify(obj, '', 4)
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
    
    onBlurField: function (field) {
      console.log(`onBlurField: field=`, field)

      const newValue = this.fieldValues[field.name]
      console.log(`newValue=`, newValue)

      try {
        const obj = JSON.parse(this.json)
        obj[field.name] = newValue
        this.json = JSON.stringify(obj, '', 2)
        // console.log(`this.json=`, this.json)
        this.onBlur()
      } catch (e) {
        console.log(`e=`, e)
      }
    },

    onBlurStandardForm: function (field) {
      console.log(`onBlurStandardForm: field=`, field)

      const newValue = this.fieldValues[field.name]
      console.log(`newValue=`, newValue)

      try {
        const obj = JSON.parse(this.json)
        obj[field.name] = newValue
        this.json = JSON.stringify(obj, '', 2)
        // console.log(`this.json=`, this.json)
        this.onBlur()
      } catch (e) {
        console.log(`e=`, e)
      }
    },

    isValidStepType(stepType) {
      return this.validStepTypes[stepType] ? true : false
    },

    stepHasDefinition(stepType) {

      const type = this.validStepTypes[stepType]
      // console.log(`type=`, type)
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

  .my-field {
    margin-bottom: 25px;
  }
}//- .my-stepbox
</style>
