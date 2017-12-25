<template>
  <div>
    <p>Slideshow {{photos}}</p>
    <button @click="addPhoto('21-call_hang_up.bmp')">add</button>
    <button @click="settings">settings</button>
  </div>
</template>

<script>
import { mapState, mapMutations } from "vuex";

export default {
  computed: {
    ...mapState(["photos"])
  },
  methods: {
    settings() {
      window.location = "/settings";
    },
    ...mapMutations(["addPhoto"])
  }
};
</script>

<style scoped>

</style>
