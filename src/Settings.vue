<template>
  <div>
      <p class="container">Settings</p>
      <button @click="addPhoto('21-call_hang_up.bmp')">add</button>
      <button @click="startSlideshow">Slideshow</button>
  </div>
</template>

<script>
import { mapState, mapMutations } from "vuex";

export default {
  computed: {
    ...mapState(["photos"])
  },
  methods: {
    startSlideshow() {
      window.location = "/slideshow";
    },
    ...mapMutations(["addPhoto"])
  }
};
</script>

<style scoped>
.container {
  background-color: red;
}
</style>
