<template>
  <div>
    <!-- <log /> -->
    <!-- <button @click="toggleSlideshow()">toggle slideshow</button> -->
    <!-- <button @click="settings">settings</button> -->
    <!-- <button @click="getPhotoList">get photo list</button> -->
    <photo v-bind:photo="currentPhoto"></photo>
    <!-- <button @click="updateRemoteConfig">refresh remote config</button> -->
    <!-- <button @click="nextPhoto()">next</button> -->
    <login class="leftbottom"></login>
  </div>
</template>

<script>
import { mapActions, mapMutations, mapState } from "vuex";
import { log } from "./utils";
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
      "isSlideshowRunning",
      "photos",
      "remoteRefreshDelay",
      "slideshowDelay"
    ])
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
        graphService.getPhotoList(this.folders[0]).then(photos => {
          this.setPhotos(photos);
        });
      } else {
        log("No folders");
      }
    },
    nextPhoto() {
      this.navigate({ route: "slideshow", photo: "" });
    },
    updateRemoteConfig(doRefresh = true) {
      if (doRefresh) {
        this.refreshRemoteConfig();
      }
      clearTimeout(this.refreshRemoteConfigTaskId);
      this.refreshRemoteConfigTaskId = setTimeout(this.updateRemoteConfig, this.remoteRefreshDelay * 1000);
    },
    settings() {
      this.navigate({ route: "settings" });
    },
    slideshowNext(doNext = true) {
      if (doNext) {
        this.nextPhoto();
      }
      clearTimeout(this.slideshowNextTaskId);
      this.slideshowNextTaskId = setTimeout(this.slideshowNext, this.slideshowDelay * 1000);
    },
    ...mapActions(["navigate", "refreshRemoteConfig"]),
    ...mapMutations([
      "setFolders",
      "setPhotos",
      "setRemoteRefreshDelay",
      "setSlideshowDelay",
      "toggleSlideshow"
    ])
  },
  watch: {
    folders: function() {
      log("Folders refreshed -> refresh photos");
      this.getPhotoList();
    },
    isSlideshowRunning: function() {
      this.slideshowNext(false);
    },
    photos: function() {
      log("Photos refreshed");
      if (!this.currentPhoto) {
        this.nextPhoto();
      }
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
