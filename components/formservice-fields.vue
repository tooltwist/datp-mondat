/* Copyright Tooltwist Innovations Limited - All Rights Reserved
 * This file is part of DATP and as such is proprietary and confidential software.
 * Unauthorized copying of this file, via any medium is strictly prohibited. All
 * rights reserved. No warranty, explicit or implicit, provided. In no event shall
 * the author or owner be liable for any claim or damages.
 */
<template lang="pug">
.formservice-fields
  span(v-if="loading")
    | Loading...
  .notification.is-danger(v-else-if="loadError")
    | {{loadError}}
  template(v-else)
    //- h1.title.is-size-3 formservice-fields - {{ view }}
    //- | {{ viewDef.fields }}
    b-table.my-table.is-size-7(
      v-if="viewDef !== null",
      :data="viewDef.fields",
      :columns="viewFieldsColumns",
      hoverable,
      @click="editRow",
      draggable
      @dragstart="dragstart"
      @drop="drop"
      @dragover="dragover"
      @dragleave="dragleave"
    )
    hr
    .is-pulled-right
      | &nbsp;&nbsp;&nbsp;
      button.button.is-small.is-primary(@click="newField") Add field
    .is-pulled-right
      | &nbsp;&nbsp;&nbsp;
      button.button.is-small.is-pulled-right(@click="viewExample") View an example
    .is-pulled-right
      | &nbsp;&nbsp;&nbsp;
      button.button.is-small.is-pulled-right(@click="viewLearnByExample") Define using an example
    i.is-size-7 Click on a row to edit or delete

    // Modal for editing field details
    b-modal(v-model="isModalActive", :width="640", scroll="keep")
      formservice-field-edit(
        :view="viewDef",
        :field="fieldDef",
        v-on:save="saveField",
        v-on:cancel="cancelFieldEdit",
        v-on:delete="deleteField"
      )

    // Modal showing example message
    b-modal(v-model="showViewExampleModal", :width="640", scroll="keep")
      .card
        header.card-header
          p.card-header-title Example for {{ view }}
        .card-content
          .content
            pre.is-size-7
              | {{ exampleObject }}

    // Modal for entering example message
    b-modal(v-model="showLearnByExampleModal", :width="640", scroll="keep")
      .card
        header.card-header
          p.card-header-title Please paste a typical message for {{ view }}
        .card-content
          .content(v-if="!showLearnedFields")
            b-field(label="Example JSON", label-position="on-border", :message="jsonToLearnError", :type="jsonToLearnError ? 'is-danger' : ''")
              b-input(type="textarea", v-model="jsonToLearn", rows="26", size="is-small", @input="validateJsonToLearn")
          .content(v-if="showLearnedFields")
            // https://buefy.org/documentation/table
            b-table.my-table.is-size-7(
              :data="learnedFields",
              :columns="learnedFieldsColumns",
              :checked-rows.sync="checkedLearnedFields"
              :is-row-checkable="(row) => !row.alreadyExists"
              checkable
            )
            //- | {{learnedFields}}
            //- hr
            //- | {{checkedLearnedFields}}

        footer.card-footer
          a.card-footer-item(v-if="!showLearnedFields", href="#", card-footer-item, @click="doLearn") Scan JSON
          a.card-footer-item(v-if="showLearnedFields", href="#", card-footer-item, @click="learnAccept") Accept
          a.card-footer-item(v-if="showLearnedFields", href="#", card-footer-item, @click="learnBack") Back
          a.card-footer-item(href="#", card-footer-item, @click="doCancelLearn") Cancel

      //- formservice-field-edit(:view="viewDef", :field="fieldDef", v-on:save="saveField", v-on:cancel="cancelFieldEdit", v-on:delete="deleteField")
</template>

<script>
import axios from "axios";
import FormserviceMisc from "../lib/formservice-misc";
import FormserviceFieldEdit from "./formservice-field-edit";
import formserviceMisc from '../lib/formservice-misc';

