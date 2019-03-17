<template>
  <div>
    <span v-html="name"></span>
    <button class="right" v-show="isLoaded">
      <span v-html="taken"></span>
    </button>
    <transition name="fade">
      <video
        v-if="isVideo"
        v-bind:src="photoSrc"
        v-bind:key="photoSrc"
        v-on:load="isLoaded = true"
        v-bind:width="width"
        v-bind:height="height"
        controls
        autoplay
        loop
      ></video>
      <img
        v-else-if="photo"
        v-bind:src="photoSrc"
        v-bind:key="photoSrc"
        v-on:load="isLoaded = true"
      >
    </transition>
  </div>
</template>

<script>
import { isVideo } from "./utils";
import { mapMutations, mapState } from "vuex";
export default {
  props: ["photo"],
  data() {
    return {
      isLoaded: false,
      isVideo: false,
      photoSrc: null,
      newPhotoSrc: null,
      height: window.innerHeight,
      width: window.innerWidth
    };
  },
  computed: {
    ...mapState(["statusText"]),
    name() {
      if (this.statusText) {
        return this.statusText;
      }
      if (!this.isLoaded) {
        return "nahrávám...";
      }
      if (this.photo) {
        return `${this.photo.folder}<br>${this.photo.description}`;
      }
    },
    taken() {
      return this.photo && this.photo.taken.replace(/(.*) (\S+)/, "$1<br>$2");
    }
  },
  methods: {
    ...mapMutations(["setStatusText"])
  },
  watch: {
    isLoaded() {
      if (this.isLoaded) {
        this.setStatusText("");
      }
    },
    photo() {
      this.isLoaded = false;
      this.height = window.innerHeight;
      this.width = window.innerWidth;
      this.newPhotoSrc = new Image();

      if (isVideo(this.photo.name)) {
        // do not wait until video is fully loaded
        setTimeout(() => {
          this.photoSrc = this.photo.url;
          this.isVideo = true;
          this.isLoaded = true;
        }, 5000);
      } else {
        this.newPhotoSrc.onload = () => {
          this.photoSrc = this.photo.url;
          this.isVideo = isVideo(this.photo.name);
        };
      }

      this.newPhotoSrc.src = this.photo.url;
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
  text-align: left;
}
.right {
  right: 1%;
  position: fixed;
  text-align: right;
}
.fade-enter-active {
  transition: opacity 5s;
}
.fade-enter {
  opacity: 0;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 1s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>
