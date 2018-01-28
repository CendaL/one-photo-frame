<template>
  <div>
    <p class="container">Settings</p>
    <button @click="startSlideshow">Slideshow</button>
  </div>
</template>

<script>
import { mapActions, mapMutations, mapState } from "vuex";

export default {
  computed: {
    ...mapState(["currentPhoto", "photos"])
  },
  methods: {
    startSlideshow() {
      this.navigate({ route: "slideshow", photo: this.currentPhoto && this.currentPhoto.path });
    },
    ...mapActions(["navigate"])
  }
};
</script>

<style scoped>
.container {
  background-color: red;
}
</style>