export default {
  components: {
    FormserviceFieldEdit,
  },
  props: {
    view: String,
    // fields: Array,
  },
  data: () => {
    return {
      loading: false,
      loadError: '',

      viewFieldsColumns: [
        // {
        //   field: "_id",
        //   label: "ID",
        // },
        // {
        //   field: "sequence",
        //   label: "Seq",
        // },
        {
          field: "name",
          label: "Field",
          width: 300,
        },
        {
          field: "label",
          label: "Label",
        },
        {
          field: "type",
          label: "Type",
        },
        // {
        //   field: "_reference",
        //   label: "Reference",
        // },
        // {
        //   field: "properties.isPrimaryKey",
        //   label: "Key",
        // },
        // {
        //   field: "properties.isDescription",
        //   label: "Desc",
        // },
        {
          field: "properties.isMandatory",
          label: "Mandatory",
        },
        {
          field: "exampleValue",
          label: "Example",
        },
        // {
        //   field: "properties.readonly",
        //   label: "ReadOnly",
        // },
      ],

      viewDef: {},

      exampleObject: {},

      isModalActive: false,
      fieldDef: null, // Field being edited.
      fieldId: 1, // Give each field a unique ID

      showViewExampleModal: false,

      // drag and drop stuff
      // See https://buefy.org/documentation/table#draggable-rows
      draggingRow: null,
      draggingRowIndex: null,


      /*
       *  Dialog to learn field definitions by example.
       */
      showLearnByExampleModal: false, // Show the form where we load exmaple JSON
      showLearnedFields: false, // We show the learned fields after loading example JSON
      jsonToLearn: '',
      jsonToLearnError: '',
      learnedFields: [ ],
      checkedLearnedFields: [ ],
      learnedFieldsColumns: [
        {
          field: "accept",
          label: "",
        },
        {
          field: "name",
          label: "Name",
        },
        {
          field: "type",
          label: "Type",
        },
        {
          field: "example",
          label: "Example value",
        },
      ],
    };
  },

  mounted: async function () {
    // console.log(`formservice-fields.mounted(${this.view}) --- START`)
    this.loadViewDef(this.view);
    this.jsonToLearn = ''
  },

  watch: {
    /**
     * Called when the 'view' prop changes.
     */
    view: function (newVal, oldVal) {
      this.loadViewDef(newVal);
    },
  },

  methods: {
    loadViewDef: async function (viewName) {
      // console.log(`loadViewDef(${viewName})`, typeof(viewName))

      if (!viewName) {
        this.viewDef = null
        return
      }

      try {
        this.loading = true
        const createIfNotFound = true
        this.viewDef = await formserviceMisc.getView(this.$formserviceEndpoint, viewName, createIfNotFound)
        for (const field of this.viewDef.fields) {
          field._id = this.fieldId++;
        }
        this.loading = false
      } catch (e) {
        console.log(`e=`, e)
        this.loading = false
        this.loadError = 'Could not load view definition'
      }

    },

    viewExample: function () {
      // console.log(`viewExample()`);
      // console.log(`this.viewDef=`, this.viewDef)

      // Create an object version of this field definition
      this.exampleObject = FormserviceMisc.fieldsToObject(this.viewDef.fields);
      // console.log(`exampleObject=`, this.exampleObject);
      this.showViewExampleModal = true
    },

    newField: function () {
      // console.log(`newField()`);
      this.fieldDef = {
        _id: -1, // Indicates a new field
        label: '',
        exampleValue: '',
        defaultValue: '',
        type: "string",
        properties: {},
        allowableValues: '',
      };
      this.isModalActive = true;
    },

    editRow: function (row) {
      // console.log(`edit()`, row)
      this.fieldDef = row
      this.isModalActive = true
    },

    saveField: async function (newField) {
      // console.log(`saveField()`, newField);
      this.isModalActive = false;

      // See if this is a new field
      if (newField._id < 0) {
        // console.log(`NEW FIELD`);
        const field = { _id: this.viewDef.fields.length, properties: {} };
        FormserviceMisc.mergeInFieldDefinition(newField, field);
        // console.log(`field=`, field);
        field.sequence = this.viewDef.fields.length;
        this.viewDef.fields.push(field);

        // Now insert into the database
        const url = `${this.$monitorEndpoint}//formservice/field/${this.view}`;
        // console.log(`url=`, url)
        const reply = await axios.post(url, field);
        // console.log(`reply=`, reply.data);
        if (reply.status === 200) {
          this.$buefy.toast.open({ message: "Field added", type: "is-info" });
        } else {
          // console.log(`reply=`, reply);
          this.$buefy.toast.open({
            message: "Error adding field",
            type: "is-danger",
          });
        }
        this.$emit('updated')
        return;
      }

      // Merge the new values back into the current field
      const field = this.findField(newField._id);
      if (field) {
        // console.log(`before=`, JSON.stringify(field, '', 2))
        const originalFieldName = field.name;
        FormserviceMisc.mergeInFieldDefinition(newField, field);
        // console.log(`after=`, JSON.stringify(field, '', 2))

        // Now update the database
        const url = `${this.$monitorEndpoint}//formservice/field/${this.view}/${originalFieldName}`;
        // console.log(`url=`, url)
        const reply = await axios.put(url, field);
        // console.log(`reply=`, reply.data);
        if (reply.status === 200) {
          this.$buefy.toast.open({ message: "Field updated", type: "is-info" });
        } else {
          // console.log(`reply=`, reply);
          this.$buefy.toast.open({
            message: "Error updating field",
            type: "is-danger",
          });
        }
        this.$emit('updated')
      }
    },

    findField: function (fieldId) {
      for (const field of this.viewDef.fields) {
        // console.log(`  -->  field._id=`, field._id)
        if (field._id === fieldId) {
          return field;
        }
      }
      return null;
    },

    findFieldByName: function (name) {
      // console.log(`findFieldByName(${name})`)
      for (const field of this.viewDef.fields) {
        // console.log(`  -->  field.name=`, field.name)
        if (field.name === name) {
          // console.log(`   found`)
          return field;
        }
      }
      return null;
    },

    cancelFieldEdit: async function (newField) {
      // console.log(`cancelFieldEdit()`);
      this.isModalActive = false;
    },

    deleteField: async function (newField) {
      // console.log(`deleteField()`, newField);
      const vm = this;
      this.$buefy.dialog.confirm({
        message: `Are you sure you want to delete this field?`,
        onConfirm: async () => {
          // find the field
          // console.log(`newField._id=`, newField._id)
          // console.log(`vm.viewDef.fields=`, vm.viewDef.fields)
          // console.log(`vm.viewDef.fields=`, vm.viewDef.fields.length)
          let fieldIndex = -1;
          for (let i = 0; i < vm.viewDef.fields.length; i++) {
            // console.log(`${i} -> ${vm.viewDef.fields[i]._id}`);
            if (vm.viewDef.fields[i]._id === newField._id) {
              fieldIndex = i;
              break;
            }
          }
          // console.log(`fieldIndex=`, fieldIndex)

          if (fieldIndex >= 0) {
            // Remove it from our local copy of the view
            const name = vm.viewDef.fields[fieldIndex].name;
            vm.viewDef.fields.splice(fieldIndex, 1);

            // Delete it from the database
            const url = `${this.$monitorEndpoint}//formservice/field/${this.view}/${name}`;
            // console.log(`url=`, url);
            const reply = await axios.delete(url);
            // console.log(`reply=`, reply.data);
            if (reply.status === 200) {
              vm.$buefy.toast.open({
                message: "Field deleted",
                type: "is-info",
              });
            } else {
              // console.log(`reply=`, reply);
              vm.$buefy.toast.open({
                message: "Error deleting field",
                type: "is-danger",
              });
            }
            this.$emit('updated')
          }
          vm.isModalActive = false;
        }, //- onConfirm
      }); //- dialog.confirm
    }, //- deleteField

    dragstart(payload) {
      // console.log(`dragstart()`)
      this.draggingRow = payload.row;
      this.draggingRowIndex = payload.index;
      payload.event.dataTransfer.effectAllowed = "copy";
    },
    dragover(payload) {
      // console.log(`dragover()`)
      payload.event.dataTransfer.dropEffect = "copy";
      payload.event.target.closest("tr").classList.add("is-selected");
      payload.event.preventDefault();
    },
    dragleave(payload) {
      // console.log(`dragleave()`)
      payload.event.target.closest("tr").classList.remove("is-selected");
      payload.event.preventDefault();
    },
    async drop(payload) {
      // console.log(`drop`)
      payload.event.target.closest("tr").classList.remove("is-selected");
      const droppedOnRowIndex = payload.index;


      // this.$buefy.toast.open(
      //   `Moved ${this.draggingRow.first_name} from row ${
      //     this.draggingRowIndex + 1
      //   } to ${droppedOnRowIndex + 1}`
      // );


      // Move the field in the field array
      // console.log(`remove from ${this.draggingRowIndex}`)
      const arr = this.viewDef.fields.splice(this.draggingRowIndex, 1) // remove
      // console.log(`insert at ${droppedOnRowIndex}`)
      const insertPos = (droppedOnRowIndex >= this.draggingRowIndex) ? (droppedOnRowIndex-1) : (droppedOnRowIndex)
      // console.log(`insertPos=`, insertPos)
      this.viewDef.fields.splice(insertPos, 0, arr[0]) // insert
      // this.viewDef.fields.push(arr[0])

      // Reset the sequence numbers.
      const promises = [ ]
      let problems = 0
      for (let i = 0; i < this.viewDef.fields.length; i++) {
        const field = this.viewDef.fields[i]
        if (field.sequence !== i) {
          // console.log(`Update ${i} ${field.name}`)
          field.sequence = i
          const url = `${this.$monitorEndpoint}//formservice/field/${this.view}/${field.name}`;
          const promise = await axios.put(url, field)
          promises.push(promise)
          // const reply = await axios.put(url, field);
          // console.log(`reply=`, reply.data);
          // if (reply.status !== 200) {
          //   console.log(`reply=`, reply);
          //   problems++
          // }
        }
      }
      // Wait for them to all finish here
      for (const promise of promises) {
        const reply = await promise
        // console.log(`reply=`, reply.data);
        if (reply.status !== 200) {
          // console.log(`reply=`, reply);
          problems++
        }
      }

      if (problems === 0) {
        this.$buefy.toast.open({ message: "Field order updated", type: "is-info" });
      } else {
        this.$buefy.toast.open({
          message: "Error updating field order",
          type: "is-danger",
        });
      }
      this.$emit('updated')
    },

    /*
     *  Learning the message from JSON
     */
    viewLearnByExample: function () {
      // console.log(`viewLearnByExample()`);

      // Create an object version of this field definition
      // this.exampleObject = FormserviceMisc.fieldsToObject(this.viewDef.fields);
      // console.log(`exampleObject=`, this.exampleObject);
      this.jsonToLearn = ''
      this.showLearnByExampleModal = true
      this.showLearnedFields = false
    },

    validateJsonToLearn: function () {
      // console.log(`validateJsonToLearn`)
      try {
        JSON.parse(this.jsonToLearn)
        this.jsonToLearnError = ''
      } catch (e) {
        console.log(`e=`, e)
        this.jsonToLearnError = e.toString()
      }
    },

    doLearn: async function () {
      // console.log(`doLearn()`)
      const obj = JSON.parse(this.jsonToLearn)
      this.learnedFields = [ ]
      this.checkedLearnedFields = [ ]
      this.recursiveLearn('', obj)
      // this.showLearnByExampleModal = false
      this.showLearnedFields = true
    },

    doCancelLearn: function () {
      // console.log(`doCancalLearn()`)
      this.showLearnByExampleModal = false
    },

    learnBack: async function () {
      this.showLearnedFields = false
    },

    learnAccept: async function () {

      let problem = false
      for (const lf of this.checkedLearnedFields) {

        // Work out a nice label from the name
        const pos = lf.name.lastIndexOf('.')
        let label = (pos >= 0) ? lf.name.substring(pos + 1) : lf.name
        label = label.substring(0, 1).toUpperCase() + label.substring(1)

        // Create the new field
        const field = {
          name: lf.name,
          label,
          type: lf.type,
          sequence: this.viewDef.fields.length,
          properties: {
            isPrimaryKey: false,
            isDescription: false,
            isMandatory: false,
            readonly: false,
            dollars2: false
          },
          _id: this.viewDef.fields.length + 1
        }
        this.viewDef.fields.push(field);

        // Now insert into the database
        const url = `${this.$monitorEndpoint}//formservice/field/${this.view}`;
        // console.log(`url=`, url)
        const reply = await axios.post(url, field);
        // console.log(`reply=`, reply.data);
        if (reply.status === 200) {
          // this.$buefy.toast.open({ message: "Field added", type: "is-info" });
        } else {
          // console.log(`reply=`, reply);
          this.$buefy.toast.open({
            message: "Error adding field",
            type: "is-danger",
          });
          problem = true
          break
        }
      }
      if (!problem) {
        this.$buefy.toast.open({ message: "Field list updated", type: "is-info" });
      }
      this.showLearnByExampleModal = false
      this.$emit('updated')
    },

    recursiveLearn(name, object) {

      const type = typeof(object)
      let alreadyExists
      switch (type) {
        case 'object':
          if (name) {name += '.'}
          for (let key in object) {
            const val = object[key]
            this.recursiveLearn(name + key, val)
          }
          break

        case 'string':
          alreadyExists = this.findFieldByName(name) != null
          this.learnedFields.push({ alreadyExists, name, type: 'string', example: object })
          break

        case 'number':
          // console.log(`NUMBER ${name}: example = ${object}`)
          alreadyExists = this.findFieldByName(name) != null
          this.learnedFields.push({ alreadyExists, name, type: 'number', example: object })
          break

        case 'date':
          // console.log(`DATE ${name}: example = ${object}`)
          alreadyExists = this.findFieldByName(name) != null
          this.learnedFields.push({ alreadyExists, name, type: 'date', example: object })
          break

        default:
          console.log(`UNKNOWN TYPE ${type} for ${name}.`)
      }
    },
  }, //- methods

};

</script>

<style lang="scss">
.formservice-fields {
  .my-table table {
    cursor: pointer;
  }
}
</style>