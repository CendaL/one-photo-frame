<template>
  <div>
    <p>photo {{p}}</p>
    <video v-if="isVideo" v-bind:src="photo.url" controls autoplay loop></video>
    <img v-else v-bind:src="photo.url"/>
  </div>
</template>

<script>
import { isVideo } from "./utils";
export default {
  props: ["photo"],
  computed: {
    isVideo: function() {
      return isVideo(this.photo.name);
    },
    p: function() {
      return JSON.stringify(this.photo);
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

