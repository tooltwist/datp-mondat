<template lang="pug">
div
  table.my-table
    // heading row
    tr.my-heading-1
      td.my-heading-2(v-for="c in columns")
        | {{label(c)}}
    tr.my-row-1(v-for="(rec, index) in data", v-if="rows<=0 || index<rows", @click="select(rec)")
      td.my-row-2(v-for="c in columns")
        span(v-if="c.type==='transactionIconId'")
          .transaction-status-icon(:style="{ backgroundColor: transactionStatusColor(rec) }")
          | {{rec.txId}}
        span(v-else-if="c.type==='transactionStatus'")
          span(:style="{ color: transactionStatusColor(rec) }") {{rec.status}}
        span(v-else-if="c.type==='button'")
          button.button.is-small(@click.stop="doButtonClick(c, rec)") {{c.label}}
        span(v-else)
          | {{field(c, rec)}}
    tr.my-row-1(v-for="n in rows", v-if="rows>0 && n>data.length")
      td(v-for="c in columns")
  //- | {{data}}
</template>


<script>
export default {
  props: {
    columns: Array,
    data: Array,
    rows: {
      type: Number,
      default: 0 // unlimited
    }
  },//- props

  data: function () {
    return {
      tableSize: 20,
    }
  },//- data

  methods: {
    label(col) {
      if (col.label) {
        if (typeof(col.label) === 'string') {
          return col.label.toUpperCase()
        }
        return col.label
      }
      return ''
    },//- label

    field(c, rec) {
      if (c.field) {
        const value = rec[c.field]
        return value ? value : ''
      }
      return ''
    },//- field

    transactionStatusColor: function (rec) {
      // console.log(`rec=`, rec)
      switch (rec.status.toLowerCase()) {
        case 'completed': return '#19e775';
        case 'waiting': return '#f1c93d';
        case 'hold': return '#ff4445';
        default: 'inherit';
      }

    },//- transactionStatusColor

    select(row) {
      this.$emit('select', row)
    },

    doButtonClick(col, row) {
      console.log(`col=`, col)
      console.log(`row=`, row)
      if (col.customEvent) {
        this.$emit(col.customEvent, row)
      } else {
        console.log(`Button column has no customEvent property`)
      }
    }
  }
}
</script>


<style lang="scss" scoped>
.my-table {
  width: 100%;
  cursor: pointer;
}



// .TABLEHEADER {
//   width: 1206px;
//   height: 71px;
//   flex-grow: 0;
//   display: flex;
//   flex-direction: row;
//   justify-content: flex-start;
//   align-items: flex-start;
//   margin: 60px 0 0;
//   // padding: 12px 56px 0;
//   padding: 12px 0px 0;
//   border-radius: 5px;
// }

.my-heading-1 {
  height: 59px;
  // flex-grow: 0;
  // padding: 35px 299px 12px 24px;
  padding: 0px;
  background-color: #322f44;
}

.my-heading-2 {
  height: 59px;
  // display: flex;
  // flex-direction: row;
  // justify-content: flex-start;
  // align-items: flex-end;
  gap: 10px;
  // padding: 36px 18px 12px 24px;
  padding: 36px 18px 12px;
// }

// .my-heading-3 {
  // height: 12px;
  // flex-grow: 0;
  font-family: Work Sans;
  font-size: 12px;
  font-weight: bold;
  font-stretch: normal;
  font-style: normal;
  line-height: normal;
  letter-spacing: 0.36px;
  text-align: left;
  color: rgba(255, 255, 255, 0.4);
}


.my-row-1 {
  height: 44px;
  // flex-grow: 0;
  // padding: 35px 299px 12px 24px;
  padding: 0px;
  background-color: #322f44;
  border-bottom: solid 1px rgba(255, 255, 255, 0.13);
}

.my-row-2 {

  // width: 430px;
  height: 44px;
  // display: flex;
  // flex-direction: row;
  // justify-content: flex-start;
  // align-items: flex-end;
  gap: 10px;
  // padding: 18px;
  padding: 14px 18px;


  // width: 375px;
  // height: 12px;
  // flex-grow: 0;
  font-family: Work Sans;
  font-size: 14px;
  font-weight: normal;
  font-stretch: normal;
  font-style: normal;
  line-height: normal;
  letter-spacing: normal;
  text-align: left;
  color: rgba(255, 255, 255, 0.8);
}

.transaction-status-icon {
  display: inline-block;
  width: 9px;
  height: 9px;
  // background-color: red;
  margin-right: 10px;
  border-radius: 6px;
}






// .Property-1TRANSID {
//   width: 430px;
//   // height: 59px;
//   // flex-grow: 0;
//   // // padding: 35px 299px 12px 24px;
//   // padding: 0px;
//   // background-color: #322f44;
// }

// .TRANS-ID {
//   width: 430px;
//   // height: 59px;
//   // display: flex;
//   // flex-direction: row;
//   // justify-content: flex-start;
//   // align-items: flex-end;
//   // gap: 10px;
//   // padding: 36px 18px 12px 24px;
//   padding-left: 24px;
//   // background-color: yellow;
//   margin-top: 0px;
// }

// .TRANSACTION-ID {
//   width: 107px;
//   // height: 12px;
//   // flex-grow: 0;
//   // font-family: Work Sans;
//   // font-size: 12px;
//   // font-weight: bold;
//   // font-stretch: normal;
//   // font-style: normal;
//   // line-height: normal;
//   // letter-spacing: 0.36px;
//   // text-align: left;
//   // color: rgba(255, 255, 255, 0.4);
// }



// .Property-1TYPE {
//   width: 213px;
//   // height: 59px;
//   // flex-grow: 0;
//   // // padding: 0 26px 0 0;
//   // padding: 0 0 0 0;
//   // background-color: #322f44;
// }

// .TYPE {
//   width: 187px;
//   // height: 59px;
//   // display: flex;
//   // flex-direction: row;
//   // justify-content: flex-start;
//   // align-items: flex-end;
//   // gap: 10px;
//   // padding: 36px 18px 12px;
// }

// .TYPE-Z {
//   // width: 33px;
// }


// .Property-STATUS {
//   width: 204px;
//   // height: 59px;
//   // flex-grow: 0;
//   // // padding: 35px 299px 12px 24px;
//   // padding: 0px;
//   // background-color: #322f44;
// }

// .Property-STARTTIME {
//   width: 247px;
//   // height: 59px;
//   // flex-grow: 0;
//   // // padding: 35px 299px 12px 24px;
//   // padding: 0px;
//   // background-color: #322f44;
// }


// General







// // Data part of the table.
// .TRANSID {
//   width: 430px;
//   height: 44px;
//   margin: 44px 0 0;
//   padding: 14px 18px 18px;
//   background-color: #322f44;
// }

// .TRANS-ID {
//   width: 430px;
//   height: 44px;
//   display: flex;
//   flex-direction: row;
//   justify-content: flex-start;
//   align-items: flex-end;
//   gap: 10px;
//   margin: 44px 0 0;
//   padding: 18px;
// }

// .tx-9b0b9023b9af43f4c1f939c4fdefe434c4e343d {
//   width: 375px;
//   height: 12px;
//   flex-grow: 0;
//   font-family: Work Sans;
//   font-size: 14px;
//   font-weight: normal;
//   font-stretch: normal;
//   font-style: normal;
//   line-height: normal;
//   letter-spacing: normal;
//   text-align: left;
//   color: rgba(255, 255, 255, 0.8);
// }


</style>