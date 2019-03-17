<template>
  <photo v-bind:photo="currentPhoto"></photo>
</template>

<script>
import { mapActions, mapGetters, mapState } from "vuex";
import { log, logError } from "./utils";
import graphService from "./services/graph.service";
import Photo from "./Photo.vue";

export default {
  data() {
    return {
      slideshowNextTaskId: null
    };
  },
  components: {
    photo: Photo
  },
  computed: {
    ...mapState(["currentPhoto", "photos", "slideshowDelay"]),
    ...mapGetters(["isSignedIn"])
  },
  created() {
    this.slideshowNext(false);
  },
  beforeDestroy() {
    clearTimeout(this.slideshowNextTaskId);
  },
  methods: {
    navigateToNextPhoto(photo = "") {
      return this.navigate({ route: "slideshow", photo: photo });
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
              this.currentPhoto.duration &&
              this.currentPhoto.duration * 2.5 > this.slideshowDelay
                ? this.currentPhoto.duration * 2.5
                : this.slideshowDelay;
            log(`next photo in ${delay}`);
            this.slideshowNextTaskId = setTimeout(
              this.slideshowNext,
              delay * 1000
            );
          }
        })
        .catch(e => {
          logError(`navigateToNextPhoto error ${e}`);
        });
    },
    ...mapActions(["navigate"])
  },
  watch: {
    photos() {
      log(`Photos refreshed: ${this.photos.length}`);
      this.slideshowNext(true, this.currentPhoto ? this.currentPhoto.id : "");
    }
  }
};
</script>

<style scoped>
</style>
