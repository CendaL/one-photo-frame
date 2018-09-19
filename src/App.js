import "./array.find.polyfill";
import "promise-polyfill/src/polyfill";
import "whatwg-fetch";
import { log } from "./utils";
import { mapState, mapActions, mapGetters } from "vuex";
import qs from "querystringify";
import Shell from "./Shell.vue";
import storeConfig from "./store-config";
import createPersistedStore from "vuex-persistedstate";
import Vue from "vue";

Vue.use(Vuex);

const store = new Vuex.Store(storeConfig);
store.plugins = [
  createPersistedStore({
    paths: ["currentPhoto", "currentRoute", "folders", "manualFolders", "manualTimestamp"]
  })
];

const routes = {
  slideshow: "Slideshow",
  settings: "Settings"
};

// refactor - rename Shell.js to App.js, create Shell.ve component which will
// be the shell for the app:
// - maintain app state - login status, remote config refresh
// - contain Login componend, display Slideshow or Settings component
const app = new Vue({
  el: "#app",
  store,
  computed: {
    ...mapState(["currentRoute"]),
    ...mapGetters(["isSignedIn"])
  },
  methods: {
    ...mapActions(["navigate"])
  },
  created() {
    log(`created ${window.location.pathname}`);
    const qsp = qs.parse(window.location.hash);
    if (qsp.id_token || qsp.access_token) {
      log("auth detected");
      return;
    }
    // this.navigate({
    //   route: routes[qsp.route] ? qsp.route : "settings",
    //   photo: qsp.photo || (this.currentPhoto && this.currentPhoto.path),
    //   replaceHistory: true
    // }).catch(e => log(`Shell created error: ${e}`));
  },
  render(h) {
    return h(Shell);
  }
});

window.addEventListener("popstate", event => {
  debugger;
  const qsp = qs.parse(window.location.search);
  if (routes[qsp.route]) {
    log(`popstate ${window.location.pathname}${window.location.search}`);
    // app.navigate({
    //   route: qsp.route,
    //   photo: qsp.photo,
    //   addToHistory: false
    // });
  }
});
