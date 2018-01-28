<template>
  <div>
    <p @click="nextPhoto">{{name}}</p>
    <p class="right" @click="refreshRemoteConfig">{{taken}}</p>
    <video v-if="isVideo" v-bind:src="photo.url" controls autoplay loop></video>
    <img v-else-if="photo" v-bind:src="photo.url"/>
  </div>
</template>

<script>
import { isVideo } from "./utils";
import { mapActions, mapMutations, mapState } from "vuex";
export default {
  props: ["photo"],
  computed: {
    isVideo: function() {
      return this.photo && isVideo(this.photo.name);
    },
    name: function() {
      return this.photo && this.photo.name;
    },
    taken: function() {
      return this.photo && this.photo.taken;
    }
  },
  methods: {
    nextPhoto() {
      this.navigate({ route: "slideshow", photo: "" });
    },
    ...mapActions(["navigate", "refreshRemoteConfig"])
  }
};
</script>

<style scoped>
img,
video {
  left: 50%;
  top: 50%;
  position: fixed;
  z-index: -1;
  transform: translate(-50%, -50%);
}
p {
  font-family: sans-serif;
  color: gray;
}
.right {
  top: 0%;
  right: 1%;
  position: fixed;
}
</style>
