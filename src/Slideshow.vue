<template>
  <div>
    <p>Slideshow {{photos}}</p>
    <p>current: {{currentPhoto}}</p>
    <p>isSlideshowRunning: {{isSlideshowRunning}}</p>
    <button @click="nextPhoto()">next</button>
    <button @click="toggleSlideshow()">toggle slideshow</button>
    <button @click="settings">settings</button>
  </div>
</template>

<script>
import { mapActions, mapMutations, mapState } from "vuex";

export default {
  computed: {
    ...mapState([
      "currentPhoto",
      "currentRoute",
      "isSlideshowRunning",
      "photos",
      "slideshowDelay"
    ])
  },
  created: function() {
    this.slideshowNext(false);
  },
  methods: {
    nextPhoto() {
      this.navigate({ route: "/slideshow", photo: "" });
    },
    settings() {
      this.navigate({ route: "/settings" });
    },
    slideshowNext(doNext = true) {
      if (this.isSlideshowRunning && this.currentRoute === "/slideshow") {
        if (doNext) {
          this.nextPhoto();
        }
        setTimeout(this.slideshowNext, this.slideshowDelay * 1000);
      }
    },
    ...mapActions(["navigate"]),
    ...mapMutations(["toggleSlideshow"])
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
