<template lang="pug">
.formservice-mapping
  //- .is-pulled-right.is-size-7 {{view}}
  h1.title.is-5 Response from {{provider}} / {{service}}

  //- | stdView: {{stdView}}

  b-table.my-table.is-size-7(v-if="stdView", :data="stdView.fields", @click="editMapping", hoverable)
    b-table-column(field="name", label="Target field", v-slot="props")
      span(v-if="mappingType(props.row.name) === 'mapped'")
        | {{props.row.name}}
      .has-text-grey-light(v-else-if="mappingType(props.row.name) === 'unmapped'")
        | &nbsp;&nbsp;&nbsp;&nbsp; - not mapped
      .has-text-grey-light(v-else)
        | &nbsp;&nbsp;&nbsp;&nbsp; - was mapped to an unknown field ({{mappingType(props.row.name)}})

    b-table-column(field="", label="", v-slot="props")
      b-icon(v-if="isMapped(props.row.name)", icon="arrow-left", size="is-small", centered, width="20")
    b-table-column(field="_converter", label="Operation", centered, width="100", v-slot="props")
      | {{ getConverter(props.row.name) }}
    b-table-column(field="", label="", v-slot="props")
      b-icon(v-if="isMapped(props.row.name)", icon="arrow-left", size="is-small", centered, width="20")
    b-table-column(field="_source", label="Where does this value come from?", v-slot="props")
      | {{ getSource(props.row.name) }}



  // Modal for editing mapping details
  b-modal(v-model="mappingModalActive", :width="640", scroll="keep")
    formservice-mapping-edit(
      v-if="mappingDef"
      :mapping="mapping"
      :field="mappingDef.field"
      :targetView="stdView",
      :sourceViews="sourceViews"
      v-on:update="updateMapping",
      v-on:unmap="unmapMapping",
      v-on:delete="deleteMapping"
      v-on:cancel="cancelMappingEdit"
    )

  //- pre
    | {{JSON.stringify(mapping, '', 2)}}

  br
  br
  br
  br
  br
  br
  br
  br
  br
  br
  br
  br
  br
  br
  br
  br
  br
  br
  br
  </template>

<script>
import FormserviceMisc from '../lib/formservice-misc'

const UNMAPPED_PREFIX = 'unmapped#'
const NO_FIELD_PREFIX = 'unmapped#nofield_'


export default {
  props: {
    provider: String,
    service: String,
    messageType: String,

    view: String,

  },
  data: function () {
    return {
      mappingId: '',
      mapping: [ ],

      stdView: null,
      sourceViews: { },


      mappingModalActive: false,
      mappingDef: null,

      cntUnmap: 0,
    };
  },


  watch: {
    view: async function () { await this.loadMapping() },
    provider: async function () { await this.loadMapping() },
    service: async function () { await this.loadMapping() },
    messageType: async function () { await this.loadMapping() },
  },

  mounted: async function() {
    // this.positionArrows()
    this.loadMapping()
  },


  methods: {

    loadMapping: async function() {
      // console.log(`formservice-mapping-response.loadMapping() --- START`)

      // // Load the required views.
      this.stdViewname = FormserviceMisc.viewName('std', this.service, 'response')
      const stdView = await FormserviceMisc.getView(this.stdViewname)

      // const authViewname = FormserviceMisc.viewName('auth', this.service, this.messageType)
      // try {
      //   this.sourceViews.auth = await FormserviceMisc.getView(authViewname)
      // } catch (e) {
      //   console.log(`e=`, e)
      //   alert(`Could not load view definition: ${authViewname}`)
      // }

      // const utilViewname = FormserviceMisc.viewName('util', this.service, this.messageType)
      // try {
      //   this.sourceViews.utilView = await FormserviceMisc.getView(utilViewname)
      // } catch (e) {
      //   console.log(`e=`, e)
      //   alert(`Could not load view definition: ${utilViewname}`)
      // }

      const backendViewname = FormserviceMisc.viewName(this.provider, this.service, this.messageType)
      try {
        const createIfNotFound = true
        this.sourceViews.backendView = await FormserviceMisc.getView(backendViewname, createIfNotFound)
      } catch (e) {
        console.log(`e=`, e)
        alert(`Could not load view definition: ${backendViewname}`)
      }

      // Load the mapping
      this.mappingId = FormserviceMisc.mappingId(this.provider, this.service, this.messageType)
      this.mapping = await FormserviceMisc.getMapping(this.mappingId)

      // Add the mappings to the view
      for (const map of this.mapping) {
        const field = findViewField(stdView, map.field, false)
        if (!field) {
          const dummyField = `${UNMAPPED_PREFIX}${map.field}`
          map.field = dummyField
          stdView.fields.push({ name: dummyField })
        }
      }
      this.stdView = stdView
      // console.log(`formservice-mapping-response.loadMapping() --- END`)
    },//- loadMapping


    isMissingField: function(fieldName) {
      return fieldName.startsWith(UNMAPPED_PREFIX)
    },

    actualFieldName: function (fieldName) {
      if (fieldName.startsWith(UNMAPPED_PREFIX)) {
        fieldName = fieldName.substring(UNMAPPED_PREFIX.length)
      }
      return fieldName
    },

    mappingType: function (fieldName) {
      // console.log(`mappingType(${fieldName})`)

      if (fieldName.startsWith(NO_FIELD_PREFIX)) {
        return 'unmapped'
      } else if (fieldName.startsWith(UNMAPPED_PREFIX)) {
        // console.log(`fieldName=`, fieldName)
        return fieldName.substring(UNMAPPED_PREFIX.length)
      }
      return 'mapped'
    },

    isMapped: function (fieldName) {
      // fieldName = this.actualFieldName(fieldName)
      for (const map of this.mapping) {
        if (map.field === fieldName) {
          return true
        }
      }
      return false
    },

    getConverter: function (fieldName) {
      // fieldName = this.actualFieldName(fieldName)
      for (const map of this.mapping) {
        if (map.field === fieldName) {
          return map.converter
        }
      }
      return ''
    },

    getSource: function (fieldName) {
      // fieldName = this.actualFieldName(fieldName)
      for (const map of this.mapping) {
        if (map.field === fieldName) {
          return map.source
        }
      }
      return ''
    },

    /**
     * Edit the clicked-on row in a dialog box.
     */
    editMapping: function (row) {
      // console.log(`editMapping()`, row)
        if (row.map) {
      this.mappingDef = row.map
      } else {
        this.mappingDef = {
          field: row.name,
          converter: '',
          source: '',
        }
      }
      this.mappingModalActive = true
    },

    updateMapping: async function (mapping) {
      // console.log(`updateMapping()`, mapping)
      this.mappingModalActive = false

      // See if the target field has changed, and it was a dummy field
      if (mapping.field !== mapping.originalField && mapping.originalField.startsWith(UNMAPPED_PREFIX)) {
        // Unmapped - remove the dummy field
        for (let i = 0; i < this.stdView.fields.length; i++) {
          const f = this.stdView.fields[i]
          if (f.name === mapping.originalField) {
            this.stdView.fields.splice(i, 1)
            break
          }
        }
      }

      /*
       *  Map to different field
       */
      // console.log(`- map to different field`)
      for (const m of this.mapping) {
        if (m.field === mapping.originalField) {
          m.field = mapping.field
          m.converter = mapping.converter
          m.source = mapping.source
          break
        }
      }

    },
    unmapMapping: async function (mapping) {
      // console.log(`unmapMapping()`, mapping)
      this.mappingModalActive = false

      for (const m of this.mapping) {
        if (m.field === mapping.originalField && !mapping.originalField.startsWith(UNMAPPED_PREFIX)) {
          // console.log(`FOUND MAPPING`)
          const dummyField = `${NO_FIELD_PREFIX}${this.cntUnmap++}`
          m.field = dummyField
          this.stdView.fields.push({ name: dummyField })
          break
        }
      }
    },

    deleteMapping: async function (mapping) {
      // console.log(`deleteMapping()`, mapping)
      this.mappingModalActive = false

      for (let i = 0; i < this.mapping.length; i++) {
        const m = this.mapping[i]
        if (m.field === mapping.originalField) {
          this.mapping.splice(i, 1)
          break
        }
      }
      if (mapping.originalField.startsWith(UNMAPPED_PREFIX)) {
        // remove the dummy field
        for (let i = 0; i < this.stdView.fields.length; i++) {
          const f = this.stdView.fields[i]
          if (f.name === mapping.originalField) {
            this.stdView.fields.splice(i, 1)
            break
          }
        }
      }
    },

    cancelMappingEdit: async function (mapping) {
      // console.log(`cancelMappingEdit()`)
      this.mappingModalActive = false
    },

  },//- methods

};

