/* Copyright Tooltwist Innovations Limited - All Rights Reserved
 * This file is part of DATP and as such is proprietary and confidential software.
 * Unauthorized copying of this file, via any medium is strictly prohibited. All
 * rights reserved. No warranty, explicit or implicit, provided. In no event shall
 * the author or owner be liable for any claim or damages.
 */
import axios from "axios"

//ZZZZZ HACK. This should be set in plugins/config.js
import config from "../protected-config/websiteConfig"
import formserviceMisc from "~/lib/formservice-misc"
const api = config.api
const $formserviceEndpoint = `${api.protocol}://${api.host}:${api.port}/${config.prefix.formservice}/${api.version}`
//console.log(`$formserviceEndpoint=`, $formserviceEndpoint)

export const state = () => ({
  provider: null,
  service: null,

  mappingId: null,
  mapping: [ ],
  leftViewName: null,
  leftView: null,
  rightViewName: null,
  rightView: null,
})

export const actions = {
  async prepare({ commit }, { leftViewName, rightViewName, mappingId, provider, service }) {
    // console.log(`ACTION prepare(${leftViewName}, ${rightViewName}, ${mappingId})`)
    // console.log(`$formserviceEndpoint=`, $formserviceEndpoint)

    if (leftViewName && rightViewName && mappingId) {
      const left = await formserviceMisc.getView($formserviceEndpoint, leftViewName)
      commit('setLeftView', { viewName: leftViewName, view: left })
      const right = await formserviceMisc.getView($formserviceEndpoint, rightViewName)
      commit('setRightView', { viewName: rightViewName, view: right })
      const mapping = await formserviceMisc.getMapping($formserviceEndpoint, mappingId)
      commit('setMapping', { mappingId, mapping, provider, service })
    }
  },

  async reloadRightView({ commit, state }, { }) {
    // console.log(`ACTION reloadRightView()`)
    const view = await formserviceMisc.getView($formserviceEndpoint, state.rightViewName)
    commit('setRightView', { viewName: state.rightViewName, view })
  },

  async reloadMapping({ commit, state, $formserviceEndpoint }) {
    // console.log(`ACTION reloadMapping()`)
    const mapping = await formserviceMisc.getMapping($formserviceEndpoint, state.mappingId)
    commit('setMapping', { mappingId: state.mappingId, mapping })
  },

  async setRightViewDetails({ commit, state }, { description, notes }) {
    console.log(`setRightViewDetails()`)
    console.log(`description=`, description)
    console.log(`notes=`, notes)
    const url = `${$formserviceEndpoint}/viewDetails`
    console.log(`url=`, url)
    console.log(`state.rightView=`, state.rightView)

    try {
      const view = {
        name: state.rightView.name,
        //version: state.rightView.version,
        version: -1,
      }
      if (description) {
        view.description = description
      }
      if (notes) {
        view.notes = notes
      }
      console.log(`view=`, view)
      await axios.put(url, view)

      // Now update locally
      commit('setRightViewDetailsMutation', { description, notes })
    } catch (e) {
      console.log(`Error: url=`, url)
      console.log(`e.response=`, e.response)
      alert(`Unable to update details`)
    }
  }
}

export const mutations = {
  setLeftView(state, { viewName, view }) {
    // console.log(`MUTATION viewMapping:setLeftView(${viewName})`, view)
    state.leftViewName = viewName
    state.leftView = view
  },

  setRightView(state, { viewName, view }) {
    // console.log(`MUTATION viewMapping:setRightView(${viewName})`, view)
    state.rightViewName = viewName
    state.rightView = view
  },

  setMapping(state, { mappingId, mapping, provider, service }) {
    // console.log(`MUTATION viewMapping:setMapping()`)
    // console.log(`  mappingId=`, mappingId)
    // console.log(`  mapping=`, mapping)
    state.mappingId = mappingId
    state.mapping = mapping
    if (provider) {
      state.provider = provider
    }
    if (service) {
      state.service = service
    }
  },

  setRightViewDetailsMutation(state, { description, notes }) {
    console.log(`MUTATION setRightViewDetailsMutation()`)
    if (description) {
      state.rightView.description = description
    }
    if (notes) {
      state.rightView.notes = notes
    }
  },

  setNotes(state, { notes }) {
    state.rightView.notes = notes
  }
}
