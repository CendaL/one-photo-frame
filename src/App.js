import "./array.find.polyfill";
import "promise-polyfill/src/polyfill";
import "whatwg-fetch";
import { log } from "./utils";
import { mapActions, mapGetters, mapMutations, mapState } from "vuex";
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
  computed: {
    ...mapGetters(["isSignedIn"]),
    ...mapState(["currentRoute", "nextPhotoId"])
  },
  methods: {
    ...mapActions(["showNextPhoto"]),
    ...mapMutations(["setNextPhotoId", "setRoute"])
  },
  created() {
    log(
      `created ${window.location.pathname} with hash: '${window.location.hash}' and search: '${
        window.location.search
      }'`
    );
    if (
      window.location.hash.indexOf("id_token=") >= 0 ||
      window.location.hash.indexOf("access_token=") >= 0
    ) {
      log("auth redirect detected");
      return;
    }
    const qsp = qs.parse(window.location.search);
    this.setNextPhotoId(qsp.photo);
    this.setRoute(qsp.route || "slideshow");
  },
  render(h) {
    return h(Shell);
  }
});

window.addEventListener("popstate", event => {
  if (!app.isSignedIn) {
    return;
  }
  const qsp = qs.parse(window.location.search);
  if (qsp.route) {
    log(`popstate ${window.location.pathname}${window.location.search}`);
    app.setNextPhotoId(qsp.photo);
    app.setRoute(qsp.route);
    if (app.currentRoute === "slideshow" && app.nextPhotoId) {
      app.showNextPhoto();
    }
  }
});
