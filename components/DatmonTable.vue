/* Copyright Tooltwist Innovations Limited - All Rights Reserved
 * This file is part of DATP and as such is proprietary and confidential software.
 * Unauthorized copying of this file, via any medium is strictly prohibited. All
 * rights reserved. No warranty, explicit or implicit, provided. In no event shall
 * the author or owner be liable for any claim or damages.
 */
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
      // console.log(`col=`, col)
      // console.log(`row=`, row)
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

.my-heading-1 {
  height: 59px;
  padding: 0px;
  background-color: #322f44;
}

.my-heading-2 {
  height: 59px;
  gap: 10px;
  padding: 36px 18px 12px;

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
  font-family:'Courier New', Courier, monospace;
  height: 44px;
  // flex-grow: 0;
  // padding: 35px 299px 12px 24px;
  padding: 0px;
  background-color: #322f44;
  border-bottom: solid 1px rgba(255, 255, 255, 0.13);
}

.my-row-2 {
  font-family:'Courier New', Courier, monospace;

  height: 44px;
  gap: 10px;
  padding: 14px 18px;

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
</style>