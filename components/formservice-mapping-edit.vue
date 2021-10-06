<template lang="pug">
.formservice-mapping-edit
    //- b-modal(v-model="isModalActive", :width="640", scroll="keep")
    .card
      header.card-header
        p.card-header-title Mapping
      .card-content
        .content
          //- | tmp.field: {{tmp.field}}
          b-field(label="Field", horizontal, :message="nameMessage", :type="problemWithName ? 'is-danger' : ''")
            b-select(v-model="tmp.field", placeholder="Choose the field to set")
              option(
                  v-for="field in targetView.fields"
                  v-if="!field.name.startsWith('unmapped#')"
                  :value="field.name"
                  :key="field.name"
                  :disabled="fieldAlreadyMapped(field.name)"
                  )
                | {{ field.name }}
          b-field(label="Operation", horizontal)
            //- b-input(v-model="tmp.converter")
            b-select(v-model="tmp.converter", placeholder="Choose how to set this value")
              option(
                  v-for="converter in converters"
                  :value="converter.converter"
                  :key="converter.converter"
                  )
                | {{ converter.description }}
          b-field(label="Source", horizontal)
            b-input(v-model="tmp.source")

          //- pre
          //-   | {{tmp}}

      footer.card-footer
        a.card-footer-item(href="#", card-footer-item, @click="doUpdate") Update
        a.card-footer-item(href="#", card-footer-item, @click="doUnmap") Unmap
        a.card-footer-item(href="#", card-footer-item, @click="doDelete") Delete
        a.card-footer-item(href="#", card-footer-item, @click="doCancel") Cancel

</template>

<script>
export default {
  props: {
    mapping: Array, // [{ name, convertor, source }]
    field: String,
    targetView: Object, // view-definition
    sourceViews: Object, // [ { name1: view-definition, name2: view-definition ... } ]
  },
  data: () => {
    return {
      currentMapping: Object, // { name, convertor, source }

      // Temporary values
      tmp: {
        originalField: '',
        field: '',
        converter: '',
        source: '',
      },
      currentField: null, // Field details, from targetView, for currently selected fieldName.

      // Lookups
      // ZZZZ Should come from DB
      converters: [
        {
          converter: 'copy',
          description: 'Copy from a source',
        },
        {
          converter: 'literal',
          description: 'Set to a predefined value',
        },
        {
          converter: 'skip',
          description: 'Do not set this value (yet)',
        },
        {
          converter: 'toWuDate',
          description: 'Convert TO Western Union date format',
        },
        {
          converter: 'fromWuDate',
          description: 'Convert FROM Western Union date format',
        },
      ],

      // Errors and messages for under fields
      typeMessage: '',
      nameMessage: '',

      problemWithName: false,
    };
  },

  mounted: async function () {
    // console.log(`formservice-mapping.mounted()`)
    // console.log(`this.mapping=`, this.mapping)
    // console.log(`this.field=`, this.field)

    // console.log(`this.targetView=`, this.targetView)
    console.log(`this.sourceViews=`, this.sourceViews)

    // Find the mapping for this field
    for (const m of this.mapping) {
      console.log(`m=`, m)
      if (m.field === this.field) {
        // console.log(`FOUND MAPPING`)
        this.currentMapping = m
      }
    }
    if (this.currentMapping === null) {
      // console.log(`NEW MAPPING`)
      this.currentMapping = { field: '', converter: 'copy', source: '' }
    }
    // console.log(`this.currentMapping=`, this.currentMapping)


    this.tmp.originalField = this.currentMapping.field
    this.tmp.field = this.currentMapping.field
    this.tmp.converter = this.currentMapping.converter
    this.tmp.source = this.currentMapping.source

    this.checkFieldName()

    this.isModalActive = true
  },

  methods: {

    checkFieldName: function() {
      console.log(`checkFieldName(${this.tmp.field})`)
      const fieldName = this.tmp.field
      for (const field of this.targetView.fields) {
        if (field.name === fieldName) {
          console.log(`Found field`)
          this.currentField = field
          if (this.tmp.field.startsWith('unmapped#')) {
            this.nameMessage = ``
            this.problemWithName = false
          } else {
            this.nameMessage = `     [type=${field.type}, label=${field.label}]`
            this.problemWithName = false
          }
          return field
        }
      }
      console.log(`field not found`)
      this.currentField = null
      this.nameMessage = `Unknown field: ${this.tmp.field}`
      this.problemWithName = true
      return null
    },

    fieldAlreadyMapped: function (fieldName) {
      for (const m of this.mapping) {
        if (m.field === fieldName) {
          return true
        }
      }
      return false
    },

    // checkName: function() {
    //   // console.log(`checkName - ${this.tmp.name}`)

    //   // See if another field has this name
    //   for (const existingField of this.view.fields) {
    //     if (existingField.name === this.tmp.name && existingField._id !== this.tmp._id) {
    //       this.nameMessage = 'This name is already used'
    //       this.problemWithName = true
    //       return
    //     }
    //   }
    //   this.nameMessage = ''
    //   this.problemWithName = false
    // },

    // changeType: function(value) {
    //   // console.log(`Type changed to ${value}.`)
    //   for (const option of this.fieldTypes) {
    //     if (option.type === value) {
    //       this.typeMessage = '      The field will contain ' + option.description
    //       return
    //     }
    //   }
    // },

    doUpdate: function() {
      // console.log(`formservice-mapping-edit.doUpdate()`)

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
      this.$emit('update', this.tmp)
      // this.$parent.$parent.$emit('save', this.tmp)
      // this.$parent.$parent.$emit('updateField', this.tmp)

      // this.$parent.close()
    },

    doUnmap: function() {
      // console.log(`formservice-mapping-edit.doCancel()`)
      this.$emit('unmap', this.tmp)
    },

    doDelete: function() {
      // console.log(`formservice-mapping-edit.doDelete()`)
      this.$emit('delete', this.tmp)
    },

    doCancel: function() {
      // console.log(`formservice-mapping-edit.doCancel()`)
      this.$emit('cancel', this.tmp)
    },
  }
};
</script>