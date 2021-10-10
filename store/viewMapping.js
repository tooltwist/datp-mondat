import formserviceMisc from "~/lib/formservice-misc"

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
    if (leftViewName && rightViewName && mappingId) {
      const left = await formserviceMisc.getView(leftViewName)
      commit('setLeftView', { viewName: leftViewName, view: left })
      const right = await formserviceMisc.getView(rightViewName)
      commit('setRightView', { viewName: rightViewName, view: right })
      const mapping = await formserviceMisc.getMapping(mappingId)
      commit('setMapping', { mappingId, mapping, provider, service })
    }
  },

  async reloadRightView({ commit, state }, { }) {
    // console.log(`ACTION reloadRightView()`)
    const view = await formserviceMisc.getView(state.rightViewName)
    commit('setRightView', { viewName: state.rightViewName, view })
  },

  async reloadMapping({ commit, state }) {
    // console.log(`ACTION reloadMapping()`)
    const mapping = await formserviceMisc.getMapping(state.mappingId)
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
