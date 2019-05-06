<template>
  <div>
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
    <span
      class="infotext"
      v-show="showDescriptions"
      v-bind:style="{ fontSize: fontSize }"
      v-html="name"
    ></span>
    <span
      class="right infotext"
      v-show="isLoaded && showDescriptions"
      v-bind:style="{ fontSize: fontSize }"
      v-html="taken"
    ></span>
  </div>
</template>

<script>
import { isVideo } from "./utils";
import { mapMutations, mapState } from "vuex";
export default {
  props: ["photo", "showDescriptions"],
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
    ...mapState(["fontSize"]),
    name() {
      if (!this.isLoaded) {
        return "";
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
      this.height = window.innerHeight;
      this.width = window.innerWidth;

      if (isVideo(this.photo.name)) {
        this.photoSrc = this.photo.url;
        this.isVideo = true;
        this.setStatusText("");
      } else {
        this.isLoaded = false;
        this.newPhotoSrc = new Image();
        this.newPhotoSrc.onload = () => {
          this.photoSrc = this.photo.url;
          this.isVideo = isVideo(this.photo.name);
        };
        this.newPhotoSrc.src = this.photo.url;
      }
    }
  }
};
</script>

<style scoped>
span {
  top: 0.5em;
  left: 0.5em;
  position: fixed;
}
img,
video {
  left: 50%;
  top: 50%;
  position: fixed;
  transform: translate(-50%, -50%);
}
.right {
  right: 0.5em;
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
