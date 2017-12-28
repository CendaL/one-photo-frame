import Vue from 'vue'
import store from './store'
import { mapMutations, mapState, mapActions } from "vuex"

const routes = {
    '/slideshow': 'Slideshow',
    '/settings': 'Settings'
}

const app = new Vue({
    el: '#app',
    store,
    computed: {
        ...mapState(["currentPhoto", "currentRoute"]),
        ViewComponent() {
            return require('./' + routes[this.currentRoute] + '.vue')
        }
    },
    methods: {
        ...mapActions(["navigate"])
    },
    created() {
        this.navigate({
            route: routes[window.location.pathname] ? window.location.pathname : "/slideshow",
            photo: window.location.hash.replace(/^#/, "") || this.currentPhoto,
            replaceHistory: true
        })
    },
    render(h) {
        return h(this.ViewComponent)
    }
})

window.addEventListener('popstate', (event) => {
    if (routes[window.location.pathname]) {
        app.navigate({
            route: window.location.pathname,
            photo: window.location.hash.replace(/^#/, ""),
            addToHistory: false
        })
    }
})

