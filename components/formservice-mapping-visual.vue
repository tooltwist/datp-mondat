<template lang="pug">
.formservice-mapping
  //- h1.title.is-size-7
  //- .is-size-5 Mapping: {{provider}} / {{service}} / {{messageType}}
  //- .is-size-7 {{backendViewname}}
  //- br
  //- div provider: {{provider}}
  //- div service: {{service}}
  //- div message type: {{messageType}}


  br
  //- | {{overlayClass()}}, {{arrowBeingMoved}}
  //- .my-mousemove-overlay(@mousemove="mousemove")
  .my-frame(ref="myframe")
    .my-overlay(@mousemove="onMousemove", @mouseup="upOnOverlay", :class="overlayClass()")
      svg.my-svg(id="svgelem", zheight="200", xmlns="http://www.w3.org/2000/svg")
        defs
          marker(id="arrowhead" markerWidth="10" markerHeight="7", refX="10" refY="3.5" orient="auto")
            polygon(points="0 0, 10 3.5, 0 7", fill="lightblue")
        //- circle(id="redcircle", cx="5", cy="5", r="5" fill="blue")
        line(v-for="arrow in arrows", v-show="arrow.visible", :x1="arrow.x1", :y1="arrow.y1", :x2="arrow.x2", :y2="arrow.y2", style="stroke:lightblue;stroke-width:1;stroke-dasharray=\"1,6\";",  marker-end="url(#arrowhead)")

    .columns
      .column
        h1.title.is-6 Standard fields ({{theLeftViewName}})
        .my-leftList(v-for="row,index in leftRows")
          .my-row
            .my-indent(:style="indentStyle(row)")
            .my-text(:ref="refId(row.id)", :id="refId(row.id)", @mousedown="downOnRow(-(index+1))", @mouseup="upOnRow", :class="{ 'my-selected-row': (row.id == selectedRowId) }")
              | {{ row.text }}
              //- | {{ row.text }} = {{row.path}}
              //- | {{ row.text }} = {{refId(row.id)}}

      .column
        h1.title.is-6 Backend fields ({{theRightViewName}})
        .my-rightList(v-for="row,index in rightRows")
          .my-row
            .my-indent(:style="indentStyle(row)")
            .my-text(:ref="refId(row.id)", :id="refId(row.id)", @mousedown="downOnRow(index+1)", @mouseup="upOnRow", :class="{ 'my-selected-row': (row.id == selectedRowId) }")
              | {{ row.text }}
              //- | {{ row.text }} = {{row.path}}
              //- | {{ row.text }} = {{refId(row.id)}}

  br
  br
  .is-pulled-right
    // Without this line the arrows will not display
    span(style="font-size:5px;") {{sequence}}
  hr
  //- br
  //- | id: {{$store.state.viewMapping.mappingId}}
  //- br
  //- | mapping: {{theMapping}}
  //- pre(style="font-size:9px;")
  //-   | {{JSON.stringify(arrows, '', 2)}}
  //- hr
  //- //- pre(style="font-size:9px;")
  //-   | {{JSON.stringify(arrows, '', 2)}}
  //- br
  //- br
  //- br
  //- br
  //- br
  //- br
  //- br
  //- br
  //- br
  //- br
  //- br
  //- br
  //- br
  //- br
  //- br
  //- br
  //- br
  //- br
  //- br
  //- br
  //- br
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
  br
  br
  br
</template>

<script>
import FormserviceMisc from '../lib/formservice-misc'

