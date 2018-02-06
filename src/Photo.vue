<template>
  <div>
    <button @click="navigateToNextPhoto">{{name}}</button>
    <button class="right" @click="refreshRemoteConfig"><span v-html="taken"></span></button>
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
    isVideo() {
      return this.photo && isVideo(this.photo.name);
    },
    name() {
      return this.photo && this.photo.name.substring(0, this.photo.name.lastIndexOf("."));
    },
    taken() {
      return this.photo && this.photo.taken.replace(/(.*) (\S+)/, "$1<br>$2");
    }
  },
  methods: {
    navigateToNextPhoto() {
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
button {
  font-family: sans-serif;
  color: gray;
  background-color: transparent;
  border-width: 0px;
}
.right {
  right: 1%;
  position: fixed;
  text-align: right;
}
</style>
