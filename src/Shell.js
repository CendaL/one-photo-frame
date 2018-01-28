import Vue from "vue";
import store from "./store";
import qs from "querystringify";
import { mapMutations, mapState, mapActions } from "vuex";

const routes = {
  slideshow: "Slideshow",
  settings: "Settings"
};

const app = new Vue({
  el: "#app",
  store,
  computed: {
    ...mapState(["currentPhoto", "currentRoute"]),
    ViewComponent() {
      console.log(`route: ${routes[this.currentRoute]}`);
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
      route: routes[qsp.route] ? qsp.route : "slideshow",
      photo: qsp.photo || (this.currentPhoto && this.currentPhoto.path),
      replaceHistory: true
    });
  },
  render(h) {
    return h(this.ViewComponent);
  }
});

window.addEventListener("popstate", event => {
  const qsp = qs.parse(window.location.search);
  if (routes[qsp.route]) {
    console.debug(`popstate ${window.location.pathname}${window.location.search}`);
    app.navigate({
      route: qsp.route,
      photo: qsp.photo,
      addToHistory: false
    });
  }
});
