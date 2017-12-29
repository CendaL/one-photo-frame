<template>
  <div>
    <p>photo {{photo}}</p>
    <video v-if="isVideo" v-bind:src="photoUrl" controls autoplay loop></video>
    <img v-else v-bind:src="photoUrl"/>
  </div>
</template>

<script>
export default {
  props: ["photo"],
  computed: {
    isVideo: function() {
      return this.photo.toLowerCase().search(".mp4$") !== -1;
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

