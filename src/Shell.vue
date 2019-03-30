<template>
  <div>
    <p class="center infotext" v-bind:style="{ fontSize: fontSize }">{{statusText}}</p>
    <log/>
    <login class="leftbottom"></login>
    <button class="rightbottom infotext" v-bind:style="{ fontSize: fontSize }" @click="settings">⚙</button>
    <component v-bind:is="currentRoute"></component>
  </div>
</template>

<script>
import { mapActions, mapGetters, mapMutations, mapState } from "vuex";
import { log, logError } from "./utils";
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
    this.updateRemoteConfig(false);
  },
  beforeDestroy() {
    clearTimeout(this.refreshRemoteConfigTaskId);
  },
  methods: {
    updateRemoteConfig(doRefresh = true) {
      clearTimeout(this.refreshRemoteConfigTaskId);
      (doRefresh ? this.refreshRemoteConfig() : Promise.resolve())
        .catch(e => {
          logError(`updateRemoteConfig error ${e}`);
        })
        .then(() => {
          log(`update remote config in ${this.remoteRefreshDelay}`);
          this.refreshRemoteConfigTaskId = setTimeout(
            this.updateRemoteConfig,
            this.remoteRefreshDelay * 1000
          );
        });
    },
    settings() {
      this.navigate({ route: "settings" });
    },
    ...mapActions(["navigate", "refreshRemoteConfig"])
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
  color: gray;
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
}
p.infotext {
  margin: 0;
}
</style>
