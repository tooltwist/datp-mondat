/* Copyright Tooltwist Innovations Limited - All Rights Reserved
 * This file is part of DATP and as such is proprietary and confidential software.
 * Unauthorized copying of this file, via any medium is strictly prohibited. All
 * rights reserved. No warranty, explicit or implicit, provided. In no event shall
 * the author or owner be liable for any claim or damages.
 */
import formserviceMisc from "~/lib/formservice-misc"

//ZZZZZ HACK. This should be set in plugins/config.js
import config from "../protected-config/websiteConfig"
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
  async prepare({ commit, $formserviceEndpointZ }, { leftViewName, rightViewName, mappingId, provider, service }) {
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

  async reloadRightView({ commit, state, $formserviceEndpointZ }, { }) {
    // console.log(`ACTION reloadRightView()`)
    const view = await formserviceMisc.getView($formserviceEndpoint, state.rightViewName)
    commit('setRightView', { viewName: state.rightViewName, view })
  },

  async reloadMapping({ commit, state, $formserviceEndpoint }) {
    // console.log(`ACTION reloadMapping()`)
    const mapping = await formserviceMisc.getMapping($formserviceEndpointZ, state.mappingId)
    commit('setMapping', { mappingId: state.mappingId, mapping })
  },
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
  }
}
