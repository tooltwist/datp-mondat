/* Copyright Tooltwist Innovations Limited - All Rights Reserved
 * This file is part of DATP and as such is proprietary and confidential software.
 * Unauthorized copying of this file, via any medium is strictly prohibited. All
 * rights reserved. No warranty, explicit or implicit, provided. In no event shall
 * the author or owner be liable for any claim or damages.
 */
<template lang="pug">
  .my-steps-page

    section.section
      .is-pulled-right
        template(v-if="displayedVersion==='draft'")
          b-button(type="is-warning", @click="commitDraft") Commit
          | &nbsp;&nbsp;&nbsp;
          b-button(type="is-warning", @click="saveDraftSteps") Save
        | &nbsp;&nbsp;&nbsp;
        b-button(type="is-gray", @click="backToPipelines") Back
      h2.title.is-4
        .datemon-heading-icon
          b-icon(icon="bank-transfer", size="is-small")
        | Pipeline '{{pipelineName}}' &nbsp;&nbsp;&nbsp;
        b-tag(v-if="displayedVersion==='draft'", type="is-primary") &nbsp;Draft version - can be modified&nbsp;
        b-tag(v-else-if="displayedVersion===pipelineType.pipelineVersion", type="is-success") &nbsp;viewing {{shortVersion(displayedVersion)}} - currently in use&nbsp;
        b-tag(v-else, type="is-danger") &nbsp;viewing {{shortVersion(displayedVersion)}} - not in use&nbsp;
        template(v-if="!YnodeGroupActive")
          | &nbsp;&nbsp;
          b-tag(type="is-danger") &nbsp;Node group {{pipelineType.nodeGroup}} is not active&nbsp;
      .my-small-version {{displayedVersion}} &nbsp; {{displayedVersion==='draft' ? '' : latestCommitCommentForDisplayedPipeline}}

      span(v-if="loading")
        | Loading...
      span(v-else-if="loadError")
        .notification.is-danger() {{loadError}}
      template(v-else)
        b-tabs(v-model="currentTab")


          //
          //  Tab for pipeline details
          //
          b-tab-item(key="details", label="Details")
            .my-update-status.has-text-right &nbsp; {{YupdateStatus}}
            br
            b-field(horizontal, label="Name", label-position="inside")
              b-input(v-model="pipelineName", readonly)
            br
            b-field(horizontal, label="Description", label-position="inside")
              b-input(v-model="YeditableDescription", @input="saveAnyPipelineTypeUpdates")

            br
            br
            b-field(horizontal)
              b-checkbox(v-model="YeditableIstransactionType", @input="saveAnyPipelineTypeUpdates") Can this pipeline be used as a transaction type?

            //- | {{pipelineVersions}}
            br
            b-field(horizontal, label="Version in use", label-position="inside")
              //- b-input(v-model="version")
              b-select(v-model="YeditablePipelineVersion", @input="saveAnyPipelineTypeUpdates")
                option(:value="'disabled'", :key="'disabled'")
                  | disabled
                option(v-for="version in pipelineVersions", :value="version.version", :key="version.version")
                  | {{ shortVersion(version.version) }}
                  | {{(version.version==='draft'||!version._latestCommitComment) ? '' : ' - ' + version._latestCommitComment}}

            br
            b-field(horizontal, label="Run in node group", label-position="inside")
              b-select(v-model="YeditableNodeGroup", @input="saveAnyPipelineTypeUpdates")
                option(v-for="nodeGroup in activeNodes", :value="nodeGroup.nodeGroup", :key="nodeGroup.nodeGroup")
                  | {{ nodeGroup.nodeGroup }}

            br
            b-field(label="Notes")
              textarea.textarea(rows="15", v-model="YeditableNotes", placeholder="Enter any notes here...", @input="saveAnyPipelineTypeUpdates")
            //- br
            //- hr
            //- | {{pipelineType}}


          //
          //  Tab with pipeline versions
          //
          b-tab-item(key="versions", label="All versions")
            //- | {{pipelineVersions}}
            MondatTable(:data="pipelineVersions",
                :columns="versionsColumns",
                @select="setDisplayedVersion",
                @clone="cloneButton",
                @delete="deleteButton",
                @export="exportButton")



          //
          // Tab for the pipeline definition.
          //
          b-tab-item(key="definition", label="Definition")
            br
            .my-pipeline-header Pipeline Steps for {{shortVersion(displayedVersion)}}
            br
            .columns

              // Column showing the pipeline
              .column.is-one-third
                .my-backdrop
                  //- .my-pipeline-header {{pipelineName}}
                  template(v-if="YnodeGroupActive")
                    draggable(v-model="Ysteps", :group="{ name: 'myList' }")
                      transition-group
                        div(v-for="(step, index) in Ysteps", :key="step.id")
                          StepBox(:step="step", :stepNo="index", :editable="YstepsEditable", :validStepTypes="YstepTypeIndex", @changed="onStepDefinitionChange", @deleted="onStepDelete", :open="stepOpen===index", @open="stepOpen = index")
                  template(v-else)
                        div(v-for="(step, index) in Ysteps", :key="step.id")
                          StepBox(:step="step", :stepNo="index", :editable="false", :validStepTypes="YstepTypeIndex", @changed="onStepDefinitionChange", @deleted="onStepDelete", :open="stepOpen===index", @open="stepOpen = index")
                  //- | displayedVersion: {{displayedVersion}}
                  //- br
                  //- | Ysteps: {{Ysteps}}

              .column.is-one-quarter

              // Column with available step types
              .column.is-one-third
                .my-backdrop
                  template(v-if="!YstepsEditable")
                    br
                    MondatNotification
                      p
                        | This pipeline cannot be modified because it's definition
                        | has already been committed. If you would like to make changes,
                        | click on the clone button above to create a draft version.

                  template(v-if="!YnodeGroupActive")
                    br
                    br
                    br
                    br
                    MondatNotification
                      p
                        | This pipeline is configured to run on a Node group that
                        | is not currently active, so we are unable to determine
                        | the supported step types.
                      p
                        | To edit the pipeline definition, either start a node in node
                        | group '{{pipelineType.nodeGroup}}', or configure the pipeline to
                        | run in a different node group.

                  template(v-if="YstepsEditable && YnodeGroupActive")
                    span.my-pipeline-header-2 Available Steps &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    span.is-size-6 (to drag &amp; drop)
                    .is-size-6
                      br
                    b-field(horizontal, label="Filter", custom-class="is-small")
                      b-input(name="filter", expanded, rounded, size="is-small", placeholder="search...", v-model="filter")
                    //draggable(v-model="filterdStepTypes", :sort="false", :group="{ name: 'myList', put: false, pull: 'clone' }", :clone="stepFromStepType")
                      transition-group
                        div(v-for="st in filterdStepTypes", :key="st.id")
                          StepTypeBox(:stepType="st", :editing="true")
                    //- div(v-for="group in filteredAvailableStepTypeGroups")
                      | {{group.group}}
                      draggable(v-model="group.types", :sort="false", :group="{ name: 'myList', put: false, pull: 'clone' }", :clone="stepFromStepType")
                        transition-group
                          div(v-for="st in group.types", :key="st.id")
                            StepTypeBox(:stepType="st", :editing="true")
                    b-collapse(animation="slide", v-for="(group, index) in filteredAvailableStepTypeGroups", :key="index", :open="stepTypeGroupOpen===index", @open="stepTypeGroupOpen = index")
                      template(#trigger="props")
                        .my-group-name {{group.group}}
                      draggable(v-model="group.types", :sort="false", :group="{ name: 'myList', put: false, pull: 'clone' }", :clone="stepFromStepType")
                        transition-group
                          div(v-for="st in group.types", :key="st.id")
                            StepTypeBox(:stepType="st", :editing="true")

          //
          // Tab for commit history.
          //
          b-tab-item(key="history", label="History")
            br
            .my-pipeline-header History for {{shortVersion(displayedVersion)}}
            br
            //- | {{YcommitLog}}
            MondatTable(:data="YcommitLog", :columns="commitLogColumns")


          //
          // Tab with description and notes
          //
          //- b-tab-item(key="notes", label="Notes")
            b-field(label="Notes")
              textarea.textarea(rows="15", v-model="notes", placeholder="Enter any notes here...")
        //- hr
        //- | pipelineVersions: {{pipelineVersions}}

</template>

<script>
import draggable from "vuedraggable"
import StepBox from '~/components/StepBox.vue'
import StepTypeBox from '~/components/StepTypeBox.vue'
import MondatTable from "~/components/MondatTable.vue"

// Time before saving changes
const SAVE_DELAY = 1000


export default {
  components: {
    StepBox,
    StepTypeBox,
    draggable,
    MondatTable,
  },

  async asyncData({ $axios, $monitorEndpoint, params }) {
    // Only run on the client
    // alert('pipeline 1')
    if (process.server) {
      return { }
    }
    // alert('pipeline 2')

    const pipelineName = params.pipelineName
    try {

      /*
       *  Get a list of nodeGroups, and the available steps in those node groups.
       */
      const url1 = `${$monitorEndpoint}/activeNodes?stepTypes=true`
      const activeNodes = await $axios.$get(url1)

      /*
       *  Get details of this pipeline, including versions and their definitions.
       */
      const url2 = `${$monitorEndpoint}/pipeline/${pipelineName}`
      const { type: pipelineType, pipelines } = await $axios.$get(url2)
      // console.log(`pipelineType=`, pipelineType)
      // console.log(`pipelines=`, pipelines)

      // Sort the pipelines by version
      pipelines.forEach(setLatestCommentFields)
      pipelines.sort(comparePipelineVersions)

      // If this pipelineType is disabled, show the first available version
      const displayedVersion = (pipelineType.pipelineVersion === 'disabled') ? pipelines[0].version : pipelineType.pipelineVersion
      // console.log(`displayedVersion=`, displayedVersion)

      // Get the steps for the current pipeline, and details
      // of step types available in it's current node group.
      const requiredNodeGroup = pipelineType.nodeGroup
      const { steps, stepTypeArray, stepTypeIndex, commitLog, nextId} = stepsAndStepTypes(pipelines, displayedVersion, activeNodes, requiredNodeGroup)
      return { 
        Ysteps: steps, YstepTypeArray: stepTypeArray, YstepTypeIndex: stepTypeIndex, YcommitLog: commitLog, YnextStepId: nextId,
        
        pipelineName, activeNodes, pipelineType, pipelineVersions: pipelines, displayedVersion, loading: false,

        YeditableDescription: pipelineType.description,
        YeditableIstransactionType: pipelineType.isTransactionType,
        YeditableNodeGroup: pipelineType.nodeGroup,
        YeditablePipelineVersion: pipelineType.pipelineVersion,
        YeditableNotes: pipelineType.notes,
      }
    } catch (e) {
      console.log(`e.response=`, e.response)
      return { loading: false, loadError: e.toString() }
    }
  },

  data: function () {
    return {
      loading: true,
      loadError: null,

Ysteps: [ ],
YstepTypeArray: [ ],
YstepTypeIndex: { },
YnextStepId: 0,
YcommitLog: [ ],

      stepOpen: -1,
      stepTypeGroupOpen: 0, // expanded step type group

      currentTab: 0,
      pipelineName: '',
      pipelineType: {},
      pipelineVersions: [ ],

      // PipelineType editing stuff
      YeditableDescription: null,
      YeditableIstransactionType: null,
      YeditableNodeGroup: null,
      YeditablePipelineVersion: null,
      YeditableNotes: null,

      // Pipeline editing stuff
      displayedVersion: '',

      // description: '',
      // version: '',
      // notes: '',
      // nodeGroup: '',
      // version: '',
      // isTransactionType: false,

      activeNodes: [ ],
      // steps: [ ],
      // stepTypes: [ ],
      // validStepTypes: { },
      groups: [ ],
      filter: '',

      group: { },
      nextId: 0,
      dirty: false, // needs to be updated

      versionsColumns: [
        {
            field: '_shortVersion',
            label: 'Version',
        },
        {
            field: '_latestCommitTimestamp',
            label: 'Time',
            type: 'dateTime'
        },
        {
            field: '_latestCommitComment',
            label: 'Commit',
        },
        {
            field: 'tags',
            label: 'Tags',
        },
        {
          type: 'button',
          label: 'export',
          customEvent: 'export',
        },
        {
          type: 'button',
          label: 'clone',
          customEvent: 'clone',
        },
        {
          type: 'button',
          label: 'delete',
          customEvent: 'delete',
        },
      ],

      commitLogColumns: [
        {
            field: 'ts',
            label: 'Timestamp',
            type: 'dateTime',
            // width: 400
        },
        {
            field: 'v',
            label: 'Version',
        },
        {
            field: 'm',
            label: 'Comment',
        },
      ],

      // show when the pipeline details are being saved
      Ydirty: false,
      YupdateStatus: '',
      saveTimer: null,
    }
  },

  computed: {
    latestCommitCommentForDisplayedPipeline: function () {
      const pipeline = this.pipelineVersions.find(pipeline => (pipeline.version === this.displayedVersion))
      return pipeline?._latestCommitComment
    },

    /**
     * Return an array of step types for the current node group.
     */
    filteredAvailableSteps: function () {
      //console.log(`filteredAvailableSteps()`)

      // Find the node group for the displayed pipeline.
      const nodeGroup = this.pipelineType.nodeGroup
      // activeNodes is [ {nodeGroup, nodes:[], stepTypes:[], warnings:[] }, ...]
      const group = this.activeNodes.find(group => group.nodeGroup === nodeGroup)
      const stepTypes = group.stepTypes.sort(compareStepTypes)

      // Filter the list
      const words = this.filter.split(' ')
      const list = stepTypes.filter((stepType) => {
        const description = stepType.description.toUpperCase()
        const name = stepType.name.toUpperCase()
        for (const word of words) {
          const w2 = word.trim().toUpperCase()
          if (w2 && !description.includes(w2) && !name.includes(w2)) {
            return false // no match
          }
        }
        return true
      })
      return list
    },

    filteredAvailableStepTypeGroups: function () {
      // Organise the step types into groups
      const list = this.filteredAvailableSteps
      const groups = [ ]
      let currentGroup = null
      for (const type of list) {
        // Do not display the hidden group
        if (type._group === 'hidden') {
          continue
        }
        if (currentGroup === null || currentGroup.group !== type._group) {
          currentGroup = { group: type._group, types: [ ] }
          groups.push(currentGroup)
        }
        currentGroup.types.push(type)
      }
      // console.log(`groups=`, groups)
      return groups
    },

    YstepsEditable: function () {
      // console.log(`YstepsEditable - ${this.displayedVersion === 'draft'}, ${this.YnodeGroupActive}`)
      const condition1 = (this.displayedVersion === 'draft')
      const condition2 = this.YnodeGroupActive
      return condition1 && condition2
    },

    YnodeGroupActive: function () {
      const currentNodeGroup = this.pipelineType.nodeGroup
      // console.log(`YnodeGroupActive - currentNodeGroup=${currentNodeGroup}`)
      const group = this.activeNodes.find(group => (group.nodeGroup === currentNodeGroup))
      // console.log(`group=`, group)
      const active = (group?.nodes.length > 0)
      return active
    },
  },

  methods: {

    backToPipelines () {
      this.$router.push({ path: `/mondat/pipelines` })
    },


    async saveAnyPipelineTypeUpdates () {
      // console.log(`saveAnyPipelineTypeUpdates()`)

      const { changed } = this.checkForPipelineTypeUpdates(false)
      if (changed) {
        if (this.saveTimer) {
          clearTimeout(this.saveTimer)
          this.saveTimer = null
        }
        this.dirty = true
        this.YupdateStatus = 'to save'
        this.saveTimer = setTimeout(async () => {
          this.saveTimer = null
          const { updates } = this.checkForPipelineTypeUpdates(true)
          this.YupdateStatus = 'saving'
          // console.log(`SAVING`, updates)

          // Pass the update to the server
          const url = `${this.$monitorEndpoint}/pipelineType/${this.pipelineName}`
          // console.log(`url=`, url)
          const result = await this.$axios.$post(url, updates)
          // console.log(`result=`, result)

          this.YupdateStatus = 'saved'
          setTimeout(() => { this.YupdateStatus = ' ' }, 1000)
        }, SAVE_DELAY)
      }
    },

    checkForPipelineTypeUpdates(updatePipelineTypeRecord) {
      let changed = false
      const updates = { }
      if (this.YeditableDescription != this.pipelineType.description) {
        // console.log(`description changed`)
        updates.description = this.YeditableDescription
        if (updatePipelineTypeRecord) {
          this.pipelineType.description = this.YeditableDescription
        }
        changed = true
      }
      if (this.YeditableIstransactionType != this.pipelineType.isTransactionType) {
        // console.log(`isTransactionType changed`)
        updates.isTransactionType = this.YeditableIstransactionType
        if (updatePipelineTypeRecord) {
          this.pipelineType.isTransactionType = this.YeditableIstransactionType
        }
        changed = true
      }
      if (this.YeditablePipelineVersion != this.pipelineType.pipelineVersion) {
        // console.log(`pipelineVersion changed`)
        this.displayedVersion = this.YeditablePipelineVersion
        updates.pipelineVersion = this.YeditablePipelineVersion
        if (updatePipelineTypeRecord) {
          this.pipelineType.pipelineVersion = this.YeditablePipelineVersion
        }
        changed = true
      }
      if (this.YeditableNodeGroup != this.pipelineType.nodeGroup) {
        // console.log(`nodeGroup changed`)
        updates.nodeGroup = this.YeditableNodeGroup
        if (updatePipelineTypeRecord) {
          this.pipelineType.nodeGroup = this.YeditableNodeGroup
        }
        changed = true
      }
      if (this.YeditableNotes != this.pipelineType.notes) {
        // console.log(`notes changed`)
        updates.notes = this.YeditableNotes
        if (updatePipelineTypeRecord) {
          this.pipelineType.notes = this.YeditableNotes
        }
        changed = true
      }
      // console.log(`changed=`, changed)
      // console.log(`updates=`, updates)
      return { changed, updates}
    },

    async resetStepsAndStepTypes () {
      // console.log(`\nresetStepsAndStepTypes()`)
      const requiredPipelineVersion = this.displayedVersion
      const requiredNodeGroup = this.pipelineType.nodeGroup
      const { steps, stepTypeArray, stepTypeIndex, nextId, commitLog} = stepsAndStepTypes(this.pipelineVersions, requiredPipelineVersion, this.activeNodes, requiredNodeGroup)
      this.Ysteps = steps
      this.YstepTypeArray = stepTypeArray
      this.YstepTypeIndex = stepTypeIndex
      this.YnextStepId = nextId
      this.YcommitLog = commitLog
    },

    /**
     * Create a copy of the selected pipeline.
     */

    async cloneButton (rec) {
      console.log(`cloneButton()`, rec)

      if (rec.version === 'draft') {
        //ZZZZZ
        // The button should not be displayed.
        return
      }

      // See if we already have a draft pipeline.
      const draftPipeline = this.pipelineVersions.find(pipeline => (pipeline.version === 'draft'))
      if (draftPipeline) {
        this.$buefy.dialog.alert({
          title: 'Error',
          message: 'Sorry, this pipeline already has a draft pipeline.',
          type: 'is-danger'
        })
        return
      }
      this.doClone(rec.version)
    },

    async deleteButton (rec) {
      console.log(`deleteButton()`, rec)

      const versionToDelete = rec.version

      // Don't allow deleting the pipeline version currently in use
      // console.log(`versionToDelete=`, versionToDelete)
      // console.log(`this.pipelineType=`, this.pipelineType)
      if (versionToDelete === this.pipelineType.pipelineVersion) {
        // ZZZZZ Should not actually show the button
        this.$buefy.dialog.alert({
          title: 'Error',
          message: 'Sorry, cannot delete the version currently in use.',
          type: 'is-danger'
        })
        return
      }

      // Check the user wants to proceed.
      this.$buefy.dialog.confirm({
        title: 'Delete pipeline version?',
        message: `Are you sure you want to delete version ${versionToDelete} ${latestCommitComment(rec)}`,
        confirmText: 'Delete',
        type: 'is-danger',
        onConfirm: async () => {
          // Get the server to delete the pipeline version
          // console.log(`Time to delete`)
          const url = `${this.$monitorEndpoint}/pipeline/${this.pipelineName}/${versionToDelete}`
          console.log(`url=`, url)
          const result = await this.$axios.$delete(url)
          console.log(`result=`, result)

          // Reload the pipeline versions
          await this.reloadThePipelineVersions()
        }
      })
    },//- deleteButton

    async exportButton (rec) {
      console.log(`exportButton(${rec.version})`)

      const versionToExport = rec.version
      console.log(`rec.name=`, rec.name)

      // const exportObject = {
      //   name: rec.name,
      //   description: rec.description,
      //   commitComments: rec.commitComments,
      //   note: rec.notes,
      //   stepsJson: rec.stepsJson
      // }
      
      const url = `${this.$monitorEndpoint}/pipeline/${this.pipelineName}/${versionToExport}/export`
      console.log(`url=`, url)
      const response = await this.$axios.$get(url)
      console.log(`response=`, response)

      const filename = response.filename
      const contents = response.contents

      const fileURL = window.URL.createObjectURL(new Blob([contents]));
      const fileLink = document.createElement('a');

      fileLink.href = fileURL;
      fileLink.setAttribute('download', filename);
      document.body.appendChild(fileLink);

      fileLink.click();



      // // Don't allow deleting the pipeline version currently in use
      // // console.log(`versionToDelete=`, versionToDelete)
      // // console.log(`this.pipelineType=`, this.pipelineType)
      // if (versionToDelete === this.pipelineType.pipelineVersion) {
      //   // ZZZZZ Should not actually show the button
      //   this.$buefy.dialog.alert({
      //     title: 'Error',
      //     message: 'Sorry, cannot delete the version currently in use.',
      //     type: 'is-danger'
      //   })
      //   return
      // }

      // // Check the user wants to proceed.
      // this.$buefy.dialog.confirm({
      //   title: 'Delete pipeline version?',
      //   message: `Are you sure you want to delete version ${versionToDelete} ${latestCommitComment(rec)}`,
      //   confirmText: 'Delete',
      //   type: 'is-danger',
      //   onConfirm: async () => {
      //     // Get the server to delete the pipeline version
      //     console.log(`Time to delete`)
      //     const url = `${this.$monitorEndpoint}/pipeline/${this.pipelineName}/${versionToDelete}`
      //     console.log(`url=`, url)
      //     const result = await this.$axios.$delete(url)
      //     console.log(`result=`, result)

      //     // Reload the pipeline versions
      //     await this.reloadThePipelineVersions()
      //   }
      // })
    },//- deleteButton

    // async clonePipeline () {
    //   console.log(`clonePipeline()`)

    //   // See if we already have a draft pipeline.
    //   const draftPipeline = this.pipelineVersions.find(pipeline => (pipeline.version === 'draft'))
    //   if (draftPipeline) {
    //     this.$buefy.dialog.alert({
    //       title: 'Error',
    //       message: 'Sorry, this pipeline already has a draft pipeline.',
    //       type: 'is-danger'
    //     })
    //     return
    //   }
    //   this.doClone(this.displayedVersion)
    // },

    async doClone(versionToClone) {
      // console.log(`doClone()`)

      // Get the server to clone the currently displayed pipeline
      const url = `${this.$monitorEndpoint}/pipeline/clone/${this.pipelineName}/${versionToClone}`
      console.log(`url=`, url)
      const newPipeline = await this.$axios.$put(url)
      setLatestCommentFields(newPipeline)
      // console.log(`newPipeline=`, newPipeline)

      this.pipelineVersions.unshift(newPipeline)
      this.displayedVersion = 'draft'
      this.resetStepsAndStepTypes()
    },

    async saveDraftSteps () {
      console.log(`saveDraftSteps()`)
      if (this.displayedVersion !== 'draft') {
        this.$buefy.toast.open({
                    duration: 5000,
                    message: `Only the draft version can be saved`,
                    // position: 'is-bottom',
                    type: 'is-danger'
                })
        return
      }
      console.log(`this.Ysteps=`, this.Ysteps)
      const url = `${this.$monitorEndpoint}/pipeline/${this.pipelineName}`
      console.log(`url=`, url)
      await this.$axios.$post(url, this.Ysteps)

      await this.reloadThePipelineVersions()
    },

    async commitDraft () {
      console.log(`commitDraft()`)
      if (this.displayedVersion !== 'draft') {
        this.$buefy.toast.open({
                    duration: 5000,
                    message: `Only the draft version can be committed`,
                    // position: 'is-bottom',
                    type: 'is-danger'
                })
        return
      }

      // Ask for a commit comment
      this.$buefy.dialog.prompt({
        title: 'Commit draft version',
        message: `Comment:`,
        inputAttrs: {
            // placeholder: 'e.g. Walter',
            maxlength: 64
        },
        trapFocus: true,
        onConfirm: async (comment) => {
          // Commit the draft version
          const url = `${this.$monitorEndpoint}/pipeline/${this.pipelineName}/commit`
          console.log(`url=`, url)
          const reply = await this.$axios.$post(url, {comment})
          console.log(`reply=`, reply)
          this.displayedVersion = reply.version
          if (this.YeditablePipelineVersion === 'draft') {
            this.YeditablePipelineVersion = this.displayedVersion
          }
          this.reloadThePipelineVersions()
        }
      })
    },

    async reloadThePipelineVersions () {
      console.log(`reloadThePipelineVersions()`)
      // Reload the pipeline versions
      const url2 = `${this.$monitorEndpoint}/pipeline/${this.pipelineName}`
      const { type: pipelineType, pipelines } = await this.$axios.$get(url2)
      // console.log(`pipelineType=`, pipelineType)
      // console.log(`pipelines=`, pipelines)
      // Set temporary fields for display
      pipelines.forEach(setLatestCommentFields)
      // Sort the pipelines by version
      pipelines.sort(comparePipelineVersions)

      this.pipelineType = pipelineType
      this.pipelineVersions = pipelines
      this.resetStepsAndStepTypes()
    },

    shortVersion: function (version) {
      return shortVersionExternal(version)
    },

    /**
     * When dragging from the step type list to the steps list, we need to create a new step.
     */
    stepFromStepType (stepType, arg2, arg3, arg4) {
      // console.log(`stepFromStepType(): stepType=`, stepType)

      // Return a step
      const rec = {
        id: this.YnextStepId++,
        definition: stepType.defaultDefinition
      }
      rec.definition.stepType = stepType.name
      return rec
    }, //- stepFromStepType

    onStepDefinitionChange({ id, description, definition }) {
      console.log(`onStepDefinitionChange()`)
      console.log(`id=`, id)
      console.log(`definition=`, definition)

      let foundStep = false
      for (const step of this.Ysteps) {

        // See if this is the changed step
        // console.log(`${step.id} vs ${id}`)
        if (step.id === id) {
          // console.log(`found step`, step)
          step.definition = definition
          step.definition.description = description
          // for future
          step.description = description
          step.definition = definition
          // future
          // delete step.definition.description
          // delete step.definition.stepType
          this.dirty = true
          foundStep = true
        } else {
          // future
          // Take this chance to provide a slow migration:
          //    step.definition.stepType => step.stepType
          //    step.definition.description => step.description
          if (typeof(step.stepType) === 'undefined') {
            step.stepType = step.definition.stepType
          }
          if (typeof(step.description) === 'undefined') {
            step.descrription = step.definition.description
          }
        }
      }
      if (!foundStep) {
        console.log(`Internal error 2726551 - upknown step has been edited (${id})`)
      }
      return foundStep
    }, //- onStepDefinitionChange

    onStepDelete({ id }) {
      // console.log(`onStepDelete(${id})`)

      // const before = JSON.stringify(this.Ysteps, '', 2)
      // console.log(`before = ${before}`)

      for (let i = 0; i < this.Ysteps.length; i++) {
        const step = this.Ysteps[i]
        if (step.id === id) {
          // console.log(`found step at ${i}`, step)
          this.$delete(this.Ysteps, i)
          // console.log(`this.Ysteps=`, this.Ysteps)
          this.dirty = true
          break
        }
      }
      // const after = JSON.stringify(this.Ysteps, '', 2)
      // console.log(`after = ${after}`)
      // this.nextId = resequence(this.Ysteps)
    }, //- onStepDelete

    setDisplayedVersion: function (rec) {
      // console.log(`setDisplayedVersion()`, rec)
      this.displayedVersion = rec.version
      this.resetStepsAndStepTypes()
      this.currentTab = 2
    },

  }//- methods
}// End of Vue component


function shortVersionExternal (version) {
  if (version.length > 7) {
    return version.substring(0, 7)
  }
  return version
}

function compareStepTypes(stepType1, stepType2) {
  // Sort by group
  if (stepType1._group < stepType2._group) { return -1 }
  if (stepType1._group > stepType2._group) { return +1 }

  // Sort by description (yep, not name)
  const a = stepType1.description.toUpperCase()
  const b = stepType2.description.toUpperCase()
  if (a < b) { return -1 }
  if (a > b) { return +1 }
  return 0
}

/*
 * activeNodes: [ { nodeGroup, nodes: [ ], stepTypes: [ ], warnings: [ ] }, ... ]
 * stepType: 
 * steps:
 * sortedStepTypes: [ stepType ]
 * stepTypeIndex: Map of stepTypeName => stepType
 */

/**
 * Given an his function returns several things:
 * @param {Array<any>} pipelineVersions [ PipelineVersion ]
 * @param {string} requiredVersion A hash or 'draft'
 * @param {Array<NodeGroup>} activeNodes Array of node groups and their nodes
 *   [ { nodeGroup, nodes: [ ], stepTypes: [ ], warnings: [ ] }, ... ]
 * @param {string} requiredNodeGroup e.g. master
 * @Returns { steps, stepTypeArray, stepTypeIndex, commitLog, nextId }
 */
function stepsAndStepTypes(pipelineVersions, requiredVersion, activeNodes, requiredNodeGroup) {
  // console.log(`stepsAndStepTypes()`)
  // console.log(`activeNodes=`, activeNodes)

  // If this pipelineType is disabled, just show the first version available
  if (requiredVersion === 'disabled') {
    // This should not be allowed to happen
    return { steps: [ ], stepTypeArray: [ ], stepTypeIndex: { }, commitLog: [ ], nextId: 0 }
  }

  // Get the steps for the specified pipeline version.
  let pipeline = pipelineVersions.find(pipeline => (pipeline.version === requiredVersion))
  if (!pipeline) {
    return { steps: [ ], stepTypeArray: [ ], stepTypeIndex: { }, commitLog: [ ], nextId: 0 }
  }
  let steps = null
  try {
    steps = JSON.parse(pipeline.stepsJson)
    // break
  } catch (e) {
    console.log(`Invalid pipeline.stepsJson:`, e)
    console.log(pipeline.stepsJson)
    alert('Invalid step definition in database')
    return { steps: [ ], stepTypeArray: [ ], stepTypeIndex: { }, commitLog: [ ], nextId: 0 }
  }

  // Get the commit log
  let commitLog = [ ]
  try {
    commitLog = JSON.parse(pipeline.commitComments)
  } catch (e) {
    alert('Invalid commitComments:', e)
  }

  // Find the required node group
  const group = activeNodes.find(group => (group.nodeGroup === requiredNodeGroup))

  // Set _group and _name in each steptype, and sort them.
  for (const type of group.stepTypes) {
    type._group = 'miscellaneous'
    type._name = type.name
    const pos = type.name.indexOf('/')
    if (pos >= 0) {
      type._group = type.name.substring(0, pos)
      type._name = type.name.substring(pos + 1)
    }
  }
  const stepTypeArray = group.stepTypes.sort(compareStepTypes)

  // Create an index of valid step types
  const stepTypeIndex = { }
  for (const type of stepTypeArray) {
    stepTypeIndex[type.name] = type
  }

  // For drag and drop to work, we need unique key/id for each step and step type.
  const nextId = resequence(steps)
  let typeId = 100000
  for (const st of stepTypeArray) {
    st.id = typeId++
  }
  return { steps, stepTypeArray, stepTypeIndex, commitLog, nextId}
}

/**
 * Give each step a sequential ID. This is required for drag&drop.
 */
function resequence(steps) {
  let nextId = 0
  for (const step of steps) {
    step.id = nextId++
  }
  return nextId
}

function comparePipelineVersions(p1, p2) {
  // console.log(`comparePipelineVersions(${p1.version}, ${p2.version})`)

  // Put the draft pipeline first
  const isDraft1 = (p1.version === 'draft') ? 0 : 1
  const isDraft2 = (p2.version === 'draft') ? 0 : 1
  if (isDraft1 < isDraft2) return -1
  if (isDraft1 > isDraft2) return +1

  // Sort by the last commit time
  const time1 = (p1._latestCommitTimestamp) ? p1._latestCommitTimestamp.getTime() : 0
  const time2 = (p2._latestCommitTimestamp) ? p2._latestCommitTimestamp.getTime() : 0
  // console.log(` - ${time1} vs ${time2}`)
  if (time1 < time2) return +1
  if (time1 > time2) return -1

  // Sort by version number (if the last commit times are ever the same)
  if (p1.version < p2.version) return -1
  if (p1.version > p2.version) return +1

  return null
}

/**
 * For a pipeline, look at the most recent entry in the commit history
 * and add temporary values to the pipeline so we can display them.
 */
function setLatestCommentFields(pipeline) {

  //ZZZZZ Use latestCommit below
  pipeline._shortVersion = shortVersionExternal(pipeline.version)
  pipeline._latestCommitTimestamp = 0
  pipeline._latestCommitComment = ''
  try {
    const cc = JSON.parse(pipeline.commitComments)
    if (cc.length > 0) {
      const ts = cc[0].ts
      if (ts) {
        pipeline._latestCommitTimestamp = new Date(ts)
      }
      pipeline._latestCommitComment = cc[0]?.c ?? ''
    }
  } catch (e) {
    // Do nothing
  }
}

function latestCommitComment(pipeline) {

  const { timestamp, comment } = latestCommit(pipeline)
  if (comment) {
    return `(${comment}`
  }
  return ''
}

function latestCommit(pipeline) {
  let timestamp = 0
  let comment = ''
  try {
    const cc = JSON.parse(pipeline.commitComments)
    if (cc.length > 0) {
      const ts = cc[0].ts
      if (ts) {
        timestamp = new Date(ts)
      }
      comment = cc[0]?.c ?? ''
    }
  } catch (e) {
    // Do nothing
  }
  return { timestamp, comment }
}
</script>

<style lang="scss">
.my-steps-page {
  .my-update-status {
    font-size: 0.7em;
    color: #d0d0d0;
  }

  .my-small-version {
    font-size: 0.8em;
    margin-left: 38px;
    margin-top: -20px;
    margin-bottom: 20px;
  }

  .my-group-name {
    margin-top: 5px;
    color: #16aa58;
    font-size: 1em;
  }

  .my-pipeline-header {
    font-size: 20px;
    color: white;
    // text-align: center;
    text-align: left;
    // width: 460px;
  }
  .my-pipeline-header-2 {
    font-size: 20px;
    color: white;
    text-align: left;
    // width: 300px;
  }
}
</style>
