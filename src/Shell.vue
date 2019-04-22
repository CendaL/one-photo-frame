<template>
  <div>
    <p class="center infotext" v-bind:style="{ fontSize: fontSize }">{{statusText}}</p>
    <log/>
    <component v-bind:is="currentRoute"></component>
    <login class="leftbottom"></login>
    <button
      v-show="showDescriptions && isSignedIn && currentRoute !== 'settings'"
      class="rightbottom infotext"
      v-bind:style="{ fontSize: fontSize }"
      @click="settings"
    >⚙</button>
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
      "statusText",
      "showDescriptions"
    ]),
    ...mapGetters(["isSignedIn"])
  },
  mounted() {
    log(`mounted Shell: isSignedIn = ${this.isSignedIn}`);
    const localManualFolders = JSON.parse(
      localStorage.getItem("manualFolders")
    );
    if (localManualFolders && localManualFolders.length > 0) {
      this.setManualFoldersAndTimestamp({
        manualFolders: localManualFolders,
        manualTimestamp: localStorage.getItem("manualTimestamp")
      });
    }
    const fontSize = localStorage.getItem("fontSize");
    if (fontSize) {
      this.setFontSize(fontSize);
    }
    this.updateRemoteConfig(false);
  },
  beforeDestroy() {
    clearTimeout(this.refreshRemoteConfigTaskId);
  },
  methods: {
    ...mapActions(["refreshRemoteConfig"]),
    ...mapMutations([
      "logError",
      "setRoute",
      "setManualFoldersAndTimestamp",
      "setFontSize"
    ]),
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
  font-weight: bold;
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
  bottom: 0.3em;
  left: 0.3em;
  position: fixed;
}
button.rightbottom {
  bottom: 0.3em;
  right: 0.3em;
  position: fixed;
  border-width: 0px;
  padding: 2em 0 0 2em;
}
p.infotext {
  top: 0.5em;
  margin: 0;
  position: fixed;
  width: 100%;
}
</style>
