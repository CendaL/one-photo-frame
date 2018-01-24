<template>
  <div>
    <p>{{name}}</p>
    <video v-if="isVideo" v-bind:src="photo.url" controls autoplay loop></video>
    <img v-else-if="photo" v-bind:src="photo.url"/>
  </div>
</template>

<script>
import { isVideo } from "./utils";
export default {
  props: ["photo"],
  computed: {
    isVideo: function() {
      return this.photo && isVideo(this.photo.name);
    },
    name: function() {
      return this.photo && this.photo.name;
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
p {
  color: gray;
}
</style>
