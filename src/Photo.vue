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
  max-width: 300px;
  max-height: 200px;
}
</style>
