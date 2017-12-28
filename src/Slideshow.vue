<template>
  <div>
    <p>Slideshow {{photos}}</p>
    <p>current: {{currentPhoto}}</p>
    <button @click="nextPhoto()">next</button>
    <button @click="addPhoto('21-call_hang_up.bmp')">add</button>
    <button @click="settings">settings</button>
  </div>
</template>

<script>
import { mapActions, mapMutations, mapState } from "vuex";

export default {
  computed: {
    ...mapState(["currentPhoto", "photos"])
  },
  methods: {
    nextPhoto() {
      this.navigate({ route: "/slideshow", photo: "" });
    },
    settings() {
      this.navigate({ route: "/settings" });
    },
    ...mapActions(["navigate"]),
    ...mapMutations(["addPhoto"])
  }
};
</script>

<style scoped>

</style>
