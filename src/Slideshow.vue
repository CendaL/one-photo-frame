<template>
  <div>
    <!-- <log /> -->
    <!-- <button @click="settings">settings</button> -->
    <photo v-bind:photo="currentPhoto"
      v-on:navigateToNextPhoto="slideshowNext"
      v-on:updateRemoteConfig="updateRemoteConfig"></photo>
    <label><input type="checkbox" v-model="sequential"/><span></span></label>
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
      sequential: true,
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
    navigateToNextPhoto() {
      return this.navigate({ route: "slideshow", photo: "", sequential: this.sequential });
    },
    updateRemoteConfig(doRefresh = true) {
      clearTimeout(this.refreshRemoteConfigTaskId);
      let next = Promise.resolve();
      if (doRefresh) {
        next = this.refreshRemoteConfig();
      }
      next
        .then(() => {
          this.refreshRemoteConfigTaskId = setTimeout(
            this.updateRemoteConfig,
            this.remoteRefreshDelay * 1000
          );
        })
        .catch(e => {
          log(`clearing refreshRemoteConfigTaskId because of error ${e}`);
        });
    },
    settings() {
      this.navigate({ route: "settings" });
    },
    slideshowNext(doNext = true) {
      clearTimeout(this.slideshowNextTaskId);
      let next = Promise.resolve();
      if (doNext) {
        next = this.navigateToNextPhoto();
      }
      next
        .then(() => {
          this.slideshowNextTaskId = setTimeout(this.slideshowNext, this.slideshowDelay * 1000);
        })
        .catch(e => {
          log(`clearing slideshowNextTaskId because of error ${e}`);
        });
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
        this.navigateToNextPhoto();
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
label input {
  display: none; /* <-- hide the default checkbox */
}
label span {
  /* <-- style the artificial checkbox */
  height: 10px;
  width: 10px;
  border: 1px solid dimgrey;
  background-color: gray;
  display: inline-block;
  position: fixed;
  bottom: 5px;
  right: 5px;
}
[type="checkbox"]:checked + span:before {
  /* <-- style its checked state..with a ticked icon */
  content: "\2714";
  font-size: 60%;
  position: absolute;
  top: -2px;
  left: 2px;
}
</style>