/**
 * Find a field in a view definition.
 * If createIfNotFound is true, add a new "missing field" if it is not found.
 */
function findViewField (view, fieldName, createIfNotFound) {
  // console.log(`findViewField(${fieldName}, ${createIfNotFound})`)
  for (const f of view.fields) {
    // console.log(`  -> ${f.name}`)
    if (f.name === fieldName) {
      // console.log(`  FOUND`)
      return f
    }
  }
  // console.log(`NOT FOUND`)
  if (createIfNotFound) {
    // console.log(`ADD MISSING FIELD`)
    const f = {
      name: `${UNMAPPED_PREFIX}${fieldName}`,
      map: { }
    }
    view.fields.push(f)
    return f
  }
  return null
}
</script>


<style lang="scss" scoped>

.formservice-mapping {
  position: relative;
  // font-family: 'Courier New', Courier, monospace;
  font-family: Arial, Helvetica, sans-serif;
  font-weight: 600;
  // color: #101010;
  font-size: 13px;

  // .my-mousemove-overlay {
  //   position: absolute;
  //   z-index: 10000;

  //   background-color: rgba(66, 66, 148, 0.4);
  //   width: 100%;
  //   height: 100%;
  //   // pointer-events: none;
  // }

  .my-overlay {
    position: absolute;
    z-index: +1;

    // background-color: rgba(255, 0, 0, 0.2);
    width: 100%;
    height: 100%;

    .my-svg {
      width: 100%;
      height: 100%;
    }

    &.overlay-active {
      // background-color: rgba(0, 0, 255, 0.05);
      // pointer-events: none;
    }
    &.overlay-inactive {
      pointer-events: none;
    }
  }

  .my-leftList {
    width: 350px;
    // margin-right: 300px;

    .my-row {
      margin-top: 1px;
      // border: solid 1px red;

      .my-text {
        display: inline-block;
        white-space: pre;
        cursor: pointer;
      }
    }
  }

  .my-rightList {
    width: 350px;
    // font-size: 11px;

    .my-row {
      margin-top: 1px;
      // border: solid 1px red;

      .my-indent {
        display: inline-block;
      }

      .my-text {
        display: inline-block;
        // white-space: pre;
        cursor: pointer;
        // background-color: yellow;
      }
    }
  }

  .my-selected-row {
    background-color: yellow;
  }

}
</style>