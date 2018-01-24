<template>
  <div>
    <p>Slideshow {{photos}}</p>
    <button @click="nextPhoto()">next</button>
    <button @click="toggleSlideshow()">toggle slideshow</button>
    <button @click="settings">settings</button>
    <button @click="getPhotoList">get photo list</button>
    <button @click="refreshRemoteConfig">refresh remote config</button>
    <login></login>
    <photo v-bind:photo="currentPhoto"></photo>
  </div>
</template>

<script>
import { mapActions, mapMutations, mapState } from "vuex";
import graphService from "./services/graph.service";
import Login from "./Login.vue";
import Photo from "./Photo.vue";

export default {
  data() {
    return {
      canRefreshRemoteConfig: true,
      canSlideshowNext: true
    };
  },
  components: {
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
    this.refreshRemoteConfig(false);
    this.slideshowNext(false);
  },
  beforeDestroy() {
    this.canRefreshRemoteConfig = false;
    this.canSlideshowNext = false;
  },
  methods: {
    getPhotoList() {
      if (this.folders.length > 0) {
        graphService.getPhotoList(this.folders[0]).then(photos => {
          console.log(JSON.stringify(photos));
          this.setPhotos(photos);
        });
      } else {
        console.warn("No folders");
      }
    },
    nextPhoto() {
      this.navigate({ route: "/slideshow", photo: "" });
    },
    refreshRemoteConfig(doRefresh = true) {
      if (this.canRefreshRemoteConfig && this.currentRoute === "/slideshow") {
        if (doRefresh) {
          graphService.getRemoteConfig().then(config => {
            this.setFolders(config.folders);
            this.setRemoteRefreshDelay(config.remoteRefreshDelay);
            this.setSlideshowDelay(config.slideshowDelay);
          });
        }
        // schedule task only once nextPhoto finishes
        // setTimeout(this.refreshRemoteConfig, this.remoteRefreshDelay * 1000);
      }
    },
    settings() {
      this.navigate({ route: "/settings" });
    },
    slideshowNext(doNext = true) {
      if (this.canSlideshowNext && this.isSlideshowRunning && this.currentRoute === "/slideshow") {
        if (doNext) {
          this.nextPhoto();
        }
        // schedule task only once nextPhoto finishes
        setTimeout(this.slideshowNext, this.slideshowDelay * 1000);
      }
    },
    ...mapActions(["navigate"]),
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
      console.log("Folders refreshed -> refresh photos");
      this.getPhotoList();
    },
    isSlideshowRunning: function() {
      this.slideshowNext(false);
    },
    photos: function() {
      console.log("Photos refreshed -> load next photo");
      // this.nextPhoto();
    }
  }
};
</script>

<style scoped>

</style>
