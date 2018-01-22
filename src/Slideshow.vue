<template>
  <div>
    <p>Slideshow {{photos}}</p>
    <button @click="nextPhoto()">next</button>
    <button @click="toggleSlideshow()">toggle slideshow</button>
    <button @click="settings">settings</button>
    <button @click="getPhotoList">get photo list</button>
    <button @click="refreshPhotoFolders">refresh photo folders</button>
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
      canRefreshPhotoList: true,
      canSlideshowNext: true
    };
  },
  components: {
    login: Login,
    photo: Photo
  },
  computed: {
    ...mapState(["currentPhoto", "currentRoute", "folders", "isSlideshowRunning", "photos", "slideshowDelay"])
  },
  created() {
    this.refreshPhotoFolders(false);
    this.slideshowNext(false);
  },
  beforeDestroy() {
    this.canRefreshPhotoList = false;
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
    refreshPhotoFolders(doRefresh = true) {
      if (doRefresh) {
        graphService.getPhotoFolders().then(folders => {
          console.log(JSON.stringify(folders));
          this.setFolders(folders);
        });
      }
      // setTimeout(this.refreshPhotoList, this.slideshowDelay * 1000);
    },
    settings() {
      this.navigate({ route: "/settings" });
    },
    slideshowNext(doNext = true) {
      if (this.canSlideshowNext && this.isSlideshowRunning && this.currentRoute === "/slideshow") {
        if (doNext) {
          this.nextPhoto();
        }
        setTimeout(this.slideshowNext, this.slideshowDelay * 1000);
      }
    },
    ...mapActions(["navigate"]),
    ...mapMutations(["setFolders", "setPhotos", "toggleSlideshow"])
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
      this.nextPhoto();
    }
  }
};
</script>

<style scoped>

</style>
