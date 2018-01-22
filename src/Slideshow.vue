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
import { folders } from "./photos.json";

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
    ...mapState(["currentPhoto", "currentRoute", "isSlideshowRunning", "photos", "slideshowDelay"])
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
      graphService.getPhotoList(folders[0]).then(photos => {
        console.log(JSON.stringify(photos));
        this.setPhotos(photos);
      });
    },
    nextPhoto() {
      this.navigate({ route: "/slideshow", photo: "" });
    },
    refreshPhotoFolders(doRefresh = true) {
      if (doRefresh) {
        graphService.getPhotoFolders().then(folders => {
          console.log(JSON.stringify(folders));
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
    ...mapMutations(["setPhotos", "toggleSlideshow"])
  },
  watch: {
    isSlideshowRunning: function() {
      this.slideshowNext(false);
    }
  }
};
</script>

<style scoped>

</style>
