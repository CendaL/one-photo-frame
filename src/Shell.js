import Vue from "vue";
import store from "./store";
import qs from "querystringify";
import { mapMutations, mapState, mapActions } from "vuex";

const routes = {
  "/slideshow": "Slideshow",
  "/settings": "Settings"
};

const app = new Vue({
  el: "#app",
  store,
  computed: {
    ...mapState(["currentPhoto", "currentRoute"]),
    ViewComponent() {
      return require("./" + routes[this.currentRoute] + ".vue");
    }
  },
  methods: {
    ...mapActions(["navigate"])
  },
  created() {
    console.debug(`created ${window.location.pathname}`);
    const qsp = qs.parse(window.location.search);
    if (qsp.id_token || qsp.access_token) {
      return;
    }
    this.navigate({
      route: routes[window.location.pathname] ? window.location.pathname : "/slideshow",
      photo: qsp.photo || (this.currentPhoto && this.currentPhoto.path),
      replaceHistory: true
    });
  },
  render(h) {
    return h(this.ViewComponent);
  }
});

window.addEventListener("popstate", event => {
  if (routes[window.location.pathname]) {
    console.debug(`popstate ${window.location.pathname}${window.location.search}`);
    const qsp = qs.parse(window.location.search);
    app.navigate({
      route: window.location.pathname,
      photo: qsp.photo,
      addToHistory: false
    });
  }
});
