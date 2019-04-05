<template>
  <div>
    <photo v-bind:photo="currentPhoto"></photo>
    <button class="previous" @click="slideshowPrevious"></button>
    <button class="next" @click="slideshowNext"></button>
  </div>
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
    slideshowPrevious() {
      window.history.go(-1);
    },
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
button.next {
  height: 80%;
  left: 30%;
  top: 10%;
  width: 70%;
  position: fixed;
  z-index: 1;
  background-color: transparent;
  border-color: transparent;
  outline: 0;
}
button.previous {
  height: 80%;
  left: 0;
  top: 10%;
  width: 30%;
  position: fixed;
  z-index: 1;
  background-color: transparent;
  border-color: transparent;
  outline: 0;
}
</style>
