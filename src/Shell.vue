<template>
  <div>
    <p class="center infotext" v-bind:style="{ fontSize: fontSize }">{{statusText}}</p>
    <log/>
    <login class="leftbottom"></login>
    <button
      class="rightbottom infotext z5"
      v-bind:style="{ fontSize: fontSize }"
      @click="settings"
    >⚙</button>
    <component v-bind:is="currentRoute"></component>
  </div>
</template>

<script>
import { mapActions, mapGetters, mapMutations, mapState } from "vuex";
import { log } from "./utils";
import Log from "./Log.vue";
import Login from "./Login.vue";
import Settings from "./Settings.vue";
import Slideshow from "./Slideshow.vue";

export default {
  data() {
    return {
      refreshRemoteConfigTaskId: null
    };
  },
  components: {
    log: Log,
    login: Login,
    settings: Settings,
    slideshow: Slideshow
  },
  computed: {
    ...mapState([
      "currentRoute",
      "fontSize",
      "remoteRefreshDelay",
      "statusText"
    ]),
    ...mapGetters(["isSignedIn"])
  },
  mounted() {
    log(`mounted Shell: isSignedIn = ${this.isSignedIn}`);
    const localManualFolders = localStorage.getItem("manualFolders");
    if (localManualFolders) {
      this.setManualFoldersAndTimestamp({
        manualFolders: localManualFolders,
        manualTimestamp: localStorage.getItem("manualTimestamp")
      });
    }
    this.updateRemoteConfig(false);
  },
  beforeDestroy() {
    clearTimeout(this.refreshRemoteConfigTaskId);
  },
  methods: {
    ...mapActions(["refreshRemoteConfig"]),
    ...mapMutations(["logError", "setRoute", "setManualFoldersAndTimestamp"]),
    updateRemoteConfig(doRefresh = true) {
      (doRefresh ? this.refreshRemoteConfig() : Promise.resolve())
        .catch(e => {
          this.logError(`updateRemoteConfig error ${e}`);
        })
        .then(() => {
          log(`update remote config again in ${this.remoteRefreshDelay}s`);
          clearTimeout(this.refreshRemoteConfigTaskId);
          this.refreshRemoteConfigTaskId = setTimeout(
            this.updateRemoteConfig,
            this.remoteRefreshDelay * 1000
          );
        });
    },
    settings() {
      this.setRoute("settings");
    }
  },
  watch: {
    isSignedIn(val) {
      log(`shell watch isSignedIn: ${val}`);
      this.updateRemoteConfig();
    }
  }
};
</script>

<style>
.infotext {
  font-family: sans-serif;
  color: #dddddd;
  text-shadow: 2px 2px 3px rgba(0, 0, 0, 1);
  background-color: transparent;
}
.center {
  text-align: center;
}
</style>

<style scoped>
.leftbottom {
  bottom: 0;
  position: fixed;
}
button.rightbottom {
  bottom: 0;
  right: 0;
  position: fixed;
  border-width: 0px;
  padding: 1em 0 0 1em;
}
p.infotext {
  margin: 0;
  position: fixed;
  width: 100%;
}
.z5 {
  z-index: 5;
}
</style>
