import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedStore from 'vuex-persistedstate'

Vue.use(Vuex)

const state = {
    photos: ['14-before_call_start.bmp', '16-participant_joined_call.bmp']
}

const mutations = {
    addPhoto(state, file) {
        state.photos.push(file)
    }

}

export default new Vuex.Store({
    strict: process.env.NODE_ENV !== 'production',
    state,
    mutations,
    plugins: [createPersistedStore()]
})
