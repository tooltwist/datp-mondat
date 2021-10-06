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
    .my-overlay(@mousemove="mousemove", @mouseup="upOnOverlay", :class="overlayClass()")
      svg.my-svg(id="svgelem", zheight="200", xmlns="http://www.w3.org/2000/svg")
        defs
          marker(id="arrowhead" markerWidth="10" markerHeight="7", refX="10" refY="3.5" orient="auto")
            polygon(points="0 0, 10 3.5, 0 7", fill="lightblue")
        //- circle(id="redcircle", cx="5", cy="5", r="5" fill="blue")
        line(v-for="arrow in arrows", v-show="arrow.visible", :x1="arrow.x1", :y1="arrow.y1", :x2="arrow.x2", :y2="arrow.y2", style="stroke:lightblue;stroke-width:1;stroke-dasharray=\"1,6\";",  marker-end="url(#arrowhead)")

    .columns
      .column
        h1.title.is-6 Standard fields ({{stdViewname}})
        //- pre
        //-   | {{JSON.stringify(stdView,'',2)}}
        //- pre
        //-   | {{JSON.stringify(stdObject,'',2)}}
        //- .is-size-7 {{authViewname}}
        //- .is-size-7 {{utilViewname}}
        .my-leftList(v-for="row,index in leftRows")
          .my-row
            .my-indent(:style="indentStyle(row)")
            .my-text(:ref="refId(row.id)", :id="refId(row.id)", @mousedown="downOnRow(-(index+1))", @mouseup="upOnRow", :class="{ 'my-selected-row': (row.id == selectedRowId) }")
              | {{ row.text }}
              //- | {{ row.text }} = {{refId(row.id)}}

      .column
        h1.title.is-6 Backend fields ({{backendViewname}})
        //- pre
          | {{JSON.stringify(backendView,'',2)}}
        .my-rightList(v-for="row,index in rightRows")
          .my-row
            .my-indent(:style="indentStyle(row)")
            .my-text(:ref="refId(row.id)", :id="refId(row.id)", @mousedown="downOnRow(index+1)", @mouseup="upOnRow", :class="{ 'my-selected-row': (row.id == selectedRowId) }")
              | {{ row.text }}
              //- | {{ row.text }} = {{refId(row.id)}}

  br
  //- input(type="button", @click="positionArrows", value="Update mapping")
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
const zzzzz = 99999

