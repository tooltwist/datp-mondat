<template lang="pug">
.my-abandoned-page
  section.section
    h2.title.is-3
      .datemon-heading-icon
        b-icon(icon="head-question-outline", size="is-medium")
      | Abandoned Transactions&nbsp;&nbsp;

    DatemonNotification
      | An abandoned transaction is a transaction that has completed, but
      | the system that initiated the transaction has not come back to get the result,
      | and we are not able to notify that system. Abandoned transactions have the potential
      | to jam up our processing, because they cannot be archived in a timely manner.
      | It is a condition of use that transactions must not be abandoned, so this screen
      | might require reminding users of this service of that requirement.
    br
    h3.subtitle.is-6.has-text-grey
      | YARP
    | etc etc
</template>

<script>
import DatemonNotification from "../components/DatmonNotification.vue"
// import DatemonTable from "../components/DatemonTable.vue"

export default {
  components: {
    DatemonNotification,
  },
}
</script>

<style lang="scss" scoped>
.my-abandoned-page {

  // .datemon-heading-icon {
  //   display: inline-block;
  //   color: #16aa58;
  //   padding-right: 20px;
  // }
}

</style>