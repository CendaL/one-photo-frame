<template>
  <div>
    <photo v-bind:photo="currentPhoto" v-bind:showDescriptions="showDescriptions"></photo>
    <button class="previous" @click="slideshowPrevious"></button>
    <button class="center" @click="toggleDescriptionsLocal"></button>
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
    ...mapState(["currentPhoto", "slideshowDelay", "showDescriptions"]),
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
    ...mapMutations(["logError", "toggleDescriptions"]),
    slideshowPrevious(event) {
      event.target.blur();
      window.history.go(-1);
    },
    toggleDescriptionsLocal(event) {
      event.target.blur();
      this.toggleDescriptions();
    },
    slideshowNext(event) {
      if (event) {
        event.target.blur();
      }
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
button.center {
  height: 70%;
  left: 33%;
  top: 15%;
  width: 33%;
  position: fixed;
  background-color: transparent;
  border-color: transparent;
  outline: 0;
}
button.next {
  height: 70%;
  left: 66%;
  top: 15%;
  width: 34%;
  position: fixed;
  background-color: transparent;
  border-color: transparent;
  outline: 0;
}
button.previous {
  height: 70%;
  left: 0;
  top: 15%;
  width: 33%;
  position: fixed;
  background-color: transparent;
  border-color: transparent;
  outline: 0;
}
</style>
