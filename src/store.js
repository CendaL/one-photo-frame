import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedStore from 'vuex-persistedstate'

Vue.use(Vuex)

const state = {
    currentPhoto: null,
    currentRoute: null,
    photos: ['14-before_call_start.bmp', '16-participant_joined_call.bmp']
}

const mutations = {
    addPhoto(state, file) {
        state.photos.push(file)
    },
    nextPhoto(state, photo) {
        var prefix = 'nextPhoto '
        // make sure next photo is different from current one
        if (!photo || state.photos.indexOf(photo) === -1) {
            photo = state.photos[getRandomInt(0, state.photos.length)]
            prefix = 'nextPhoto random '
        }
        console.log(prefix + state.currentPhoto + " => " + photo)
        state.currentPhoto = photo
    },
    setRoute(state, route) {
        state.currentRoute = route
    },
}

const actions = {
    navigate({ state, commit }, options) {
        console.log("navigate " + window.location.pathname + window.location.hash + " => " + JSON.stringify(options))
        if (state.currentRoute !== options.route) {
            commit('setRoute', options.route)
        }
        if (options.route === "/slideshow" && (options.photo !== undefined || state.currentPhoto == null)) {
            commit('nextPhoto', options.photo)
        }
        if (options.addToHistory !== false) {
            const newLocation = getLocation(state.currentRoute, state.currentPhoto)
            if (options.replaceHistory) {
                window.history.replaceState(null, "", newLocation)
            } else {
                window.history.pushState(null, "", newLocation)
            }
        }
        document.title = options.route === "/slideshow" ? state.currentPhoto : options.route
    }
}

function getLocation(route, photo) {
    return route + (route === "/slideshow" ? "#" + photo : "")
}

function getRandomInt(min, max) {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min)) + min
}

export default new Vuex.Store({
    strict: process.env.NODE_ENV !== 'production',
    state,
    mutations,
    actions,
    plugins: [createPersistedStore()]
})
