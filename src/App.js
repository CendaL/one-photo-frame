import "./array.find.polyfill";
import "promise-polyfill/src/polyfill";
import "whatwg-fetch";
import { log } from "./utils";
import { mapMutations } from "vuex";
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
    ...mapMutations(["setNextPhotoId", "setRoute"])
  },
  created() {
    log(`created ${window.location.pathname}`);
    const qsp = qs.parse(window.location.hash);
    if (qsp.id_token || qsp.access_token) {
      log("auth redirect detected");
      return;
    }
    this.setRoute(qsp.route || "slideshow");
  },
  render(h) {
    return h(Shell);
  }
});

window.addEventListener("popstate", event => {
  const qsp = qs.parse(window.location.search);
  if (qsp.route) {
    log(`popstate ${window.location.pathname}${window.location.search}`);
    app.setNextPhotoId(qsp.photo);
    app.setRoute(qsp.route);
  }
});
