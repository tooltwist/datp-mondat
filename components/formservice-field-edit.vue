<template lang="pug">
.formservice-field-edit
    //- b-modal(v-model="isModalActive", :width="640", scroll="keep")
    .card
      header.card-header
        //- p.card-header-title Field Properties {{tmp._id}}
        p.card-header-title Field Properties
      .card-content
        //- <div class="media">
        //-     <div class="media-left">
        //-         <figure class="image is-48x48">
        //-             <img src="/static/img/placeholder-1280x960.png" alt="Image">
        //-         </figure>
        //-     </div>
        //-     <div class="media-content">
        //-         <p class="title is-4">John Smith</p>
        //-         <p class="subtitle is-6">@johnsmith</p>
        //-     </div>
        //- </div>

        .content
          //- formservice-field-editor(:view="viewDef", :field="fieldDef")

          //- pre
            //- | {{view}}
            | {{field}}
            //- hr
            | {{tmp}}
          //- | pwn: {{problemWithName}}

          b-field(label="Name", horizontal, :message="nameMessage", :type="problemWithName ? 'is-danger' : ''")
            b-input(v-model="tmp.name", @input="checkName")
          b-field(label="Label", horizontal)
            b-input(v-model="tmp.label")
          b-field(label="Type", horizontal, :message="typeMessage")
            b-select(v-model="tmp.type", placeholder="Select a type", @input="changeType")
              option(
                  v-for="option in fieldTypes"
                  :value="option.type"
                  :key="option.type"
                  )
                | {{ option.type }}
          b-field(label="Example", horizontal)
            b-input(v-model="tmp.exampleValue")
          b-field(label="Default", horizontal)
            b-input(v-model="tmp.defaultValue")
          //- b-field(label="Database column", horizontal)
          //-   b-input(v-model="tmp.columnName")

          //- b-field(horizontal, v-if="true")
          //-   b-checkbox(v-model="tmp.properties.isPrimaryKey") Is Primary Key
          //- b-field(horizontal)
          //-   b-checkbox(v-model="tmp.properties.isDescription") Is Description
          b-field(horizontal)
            b-checkbox(v-model="tmp.properties.isMandatory") Mandatory
          //- b-field(horizontal)
          //-   b-checkbox(v-model="tmp.properties.readonly") Readonly
          //- b-field(horizontal, v-if="tmp.type==='date' || tmp.type==='time' || tmp.type==='timestamp'")
          //-   b-checkbox(v-model="tmp.properties.fromNow") Displayed as relative to now (e.g. 2 days ago)
          //- b-field(horizontal, v-if="tmp.type === 'number'")
            b-checkbox(v-model="tmp.properties.dollars2") $000.00
          b-field(label="Values", horizontal)
            b-input(v-model="tmp.allowableValues")

      footer.card-footer
        a.card-footer-item(href="#", card-footer-item, @click="doSave") Save
        a.card-footer-item(href="#", card-footer-item, @click="doCancel") Cancel
        a.card-footer-item(href="#", card-footer-item, @click="doDelete") Delete

</template>

<script>
import axios from 'axios'
import FormserviceMisc from '../lib/formservice-misc'

export default {
  props: {
    view: Object,
    field: Object,
  },
  data: () => {
    return {
      fieldTypes: [
        {
          type: 'string',
          description: 'a text value'
        },
        // {
        //   type: 'number',
        //   description: 'a numeric value'
        // },
        {
          type: 'integer',
          description: 'an integer value'
        },
        {
          type: 'float',
          description: 'a floating point value'
        },
        {
          type: 'amount',
          description: 'Financial amount in cents, centavos, etc'
        },
        {
          type: 'amount3',
          description: 'Financial amount as 3 part object'
        },
        {
          type: 'boolean',
          description: 'either true or false'
        },
        {
          type: 'date',
          description: 'a date'
        },
        {
          type: 'time',
          description: 'a time (HH:MM:SS)'
        },
        {
          type: 'timestamp',
          description: 'both date and time'
        },
      ],

      // isModalActive: false,

      // Temporary values
      tmp: {
        _id: -1,
        name: '',
        label: '',
        exampleValue: '',
        defaultValue: '',
        properties: {
          // Phil: We need at least one property, or 'properties' goes missing.
          isPrimaryKey: false,
          mandatory: false,
        },
        allowableValues: ''
      },

      // Errors and messages for under fields
      // nameMessage: '',
      typeMessage: '',
      nameMessage: 'This name is already used',
      problemWithName: false,
    };
  },

  mounted: async function () {
    // console.log(`formservice-field.mounted()`)
    // console.log(`  this.field=`, this.field)

    this.tmp._id = this.field._id
    this.tmp.exampleValue = this.field.exampleValue
    this.tmp.defaultValue = this.field.defaultValue
    this.tmp.allowableValues = this.field.allowableValues
    this.problemWithName = false
    this.nameMessage = ''
    FormserviceMisc.mergeInFieldDefinition(this.field, this.tmp)
    // console.log(`this.tmp=`, this.tmp)

    // this.isModalActive = true
  },

  // watch: {

  //   /**
  //    * Called when the 'view' prop changes.
  //    */
  //   view: function(newVal, oldVal) {
  //     this.loadViewDef(newVal)
  //   }
  // },


  methods: {
    checkName: function() {
      // console.log(`checkName - ${this.tmp.name}`)

      // See if another field has this name
      for (const existingField of this.view.fields) {
        if (existingField.name === this.tmp.name && existingField._id !== this.tmp._id) {
          this.nameMessage = 'This name is already used'
          this.problemWithName = true
          return
        }
      }
      this.nameMessage = ''
      this.problemWithName = false
    },

    changeType: function(value) {
      // console.log(`Type changed to ${value}.`)
      for (const option of this.fieldTypes) {
        if (option.type === value) {
          this.typeMessage = '      The field will contain ' + option.description
          return
        }
      }
    },

    doSave: function() {
      // console.log(`formservice-field-edit.doSave()`)

      if (this.problemWithName) {
        this.$buefy.toast.open({ message: 'Please check the name', type: 'is-danger' })
        return
      }
      // this.field.name = this.tmp.name
      // this.field.label = this.tmp.label
      // this.field.type = this.tmp.type
      // this.field.columnName = this.tmp.columnName
      // this.field.properties.isPrimaryKey = this.tmp.isPrimaryKey ? true : false
      // this.field.properties.isDescription = this.tmp.isDescription ? true : false
      // this.field.properties.isMandatory = this.tmp.isMandatory ? true : false
      // this.field.properties.readonly = this.tmp.readonly ? true : false
      // this.field.properties.dollars2 = this.tmp.dollars2 ? true : false

      // this.field._sequence++ // force re-display
      // console.log(`this.field._sequence=`, this.field._sequence)

      // Pass the details to the parent of the modal
      this.$emit('save', this.tmp)
      // this.$parent.$parent.$emit('save', this.tmp)
      // this.$parent.$parent.$emit('updateField', this.tmp)

      // this.$parent.close()
    },

    doCancel: function() {
      // console.log(`formservice-field-edit.doCancel()`)
      this.$emit('cancel', this.tmp)
    },

    doDelete: function() {
      // console.log(`formservice-field-edit.doDelete()`)
      this.$emit('delete', this.tmp)
    },
  }
};
</script>