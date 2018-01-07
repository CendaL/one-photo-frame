<template>
  <div>
    <p>photo {{photo}}</p>
    <video v-if="isVideo" v-bind:src="photoUrl" controls autoplay loop></video>
    <img v-else v-bind:src="photoUrl"/>
  </div>
</template>

<script>
import { isVideo } from "./utils";
export default {
  props: ["photo"],
  computed: {
    isVideo: function() {
      return isVideo(this.photo);
    },
    photoUrl: function() {
      return "src/assets/" + this.photo;
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