export default {
  props: {
    view: String,
    // fields: Array,
    // provider: String,
    // service: String,
    messageType: String,

    // This value changes every time the tab is changed.
    checkArrows: Number,
  },
  data: function () {
    return {
      leftRows: [ ],
      rightRows: [ ],

      arrows: [
        // {
        //   leftId: -2,
        //   rightId: +2,
        //   x1: 20,
        //   y1: 80,
        //   x2: 700,
        //   y2: 200,
        // },
      ],

      arrowBeingMoved: 0, // negative=left end, positive=right end, zero=none, subtract one from index

      selectedRowId: 0,

      // We count up this sequence with each update.
      sequence: 0,

      // We pause to give time for the JSON rows to be rendered, so their positions
      // are settled before we position arrows between them.
      intervalTimer: null,
    };
  },

  created: function () {
    // console.log(`created()`);

    // // Prepare the rows on the left
    // let objLeft = JSON.parse(this.dataLeft)
    // // objLeft = this.testDataLeft
    // const json = JSON.stringify(objLeft, '', 4)
    // const arr = json.split('\n')
    // for (const l of arr) {
    //   this.leftRows.push({
    //     id: -(this.leftRows.length + 1), // -1, -2, -3... (no zero)
    //     text: l,
    //     left: 0,
    //     right: 0,
    //     top: 0,
    //     bottom: 0,
    //   })
    // }

    // // Prepare the rows on the right
    // let objRight = JSON.parse(this.dataRight)
    // // objRight = this.testDataRight
    // const jsonRight = JSON.stringify(objRight, '', 4)
    // const arrRight = jsonRight.split('\n')
    // for (const l of arrRight) {
    //   this.rightRows.push({
    //     id: this.rightRows.length + 1, // 1, 2, 3... (no zero)
    //     text: l,
    //     left: 0,
    //     right: 0,
    //     top: 0,
    //     bottom: 0,
    //   })
    // }
  },

  watch: {
    checkArrows: {
      handler() { this.load() }, deep:true
    },
    '$store.state.viewMapping.mapping': {
      handler() { this.load() }, deep:true
    },
    '$store.state.viewMapping.leftView': {
      handler() { this.load() }, deep:true
    },
    '$store.state.viewMapping.rightView': {
      handler() { this.load() }, deep:true
    },
  },

  mounted: async function() {
    this.load()
  },


  computed: {
    theMapping: function () {
      return this.$store.state.viewMapping.mapping
    },

    theLeftView: function () {
      return this.$store.state.viewMapping.leftView
    },

    theLeftViewName: function () {
      return this.$store.state.viewMapping.leftViewName
    },

    theRightView: function () {
      return this.$store.state.viewMapping.rightView
    },

    theRightViewName: function () {
      return this.$store.state.viewMapping.rightViewName
    },
  },

  methods: {

    load: async function () {
      // console.log(`--------------------------------\n\n\n`)
      // console.log(`visual:load()`, this.$store.state.viewMapping.mapping)

      if (this.theRightView === null) {
        return
      }

      const stdObject = FormserviceMisc.fieldsToObject(this.theLeftView.fields, true)
      const backendObject = FormserviceMisc.fieldsToObject(this.theRightView.fields, true)

      // Prepare the rows on the left
      const json = JSON.stringify(stdObject, '', 4)
      const arr = json.split('\n')
      this.leftRows = [ ]
      for (const l of arr) {
        const { line, path } = FormserviceMisc.unscrambleLineOfJson(l)
        this.leftRows.push({
          id: -(this.leftRows.length + 1), // -1, -2, -3... (no zero)
          text: line,
          path: path,
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
        })
      }

      // Prepare the rows on the right
      const jsonRight = JSON.stringify(backendObject, '', 4)
      const arrRight = jsonRight.split('\n')
      this.rightRows = [ ]
      for (const l of arrRight) {
        const { line, path } = FormserviceMisc.unscrambleLineOfJson(l)
        this.rightRows.push({
          id: +(this.rightRows.length + 1), // 1, 2, 3... (no zero)
          text: line,
          path: path,
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
        })
      }

      // // Create the arrows
      const mapping = this.$store.state.viewMapping.mapping
      const arrows = [ ]
      for (const map of mapping) {
        // console.log(`--------`)
        // console.log(`map=`, map)
        const arrow = {
          visible: true
        }
        // Find the left field (source)
        const sourcePrefix = 'request:'
        if (map.source.startsWith(sourcePrefix)) {
          let source = map.source.substring(sourcePrefix.length)
          for (let i = 0; i < this.leftRows.length; i++) {
            const row = this.leftRows[i]
            // console.log(`  <-- ${row.path}`)
            if (row.path === source) {
              // console.log(`FOUND LEFT MAP (source) ${i+1}`)
              arrow.leftId = -(i + 1)
            }
          }
        }
        // Find the right field (toField)
        for (let i = 0; i < this.rightRows.length; i++) {
          const row = this.rightRows[i]
            // console.log(`  --> ${row.path}`)
          if (row.path === map.field) {
            // console.log(`FOUND RIGHT MAP (field) ${i+1}`)
            arrow.rightId = i + 1
          }
        }
        // console.log(`arrow=`, arrow)
        if (arrow.leftId && arrow.rightId) {
          arrows.push(arrow)
        }
      }
      this.arrows = arrows
      this.positionArrowsInAWhile()
    },

    positionArrowsInAWhile: function () {
      if (this.intervalTimer === null) {
        this.intervalTimer = setTimeout(() => {
          // console.log(`positioning after delay`)
          this.intervalTimer = null
          this.positionArrows()
          this.sequence++
        }, 100)
      }
    },

    positionArrows: function() {
      // console.log(`positionArrows()`, this.$refs)

      const frameBox = this.$refs.myframe.getBoundingClientRect()

      // Set row coordinates
      for (const row of this.leftRows) {
        const refId = this.refId(row.id)
        const refs = this.$refs[refId]
        if (!refs) {
          // The DOM element is not created yet
          console.log(`$ref has not been created yet`)
          return
        }
        const left = refs[0]
        const rect = left.getBoundingClientRect()
        row.top = rect.top - frameBox.top
        row.bottom = rect.bottom - frameBox.top
        row.left = rect.left - frameBox.left
        row.right = rect.right - frameBox.left
      }
      for (const row of this.rightRows) {
        const refId = this.refId(row.id)
        const refs = this.$refs[refId]
        if (!refs) {
          // The DOM element is not created yet
          console.log(`$ref has not been created yet`)
          return
        }
        const right = refs[0]
        const rect = right.getBoundingClientRect()
        row.top = rect.top - frameBox.top
        row.bottom = rect.bottom - frameBox.top
        row.left = rect.left - frameBox.left
        row.right = rect.right - frameBox.left
      }

      // Set arrow coordinates
      for (const arrow of this.arrows) {
        // console.log(`arrow - ${''+arrow.leftId}`)
        arrow.visible = true


        // From left-side row
        const elementId = this.refId(arrow.leftId)
        const elements = this.$refs[elementId]
        if (!elements || elements.length === 0) {
          console.log(`Missing arrow left element (${arrow.leftId})`)
          arrow.visible = false
          continue
        }
        const left = elements[0]
        const rect = left.getBoundingClientRect()
        arrow.x1 = rect.right - frameBox.left + 3
        arrow.y1 = (rect.top+rect.bottom)/2 - frameBox.top

        // To right-side row
        const elementId2 = this.refId(arrow.rightId)
        const elements2 = this.$refs[elementId2]
        if (!elements2 || elements2.length === 0) {
          console.log(`Missing arrow right element (${arrow.rightId})`)
          arrow.visible = false
          continue
        }
        const right = elements2[0]
        const rect2 = right.getBoundingClientRect()
        arrow.x2 = rect2.left - frameBox.left - 3
        arrow.y2 = (rect2.top+rect2.bottom)/2 - frameBox.top + 1
      }
    },

    downOnRow: function(rowId) {
      // console.log(`downOnRow(${rowId})`)
      if (rowId < 0) {
        // Left side row - find the arrow
        let foundArrow = 0
        for (const [arrowIndex, arrow] of this.arrows.entries()) {
          if (arrow.leftId === rowId) {
            this.arrowBeingMoved = -(arrowIndex + 1) // Because it's on the left
            foundArrow = -(arrowIndex + 1) // Because it's on the left
            break
          }
        }
        if (!foundArrow) {
          // console.log(`New arrow`)
          const leftRow = this.leftRows[(-rowId) - 1]
          const newArrow = {
            leftId: rowId,
            rightId: 0,
            visible: true,
            x1: leftRow.right,
            y1: (leftRow.top + leftRow.bottom) / 2,
            x2: leftRow.right,
            y2: (leftRow.top + leftRow.bottom) / 2,
          }
          // console.log(`newArrow=`, newArrow)
          this.arrows.push(newArrow)
          this.arrowBeingMoved = this.arrows.length
          // console.log(`this.arrowBeingMoved=`, this.arrowBeingMoved)
        }
      } else if (rowId > 0) {
        // Right side row - find the arrow
        for (const [arrowIndex, arrow] of this.arrows.entries()) {
          if (arrow.rightId === rowId) {
            this.arrowBeingMoved = arrowIndex + 1
            break
          }
        }
      }
      return false
    },

    upOnRow: function() {
      // console.log(`upOnRow()`)
    },

    upOnOverlay: async function() {
      // console.log(`upOnOverlay()`)
      // const mappingId = this.backendViewname
      const mappingId = this.theRightViewName

      if (this.selectedRowId !== 0) {
        // console.log(`**** ADD`)

        // Have a selected row
        let arrowIndex
        let arrow
        if (this.arrowBeingMoved > 0) {
          // Right end
          arrowIndex = this.arrowBeingMoved - 1
          arrow = this.arrows[arrowIndex]
          arrow.rightId = this.selectedRowId
        } else if (this.arrowBeingMoved < 0) {
          // Left end
          arrowIndex = (-this.arrowBeingMoved) - 1
          arrow = this.arrows[arrowIndex]
          arrow.leftId = this.selectedRowId
        }
        const fromIndex = (-arrow.leftId) - 1 // Non-zero negative indexes (-1=>0, -2=>1, -3=>2 etc)
        const toIndex = arrow.rightId - 1 // Non-zero positive indexes (1=>0, 2=>1, 3=>2 etc)
        // console.log(`fromIndex=`, fromIndex)
        // console.log(`toIndex=`, toIndex)

        // Set the mapping to the right side field
        if (fromIndex < this.leftRows.length && toIndex < this.rightRows.length) {
          const from = 'request:' + this.leftRows[fromIndex].path
          const to = this.rightRows[toIndex].path
          // console.log(`from=`, from)
          // console.log(`to=`, to)
          await FormserviceMisc.addMapping(this.$formserviceEndpoint, mappingId, -1, to, from, null)

          // Delete any arrow already pointing to the same right side
          // console.log(`arrowBeingMoved=`, this.arrowBeingMoved)
          for (let i = this.arrows.length - 1; i >= 0; i--) {
            const arrow2 = this.arrows[i]
            // console.log(`${i}: arrow2=`, arrow2)
            if (i === arrowIndex) {
              // console.log(`CURRENT ARROW`)
            } else {
              // console.log(`OTHER ARROW ${arrow2.rightId}`)
              if (arrow2.rightId === arrow.rightId) {
                // console.log(`  - DELETE ARROW`)
                this.arrows.splice(i, 1)
              }
            }
          }

          // All done - reload the mapping.
          this.selectedRowId = 0
          this.arrowBeingMoved = 0
          this.$store.dispatch('viewMapping/reloadMapping')
          return
        }
      }

      // No selected row, or broken link, so delete the arrow
      let toIndex = -1
      if (this.arrowBeingMoved > 0) {
        // Right end
        // console.log(`**** DELETE 1`)
        const arrowIndex = this.arrowBeingMoved - 1
        const arrow = this.arrows[arrowIndex]
        toIndex = arrow.rightId - 1 // Non-zero positive indexes (1=>0, 2=>1, 3=>2 etc)
        this.arrows.splice(arrowIndex, 1)
      } else if (this.arrowBeingMoved < 0) {
        // Left end
        // console.log(`**** DELETE 2`)
        const arrowIndex = (-this.arrowBeingMoved) - 1
        const arrow = this.arrows[arrowIndex]
        toIndex = arrow.rightId - 1 // Non-zero positive indexes (1=>0, 2=>1, 3=>2 etc)
        this.arrows.splice(arrowIndex, 1)
      }

      if (toIndex >= 0 && toIndex < this.rightRows.length) {
        // console.log(`YARP 10 ${toIndex} of ${this.rightRows.length}`)
        const to = this.rightRows[toIndex].path
        await FormserviceMisc.addMapping(this.$formserviceEndpoint, mappingId, -1, to, '-', null)
      }

      this.selectedRowId = 0
      this.arrowBeingMoved = 0
      this.$store.dispatch('viewMapping/reloadMapping')
    },

    overlayClass: function () {
      return (this.arrowBeingMoved != 0) ? 'overlay-active' : 'overlay-inactive'
    },

    indentStyle: function(row) {
      const leadingspaces = row.text.search(/\S|$/)
      const pixels = leadingspaces * 4;
      return { marginLeft: `${pixels}px`}
    },

    onMousemove: function(evt) {
      const frameBox = this.$refs.myframe.getBoundingClientRect()
      const x = evt.x - frameBox.left
      const y = evt.y - frameBox.top

      let activeRow = 0
      if (this.arrowBeingMoved > 0) {
        // Right end of arrow
        const index = this.arrowBeingMoved - 1
        if (index < 0 || index >= this.arrows.length) {
          console.log(`Internal error: bad arrow index [SHHDUDU]`)
          return
        }
        this.arrows[index].x2 = x
        this.arrows[index].y2 = y

        // Look for hover over teh right rows
        for (const row of this.rightRows) {
        // for (const [index, row] of this.rightRows.entries()) {
          if (y >= row.top && y <= row.bottom && x >= row.left && x <= row.right) {
            // console.log(`FOUND ${row.id} / ${x}, ${y} -> ${row.left}, ${row.top}, ${row.right}, ${row.bottom}`)
            activeRow = row.id
            break
          }
        }
      } else if (this.arrowBeingMoved < 0) {
        // left end of arrow
        const index = (-this.arrowBeingMoved) - 1
        if (index < 0 || index >= this.arrows.length) {
          console.log(`Internal error: bad arrow index [SHHHWWE]`)
          return
        }
        this.arrows[index].x1 = x
        this.arrows[index].y1 = y

        // Look for hover over the left rows
        for (const row of this.leftRows) {
        // for (const [index, row] of this.leftRows.entries()) {
          if (y >= row.top && y <= row.bottom && x >= row.left && x <= row.right) {
            // console.log(`FOUND ${row.id} / ${x}, ${y} -> ${row.left}, ${row.top}, ${row.right}, ${row.bottom}`)
            activeRow = row.id
            break
          }
        }
      }
      this.selectedRowId = activeRow
    },

    refId(id) {
      if (id < 0) {
        return `o${id}`
      } else {
        return `o+${id}`
      }
    }
  },//- methods
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