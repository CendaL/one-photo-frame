import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const state = {
    photos: ['1', '3']
}

const mutations = {
    add (state, file) {
        state.photos.push(file)
    }

}

export default new Vuex.Store({
    strict: process.env.NODE_ENV !== 'production',
    state,
    mutations
})
