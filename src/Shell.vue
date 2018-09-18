<template>
  <div>
    <span>Shell</span>
    <log />
    <login class="leftbottom"></login>
    <button class="rightbottom" @click="settings">⚙</button>
    <!-- <component v-bind:is="cr"></component> -->
  </div>
</template>

<script>
import { mapActions, mapGetters, mapMutations, mapState } from "vuex";
import { log, logError } from "./utils";
import Log from "./Log.vue";
import Login from "./Login.vue";

export default {
  data() {
    return {
      refreshRemoteConfigTaskId: null
    };
  },
  components: {
    log: Log,
    login: Login
  },
  computed: {
    ...mapState(["remoteRefreshDelay"]),
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
    getPhotoList() {
      const that = this;
      const foldersCount = this.folders.length;

      if (this.folders.length > 0) {
        let allPhotos = [];

        function getPhotosFromFolder(folders) {
          if (folders.length <= 0) {
            return Promise.resolve();
          }
          log(`get photos for ${folders[0]}`);
          that.setStatusText(`nahrávám ${folders[0]} (${foldersCount - folders.length + 1}/${foldersCount})`);
          return graphService.getPhotoList(folders[0]).then(photos => {
            allPhotos.push(...photos);
            return getPhotosFromFolder(folders.slice(1));
          });
        }

        getPhotosFromFolder(this.folders).then(_ => {
          this.updatePhotos(allPhotos);
        });
      } else {
        logError("No folders");
      }
    },
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
    ...mapActions(["navigate", "refreshRemoteConfig", "updatePhotos"])
  },
  watch: {
    isSignedIn(val) {
      log(`shell watch isSignedIn: ${val}`);
      if (this.isSignedIn) {
        // this.refreshRemoteConfig().catch(e => {
        //   logError(`refreshRemoteConfig error: ${e}`);
        // });
      }
    },
    folders() {
      log("Folders refreshed -> refresh photos");
      this.getPhotoList();
    }
  }
};
</script>

<style scoped>
.leftbottom {
  bottom: 0;
  position: fixed;
}
button.rightbottom {
  bottom: 0;
  right: 1em;
  position: fixed;
  font-family: sans-serif;
  color: gray;
  background-color: transparent;
  border-width: 0px;
}
span {
  color: white;
}
</style>
