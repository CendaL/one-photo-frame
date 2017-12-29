import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedStore from 'vuex-persistedstate'

Vue.use(Vuex)

const state = {
    currentPhoto: null,
    currentRoute: null,
    isSlideshowRunning: false,
    photos: ['0101_193656.jpg', '0112_114149.jpg', '0113_090252.jpg', '0113_165610.jpg', '0113_165610.mp4', '0126_134447.jpg'],
    slideshowDelay: 1
}

const mutations = {
    addPhoto(state, file) {
        state.photos.push(file)
    },
    nextPhoto(state, photo) {
        var prefix = 'nextPhoto '
        if (!photo || state.photos.indexOf(photo) === -1) {
            do {
                photo = state.photos[getRandomInt(0, state.photos.length)]
            } while (state.currentPhoto === photo)
            prefix = 'nextPhoto random '
        }
        console.log(prefix + state.currentPhoto + " => " + photo)
        state.currentPhoto = photo
    },
    setRoute(state, route) {
        state.currentRoute = route
    },
    toggleSlideshow(state) {
        state.isSlideshowRunning = !state.isSlideshowRunning
    }
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