export default {
  props: {
    view: String,
    // fields: Array,
    provider: String,
    service: String,
    messageType: String,

    checkArrows: Number,
  },
  data: function () {
    return {

    stdViewname: '',
    authViewname: '',
    utilViewname: '',
    backendViewname: '',

    stdView: { },
    authView: { },
    utilView: { },
    backendView: { },

    stdObject: { },
    authObject: { },
    utilObject: { },
    backendObject: { },




      leftRows: [ ],
      rightRows: [ ],

      arrows: [
        {
          leftId: -2,
          rightId: +2,
          x1: 20,
          y1: 80,
          x2: 700,
          y2: 200,
        },
        {
          leftId: -3,
          rightId: +3,
          x1: 20,
          y1: 80,
          x2: 700,
          y2: 200,
        },
        {
          leftId: -4,
          rightId: +4,
          x1: 20,
          y1: 80,
          x2: 700,
          y2: 200,
        },
        {
          leftId: -15,
          rightId: +5,
          x1: 20,
          y1: 80,
          x2: 700,
          y2: 200,
        },
      ],

      arrowBeingMoved: 0, // negative=left end, positive=right end, zero=none, subtract one from index
      selectedRowId: 0,

      dataLeft: `{
        "location_id" : 1,
        "user_id" : 1,
        "trx_date" : "2019-12-01",
        "customer_id" : 1,
        "currency_id" : 1,
        "remco_id" : 9,
        "trx_type" : 1,
        "is_domestic" : 0,
        "customer_name" : "das",
        "service_charge" : 1,
        "remote_location_id" : 1,
        "dst_amount" : 1,
        "total_amount" : 1,
        "remote_user_id" : 1,
        "originating_country" : "mindanao",
        "destination_country" : "PH",
        "purpose_transaction" : "TEST",
        "source_fund" : "salary",
        "occupation" : "helper",
        "relation_to" : "mother",
        "birth_date" : "2018-12-03",
        "birth_place" : "sulo",
        "birth_country" : "PH",
        "id_type" : "UMID",
        "id_number" : 123,
        "address" : "test address",
        "barangay" : "test barangay",
        "city" :  "test city",
        "province" : "test province",
        "zip_code" : "30303",
        "country" : "PH",
         "contact_number" : "09123456978",
        "current_address" : "{}",
        "permanent_address" : "{}",
        "risk_score" : 1,
        "risk_criteria" : "{}",
         "form_type" : "OAR",
        "form_number" : "dsa",
        "payout_type" : 1,
        "sender_name": "testsa",
        "receiver_name": "testsa",
        "principal_amount": 32,
        "control_number": "P6F1C6L211",
        "client_reference_no": "11915191",
        "reference_number": "TEST0987654321TEST12",
        "location_name": "aguirre",
        "send_currency_id": "6",
        "beneficiary_id": 5342
      }`,

      dataRight: `{
        "location_id": 371,
        "location_name": "Information Technology Department",
        "user_id": 5188,
        "trx_date": "2020-02-21",
        "customer_id": "6276847",
        "currency_id": "1",
        "remco_id": "7",
        "trx_type": "1",
        "is_domestic": "1",
        "customer_name": "ALVIN CAMITAN",
        "service_charge": "1",
        "remote_location_id": 371,
        "dst_amount": "0.00",
        "total_amount": "100",
        "remote_user_id": 5188,
        "originating_country": "Philippines",
        "destination_country": "PH",
        "purpose_transaction": "Sendd",
        "source_fund": "Savings",
        "occupation": "N/A",
        "relation_to": "Family",
        "birth_date": "1995-09-06",
        "birth_place": "ERMITA,BOHOL",
        "birth_country": "Philippines",
        "id_type": "445",
        "id_number": "ASD292929291",
        "address": "Imortal",
        "barangay": "Hello World",
        "city": "ANDA",
        "province": "BOHOL",
        "country": "Philippines",
        "zip_code": "1000A",
        "contact_number": "09065595959",
        "current_address": {
        "address_1": "Imortal",
        "address_2": null,
        "barangay": "Hello World",
        "city": "ANDA",
        "province": "BOHOL",
        "zip_code": "1000A",
        "country": "Philippines"
        },
        "permanent_address": {
        "address_1": "Imortal",
        "address_2": null,
        "barangay": "Hello World",
        "city": "ANDA",
        "province": "BOHOL",
        "zip_code": "1000A",
        "country": "Philippines"
        },
        "risk_score": 1,
        "risk_criteria": 1,
        "form_type": "0",
        "form_number": "0",
        "payout_type": 1,
        "sender_name": "JOMAR TE TEST",
        "receiver_name": "ALVIN CAMITAN",
        "principal_amount": "100",
        "client_reference_no": "b41c69b5b0fc5e3cf7cb",
        "reference_number": "20200701PHB692534172",
        "sender_first_name": "JOMAR",
        "sender_middle_name": "TE",
        "sender_last_name": "TEST",
        "receiver_first_name": "ALVIN",
        "receiver_middle_name": "",
        "receiver_last_name": "CAMITAN",
        "receiver_contact_number": "0922261616161",
        "kyc_verified": true,
        "gender": "M"
      }`,

      // testDataLeft: {
      //   module: "prereq",
      //   request: "feeinquiry",
      //   param: {
      //     foreign_reference_no: "123123sadasd",
      //     principal_amount: "100000",
      //     fixed_amount_flag: "N",
      //     destination_country_code: "PH",
      //     destination_currency_code: "PHP",
      //     transaction_type: "SO",
      //     promo_code: "",
      //     message: [],
      //     message_line_count: "0",
      //     terminal_id: "WBPt",
      //     operator_id: "001",
      //   },
      // },

      // testDataRight: {
      //   module: "prereq",
      //   request: "feeinquiry",
      //   param: {
      //     foreign_reference_no: "123123sadasd",
      //     principal_amount: "100000",
      //     fixed_amount_flag: "N",
      //     destination_country_code: "PH",
      //     destination_currency_code: "PHP",
      //     transaction_type: "SO",
      //     promo_code: "",
      //     message: [],
      //     message_line_count: "0",
      //     terminal_id: "WBPt",
      //     operator_id: "001",
      //   },
      // },

      // json: '',
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
    checkArrows: function( ){
      // console.log(`checkArrows have changed ${this.checkArrows}`)
      setTimeout(() => {
        this.positionArrows()
      }, 150)
    },
  },

  mounted: async function() {

    // Load the required views.
    this.stdViewname = FormserviceMisc.viewName('std', this.service, this.messageType)
    this.authViewname = FormserviceMisc.viewName('auth', this.service, this.messageType)
    this.utilViewname = FormserviceMisc.viewName('util', this.service, this.messageType)
    this.backendViewname = FormserviceMisc.viewName(this.provider, this.service, this.messageType)

    this.stdView = await FormserviceMisc.getView(this.stdViewname)
    // this.authView = await FormserviceMisc.getView(this.authViewname)
    // this.utilView = await FormserviceMisc.getView(this.utilViewname)
    this.backendView = await FormserviceMisc.getView(this.backendViewname)

    // this.dataRight = FormserviceMisc.fieldsToObject(this.backendView)
    console.log(`this.stdView=`, this.stdView)

    this.stdObject = FormserviceMisc.fieldsToObject(this.stdView.fields)
    console.log(`this.stdObject=`, this.stdObject)
    this.backendObject = FormserviceMisc.fieldsToObject(this.backendView.fields)
    console.log(`this.backendObject=`, this.backendObject)


    // Prepare the rows on the left
    // let objLeft = JSON.parse(this.dataLeft)
    let objLeft = this.stdObject
    // objLeft = this.testDataLeft

    // console.log(`objLeft=`, objLeft)
    const json = JSON.stringify(objLeft, '', 4)
    console.log(`json=`, json)
    const arr = json.split('\n')
    for (const l of arr) {
      this.leftRows.push({
        id: -(this.leftRows.length + 1), // -1, -2, -3... (no zero)
        text: l,
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
      })
    }

    // Prepare the rows on the right
    // let objRight = JSON.parse(this.dataRight)
    let objRight = this.backendObject
    // objRight = this.testDataRight
    const jsonRight = JSON.stringify(objRight, '', 4)
    const arrRight = jsonRight.split('\n')
    for (const l of arrRight) {
      this.rightRows.push({
        id: +(this.rightRows.length + 1), // 1, 2, 3... (no zero)
        text: l,
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
      })
    }

    // // Give the elements time to display
    // setTimeout(() => {
    // }, 750)

  },

  updated: function () {
    console.log(`UPDATED`)
    this.positionArrows()
  },

  computed: {

  },

  methods: {
    positionArrows: function() {
      console.log(`positionArrows()`, this.$refs)
// return
      const frameBox = this.$refs.myframe.getBoundingClientRect()

      // Set row coordinates
      for (const row of this.leftRows) {
        const left = this.$refs[this.refId(row.id)][0]
        const rect = left.getBoundingClientRect()
        row.top = rect.top - frameBox.top
        row.bottom = rect.bottom - frameBox.top
        row.left = rect.left - frameBox.left
        row.right = rect.right - frameBox.left
      }
      for (const row of this.rightRows) {
        const right = this.$refs[this.refId(row.id)][0]
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
      // console.log(`down(${rowId})`)
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
          console.log(`New arrow`)
          const leftRow = this.leftRows[(-rowId) - 1]
          const newArrow = {
            leftId: rowId,
            rightId: 0,
            x1: leftRow.right,
            y1: (leftRow.top + leftRow.bottom) / 2,
            x2: leftRow.right,
            y2: (leftRow.top + leftRow.bottom) / 2,
          }
          console.log(`newArrow=`, newArrow)
          this.arrows.push(newArrow)
          this.arrowBeingMoved = this.arrows.length
          console.log(`this.arrowBeingMoved=`, this.arrowBeingMoved)
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
      // console.log(`up`)
    },

    upOnOverlay: function() {
      if (this.selectedRowId === 0) {

        // No selected row, so delete the arrow
        if (this.arrowBeingMoved > 0) {
          // Right end
          const actualIndex = this.arrowBeingMoved - 1
          this.arrows.splice(actualIndex, 1)
        } else if (this.arrowBeingMoved < 0) {
          // Left end
          const actualIndex = (-this.arrowBeingMoved) - 1
          this.arrows.splice(actualIndex, 1)
        }
      } else {

        // Have a selected row
        if (this.arrowBeingMoved > 0) {
          // Right end
          const actualIndex = this.arrowBeingMoved - 1
          const arrow = this.arrows[actualIndex]
          arrow.rightId = this.selectedRowId
        } else if (this.arrowBeingMoved < 0) {
          // Left end
          const actualIndex = (-this.arrowBeingMoved) - 1
          const arrow = this.arrows[actualIndex]
          arrow.leftId = this.selectedRowId
        }
      }
      this.selectedRowId = 0
      this.arrowBeingMoved = 0
      this.positionArrows()
    },

    overlayClass: function () {
      return (this.arrowBeingMoved != 0) ? 'overlay-active' : 'overlay-inactive'
    },

    indentStyle: function(row) {
      const leadingspaces = row.text.search(/\S|$/)
      const pixels = leadingspaces * 4;
      return { marginLeft: `${pixels}px`}
    },

    mousemove: function(evt) {
      const frameBox = this.$refs.myframe.getBoundingClientRect()
      const x = evt.x - frameBox.left
      const y = evt.y - frameBox.top

      let activeRow = 0
      if (this.arrowBeingMoved > 0) {
        // Right end of arrow
        const index = this.arrowBeingMoved - 1
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