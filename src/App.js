import "./array.find.polyfill";
import "promise-polyfill/src/polyfill";
import "whatwg-fetch";
import { log } from "./utils";
import { mapActions } from "vuex";
import qs from "querystringify";
import Shell from "./Shell.vue";
import storeConfig from "./store-config";
import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

const store = new Vuex.Store(storeConfig);

const app = new Vue({
  el: "#app",
  store,
  methods: {
    ...mapActions(["navigate"])
  },
  created() {
    log(`created ${window.location.pathname}`);
    const qsp = qs.parse(window.location.hash);
    if (qsp.id_token || qsp.access_token) {
      log("auth redirect detected");
      return;
    }
    this.navigate({
      route: qsp.route || "settings",
      replaceHistory: true
    }).catch(e => log(`Shell created error: ${e}`));
  },
  render(h) {
    return h(Shell);
  }
});

window.addEventListener("popstate", event => {
  debugger;
  const qsp = qs.parse(window.location.search);
  if (qsp.route) {
    log(`popstate ${window.location.pathname}${window.location.search}`);
    // app.navigate({
    //   route: qsp.route,
    //   photo: qsp.photo,
    //   addToHistory: false
    // });
  }
});
