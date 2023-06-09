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
      td.my-row-2(v-for="c in columns", :style="columnStyle(c, rec)")
        //- div {{c}}
        span(v-if="c.type==='transactionIconId'")
          .transaction-status-icon(:style="{ backgroundColor: transactionStatusColor(rec) }")
            b-icon.my-icon(:icon="transactionStatusIcon(rec.status)", size="is-small")
          | {{ shortTxId(rec.txId) }}
        span(v-else-if="c.type==='transactionStatus'")
          span(:style="{ color: transactionStatusColor(rec) }") {{rec.status}}
        span(v-else-if="c.type==='dateTime'")
          | {{dateTime(c, rec)}}
        span(v-else-if="c.type==='since'")
          | {{since(c, rec)}}
        span(v-else-if="c.type==='ago'")
          | {{since(c, rec)}} ago
        span(v-else-if="c.type==='button'")
          button.button.is-small.my-tiny-button(@click.stop="doButtonClick(c, rec)") {{c.label}}
        span(v-else)
          | {{field(c, rec)}}
    tr.my-row-1(v-for="n in rows", v-if="rows>0 && n>data.length")
      td(v-for="c in columns")
    tr.my-final-row
      td(v-for="c in columns")
</template>


<script>
import formatDistanceToNow from 'date-fns/formatDistanceToNow'

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
      switch (rec.status && rec.status.toLowerCase()) {
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
    },//-doButtonClick

    shortTxId(txId) {
      if (!txId) {
        return '?'
      }
      if (txId.startsWith('tx-')) {
        txId = txId.substring(3)
      }
      if (txId.length > 8) {
        txId = txId.substring(0, 8)
      }
      return txId
    },//- shortTxId

    dateTime(column, rec) {
      let value = this.field(column, rec)
      if (!value) {
        return ''
      }
      // return value + 'XZX'
      try {
        // console.log(`dateTime: typeof value=`, typeof value)
        // console.log(`dateTime: value=`, value)
        const dat = new Date(value)
        // console.log(`dateTime: typeof value=`, typeof value)
        // console.log(`dateTime: value=`, value)
        // console.log(`dateTime: dat=`, dat)
        const day = dat.toLocaleDateString('PST')
        const time = dat.toLocaleTimeString('PST')
        return `${day} ${time}`
      } catch (e) {
        // Something wrong with the date value
        console.log(`Error converting date:`, e)
        return value
      }
    },//-dateTime

    since(column, rec) {
      let value = this.field(column, rec)
      if (!value) {
        return ''
      }
      // return value + 'XZX'
      try {
        // console.log(`dateTime: typeof value=`, typeof value)
        // console.log(`dateTime: value=`, value)
        const dat = new Date(value)
        // console.log(`dateTime: typeof value=`, typeof value)
        // console.log(`dateTime: value=`, value)
        // console.log(`dateTime: dat=`, dat)
        // const day = dat.toLocaleDateString('PST')
        // const time = dat.toLocaleTimeString('PST')
        // return `${day} ${time}`
        const since = formatDistanceToNow(dat)
        return since
      } catch (e) {
        // Something wrong with the date value
        console.log(`Error converting date:`, e)
        return value
      }
    },//-since

    columnStyle(column, rec) {
      // console.log(`columnStyle()`, column)
      const style = { }
      if (column.width) {
        // console.log(`column.width=`, column.width)
        style.width = column.width
      }
      switch (rec.status) {
        case 'queued':
        case 'running':
          style['color'] = '#48c78e'
          style['font-weight'] = 600
          break
        case 'sleeping':
          // style['color'] = 'light-blue'
          style['font-weight'] = 600
          break

        case 'internal-error':
          style['color'] = 'red'
          style['font-weight'] = 600
          break
        case 'aborted':
        case 'failed':
          style['color'] = '#f14668'
          // style['font-weight'] = 600
          break
      }
      return style
    },

    transactionStatusIcon(status) {
      switch (status) {
        case 'queued':
          return 'human-queue'
        case 'running':
          return 'run'
        case 'sleeping':
          return 'sleep'

        case 'success':
          return 'check'

        case 'failed':
        case 'aborted':
        case 'internal-error':
          return 'alert-octagon-outline'

        default:
          return 'bank-transfer'
      }
    }
  }
}
</script>


<style lang="scss" scoped>
.my-table {
  width: 100%;
  cursor: pointer;
  padding-bottom: 90px;
  background-color: #322f44;
  border-radius: 5px;
}

.my-heading-1 {
  // height: 59px;
  padding: 0px;
  // background-color: #322f44;
}

.my-heading-2 {
  // height: 59px;
  gap: 10px;
  padding-top: 26px;
  padding-left: 18px;
  padding-right: 18px;
  padding-bottom: 12px;
  // padding: 16px 18px 0x;

// font-family: Work Sans;
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
  // font-family:'Courier New', Courier, monospace;
  // height: 44px;
  // flex-grow: 0;
  // padding: 35px 299px 12px 24px;
  padding: 0px;
  // background-color: #322f44;
  border-top: solid 1px rgba(255, 255, 255, 0.13);
}

.my-row-2 {
  // font-family:'Courier New', Courier, monospace;

  // height: 44px;
  gap: 10px;
  row-gap: 0px;
  // padding: 14px 18px;
  padding: 5px 5px;
  padding-left: 25px;

  font-size: 15px;
  font-weight: normal;
  font-stretch: normal;
  font-style: normal;
  line-height: normal;
  letter-spacing: normal;
  text-align: left;
  color: rgba(255, 255, 255, 0.8);
}

.my-final-row {
  border-top: solid 1px rgba(255, 255, 255, 0.13);
  height: 12px;
}

.transaction-status-icon {
  display: inline-block;
  width: 9px;
  height: 9px;
  margin-right: 10px;
  border-radius: 6px;
}

.my-icon {
  display: inline-block;
}

.is-dark-mode-active .button {
  &.my-tiny-button {
    // padding-top: 0px;
    // padding-bottom: 0px;
    padding-left: 6px;
    padding-right: 6px;
    height: 19px;
    border-color: #909090 !important;
    color: #909090 !important;
    // color: yellow !important;
    // background-color: #070707;
  }
}
</style>