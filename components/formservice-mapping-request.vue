<template lang="pug">
.formservice-mapping
  .is-pulled-right.is-size-7 {{view}}
  h1.title.is-5 Request for {{provider}} / {{service}}
  //- br
  //- | mapping: {{mappingId}}
  //- br
  //- | {{mapping}}
  //- hr
  //- | stdView:


  //- pre(v-if="backendView")
  //-   | {{backendViewname}}
  //-   br
  //-   | {{JSON.stringify(backendView.fields,'', 2)}}
  //- hr

  b-table.my-table.is-size-7(v-if="backendView"
    :data="backendView.fields",
    hoverable)

    b-table-column(field="_source", label="Where does this value come from?", v-slot="props")
      | {{ props.row._source }}
    b-table-column(field="", centered, label="", width="20", v-slot="props")
      b-icon(icon="arrow-right", size="is-small")
    b-table-column(field="_converter", centered, label="Operation", v-slot="props")
      | {{ props.row._converter }}
    b-table-column(field="", centered, label="", width="20", v-slot="props")
      b-icon(icon="arrow-right", size="is-small")
    b-table-column(field="name", label="Name", v-slot="props")
      | {{ props.row.name }}

    //- {
    //-   field: '_source',
    //-   label: 'Where does this value come from?'
    //- },
    //- {
    //-   field: '_converter',
    //-   label: 'Converter'
    //- },
    //- {
    //-   field: 'name',
    //-   label: 'Name'
    //- },





    //- :columns="mappingColumns",
    //- ,
    //- @ZZclick="editRow")
    //- ,
    //- draggable
    //- @dragstart="dragstart"
    //- @drop="drop"
    //- @dragover="dragover"
    //- @dragleave="dragleave"
  //- )
  //- hr
  //- b-table.my-table.is-size-7(
    :data="badMappings",
    :columns="responseColumns",
    hoverable)



  //- b-table(v-if="messageType.toLowerCase().indexOf('request')>=0", :data="currentView.mapping", :columns="mappingRequestColumns")
  //- b-table(v-else, :data="currentView.mapping", :columns="mappingResponseColumns")


  br
  //- | {{overlayClass()}}, {{arrowBeingMoved}}
  //- .my-mousemove-overlay(@mousemove="mousemove")
  //- .my-frame(ref="myframe")
    .my-overlay(@mousemove="mousemove", @mouseup="upOnOverlay", :class="overlayClass()")
      svg.my-svg(id="svgelem", zheight="200", xmlns="http://www.w3.org/2000/svg")
        defs
          marker(id="arrowhead" markerWidth="10" markerHeight="7", refX="10" refY="3.5" orient="auto")
            polygon(points="0 0, 10 3.5, 0 7", fill="lightblue")
        //- circle(id="redcircle", cx="5", cy="5", r="5" fill="blue")
        line(v-for="arrow in arrows", :x1="arrow.x1", :y1="arrow.y1", :x2="arrow.x2", :y2="arrow.y2", style="stroke:lightblue;stroke-width:1;stroke-dasharray=\"1,6\";",  marker-end="url(#arrowhead)")

    .columns
      .column
        h1.title.is-6 Standard fields
        .my-leftList(v-for="row,index in leftRows")
          .my-row
            .my-indent(:style="indentStyle(row)")
            .my-text(:ref="row.id", :id="row.id", @mousedown="downOnRow(-(index+1))", @mouseup="upOnRow", :class="{ 'my-selected-row': (row.id == selectedRowId) }")
              | {{ row.text }}
              //- | {{ row.text }} = {{row.id}}

      .column
        h1.title.is-6 Backend fields
        .my-rightList(v-for="row,index in rightRows")
          .my-row
            .my-indent(:style="indentStyle(row)")
            .my-text(:ref="row.id", :id="row.id", @mousedown="downOnRow(index+1)", @mouseup="upOnRow", :class="{ 'my-selected-row': (row.id == selectedRowId) }")
              | {{ row.text }}
              //- | {{ row.text }} = {{row.id}}

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

      // Names of views
      stdViewname: null,
      authViewname: null,
      utilViewname: null,
      backendViewname: null,

      // View definitions
      stdView: null,
      backendView: null,

      // Columns in the table
      mappingColumns: [
        {
          field: '_source',
          label: 'Where does this value come from?'
        },
        {
          field: '_converter',
          label: 'Converter'
        },
        {
          field: 'name',
          label: 'Name'
        },

        // {
        //   field: 'label',
        //   label: 'Label'
        // },
        // {
        //   field: 'type',
        //   label: 'Type'
        // },
        // {
        //   field: 'properties.isMandatory',
        //   label: 'Mandatory'
        // },
      ],

      // responseColumns: [
      //   {
      //     field: 'field',
      //     label: 'Field'
      //   },
      //   {
      //     field: 'converter',
      //     label: 'Converter'
      //   },
      //   {
      //     field: 'source',
      //     label: 'Where does this value come from?'
      //   }
      // ],

    };
  },

  // created: function () {
  //   // console.log(`created()`);

  //   // Prepare the rows on the left
  //   let objLeft = JSON.parse(this.dataLeft)
  //   // objLeft = this.testDataLeft
  //   const json = JSON.stringify(objLeft, '', 4)
  //   const arr = json.split('\n')
  //   for (const l of arr) {
  //     this.leftRows.push({
  //       id: -(this.leftRows.length + 1), // -1, -2, -3... (no zero)
  //       text: l,
  //       left: 0,
  //       right: 0,
  //       top: 0,
  //       bottom: 0,
  //     })
  //   }

  //   // Prepare the rows on the right
  //   let objRight = JSON.parse(this.dataRight)
  //   objRight = this.testDataRight
  //   const jsonRight = JSON.stringify(objRight, '', 4)
  //   const arrRight = jsonRight.split('\n')
  //   for (const l of arrRight) {
  //     this.rightRows.push({
  //       id: this.rightRows.length + 1, // 1, 2, 3... (no zero)
  //       text: l,
  //       left: 0,
  //       right: 0,
  //       top: 0,
  //       bottom: 0,
  //     })
  //   }
  // },

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
      console.log(`formservice-mapping-request.loadMapping() --- START`)

      // Load all the views that may be involved in the mapping.
      this.stdViewname = FormserviceMisc.viewName('std', this.service, 'response')
      this.authViewname = FormserviceMisc.viewName('auth', this.service, this.messageType)
      this.utilViewname = FormserviceMisc.viewName('util', this.service, this.messageType)
      this.backendViewname = FormserviceMisc.viewName(this.provider, this.service, this.messageType)

      const stdView = await FormserviceMisc.getView(this.stdViewname)
      // // this.authView = await FormserviceMisc.getView(this.authViewname)
      // // this.utilView = await FormserviceMisc.getView(this.utilViewname)
      const backendView = await FormserviceMisc.getView(this.backendViewname)

      // Get the mapping
      this.mappingId = FormserviceMisc.mappingId(this.provider, this.service, this.messageType)
      this.mapping = await FormserviceMisc.getMapping(this.mappingId)

      // Create an index of standard fields
      const index = { }
      for (const field of backendView.fields) {
        index[field.name] = field
      }

      // Add the mappings to the view
      for (const map of this.mapping) {
        let field = index[map.field]
        if (!field) {
          field = {
            // name: `[${map.name}]`,
            name: `&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Unknown field &nbsp;&nbsp; (${map.field})`,
          }
          backendView.fields.push(field)
        }
        field._name = map.name
        field._converter = map.converter
        field._source = map.source
      }
      // console.log(`this.stdView.fields=`, JSON.stringify(stdView.fields, '', 2))
      this.stdView = stdView
      this.backendView = backendView
      console.log(`formservice-mapping-request.loadMapping() --- END`)
    },//- loadMapping

  },
};
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