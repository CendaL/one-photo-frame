<template>
  <div>
    <p class="container">Settings</p>
    <button @click="addPhoto('21-call_hang_up.bmp')">add</button>
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
      this.navigate({ route: "/slideshow", photo: this.currentPhoto });
    },
    ...mapActions(["navigate"]),
    ...mapMutations(["addPhoto"])
  }
};
</script>

<style scoped>
.container {
  background-color: red;
}
</style>
