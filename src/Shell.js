import Vue from 'vue'
import store from './store'

const routes = {
  '/slideshow': 'Slideshow',
  '/settings': 'Settings'
}

const app = new Vue({
  el: '#app',
  data: {
    currentRoute: window.location.pathname
  },
  computed: {
    ViewComponent () {
      const matchingView = routes[this.currentRoute]
      return matchingView
        ? require('./' + matchingView + '.vue')
        : require('./Slideshow.vue')
    }
  },
  store,
  render (h) {
    return h(this.ViewComponent)
  }
});

window.addEventListener('popstate', () => {
  app.currentRoute = window.location.pathname
});
