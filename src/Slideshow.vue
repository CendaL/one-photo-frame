<template>
  <photo v-bind:photo="currentPhoto"></photo>
</template>

<script>
import { mapActions, mapGetters, mapMutations, mapState } from "vuex";
import { log } from "./utils";
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
    ...mapState(["currentPhoto", "slideshowDelay"]),
    ...mapGetters(["isSignedIn"])
  },
  mounted() {
    log("Slideshow: mounted");
    this.slideshowNext();
  },
  beforeDestroy() {
    log("Slideshow: beforeDestroy");
    clearTimeout(this.slideshowNextTaskId);
  },
  methods: {
    ...mapActions(["showNextPhoto"]),
    ...mapMutations(["logError"]),
    slideshowNext() {
      clearTimeout(this.slideshowNextTaskId);
      this.showNextPhoto()
        .then(() => {
          if (this.isSignedIn) {
            const delay =
              this.currentPhoto &&
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
          this.logError(`navigateToNextPhoto error ${e}`);
        });
    }
  }
};
</script>

<style scoped>
</style>
