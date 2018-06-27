<template>
  <div>
    <log />
    <!-- <button @click="settings">settings</button> -->
    <photo v-bind:photo="currentPhoto"
      v-on:navigateToNextPhoto="slideshowNext"
      v-on:updateRemoteConfig="updateRemoteConfig"></photo>
    <login class="leftbottom"></login>
  </div>
</template>

<script>
import { mapActions, mapGetters, mapMutations, mapState } from "vuex";
import { log, logError } from "./utils";
import graphService from "./services/graph.service";
import Log from "./Log.vue";
import Login from "./Login.vue";
import Photo from "./Photo.vue";

export default {
  data() {
    return {
      refreshRemoteConfigTaskId: null,
      slideshowNextTaskId: null
    };
  },
  components: {
    log: Log,
    login: Login,
    photo: Photo
  },
  computed: {
    ...mapState([
      "currentPhoto",
      "currentRoute",
      "folders",
      "photos",
      "remoteRefreshDelay",
      "slideshowDelay"
    ]),
    ...mapGetters(["isSignedIn"])
  },
  created() {
    this.updateRemoteConfig(false);
    this.slideshowNext(false);
  },
  beforeDestroy() {
    clearTimeout(this.refreshRemoteConfigTaskId);
    clearTimeout(this.slideshowNextTaskId);
  },
  methods: {
    getPhotoList() {
      if (this.folders.length > 0) {
        let allPhotos = [];

        function getPhotosFromFolder(folders) {
          if (folders.length <= 0) {
            return Promise.resolve();
          }
          log(`get photos for ${folders[0]}`);
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
    navigateToNextPhoto(photo = "") {
      return this.navigate({ route: "slideshow", photo: photo });
    },
    updateRemoteConfig(doRefresh = true) {
      clearTimeout(this.refreshRemoteConfigTaskId);
      let next = Promise.resolve();
      if (doRefresh) {
        next = this.refreshRemoteConfig();
      }
      next
        .catch(e => {
          logError(`updateRemoteConfig error ${e}`);
        })
        .then(() => {
          if (this.isSignedIn) {
            log(`update remote config in ${this.remoteRefreshDelay}`);
            this.refreshRemoteConfigTaskId = setTimeout(
              this.updateRemoteConfig,
              this.remoteRefreshDelay * 1000
            );
          }
        });
    },
    settings() {
      this.navigate({ route: "settings" });
    },
    slideshowNext(doNext = true, photo = "") {
      clearTimeout(this.slideshowNextTaskId);
      let next = Promise.resolve();
      if (doNext) {
        next = this.navigateToNextPhoto(photo);
      }
      next
        .then(() => {
          if (this.isSignedIn) {
            const delay =
              this.currentPhoto.duration + 10 > this.slideshowDelay
                ? this.currentPhoto.duration + 10
                : this.slideshowDelay;
            log(`next photo in ${delay}`);
            this.slideshowNextTaskId = setTimeout(this.slideshowNext, delay * 1000);
          }
        })
        .catch(e => {
          logError(`navigateToNextPhoto error ${e}`);
        });
    },
    ...mapActions(["navigate", "refreshRemoteConfig", "updatePhotos"]),
    ...mapMutations(["setFolders", "setRemoteRefreshDelay", "setSlideshowDelay", "toggleSlideshow"])
  },
  watch: {
    folders() {
      log("Folders refreshed -> refresh photos");
      this.getPhotoList();
    },
    photos() {
      log(`Photos refreshed: ${this.photos.length}`);
      this.slideshowNext(true, this.currentPhoto ? this.currentPhoto.id : "");
    }
  }
};
</script>

<style scoped>
.leftbottom {
  bottom: 0%;
  position: fixed;
}
</style>
