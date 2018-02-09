<template>
  <div>
    <button @click="navigateToNextPhoto">{{name}}</button>
    <button class="right" v-show="isLoaded" @click="refreshRemoteConfig"><span v-html="taken"></span></button>
    <video v-if="isVideo" v-bind:src="photo.url" v-on:load="isLoaded = true" controls autoplay loop></video>
    <img v-else-if="photo" v-bind:src="photo.url" v-on:load="isLoaded = true"/>
  </div>
</template>

<script>
import { isVideo } from "./utils";
import { mapActions, mapMutations, mapState } from "vuex";
export default {
  props: ["photo"],
  data() {
    return {
      isLoaded: false
    };
  },
  computed: {
    isVideo() {
      return this.photo && isVideo(this.photo.name);
    },
    name() {
      if (!this.isLoaded) {
        return "nahrávám...";
      }
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
  },
  watch: {
    photo() {
      this.isLoaded = false;
    }
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
