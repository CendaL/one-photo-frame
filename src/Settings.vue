<template>
  <div>
    <button @click="startSlideshow" class="ok-button">OK</button>
    <div class="photo-folders">
      <h2>Přidat fotky:</h2>
      <ul>
        <li v-for="item in onedriveFolders" :key="item.id">
          <button @click="addManualFolder(item)">+</button>
          <button @click="load(item)">{{ item.name }}</button>
        </li>
      </ul>
    </div>
    <div class="selected-photos">
      <h2>Vybrané fotky:</h2>
      <ul>
        <li v-for="item in manualFolders" :key="item.id">
          <button @click="removeManualFolder(item)">{{ item.name }}</button>
        </li>
      </ul>
    </div>
  </div>
  </div>
</template>

<script>
import { mapActions, mapMutations, mapState } from "vuex";
import { log, logError } from "./utils";
import graphService from "./services/graph.service";

export default {
  data() {
    return {
      onedriveFolders: [{ name: "nahrávám..." }]
    };
  },
  computed: {
    ...mapState(["currentPhoto", "manualFolders"])
  },
  created() {
    this.load();
  },
  methods: {
    ...mapActions(["navigate"]),
    ...mapMutations(["addManualFolder", "removeManualFolder", "setFolders"]),
    load(baseFolder) {
      graphService.listPhotoFolders(baseFolder).then(data => {
        this.onedriveFolders = data;
      });
    },
    startSlideshow() {
      this.navigate({ route: "slideshow", photo: this.currentPhoto && this.currentPhoto.path });
    }
  }
};
</script>

<style scoped>
div.selected-photos,
div.photo-folders {
  position: fixed;
  width: 50%;
  top: 0;
  bottom: 0;
  overflow-y: auto;
  overflow-x: hidden;
}
div.selected-photos {
  right: 0;
}
ul {
  -webkit-padding-start: 0.5em;
}
li {
  list-style-type: none;
}
h2 {
  color: gray;
  font-family: sans-serif;
  padding-left: 0.4em;
}
button {
  font-family: sans-serif;
  color: gray;
  background-color: transparent;
  border-width: 1px;
  border-color: gray;
  border-style: groove;
  padding: 0.3em 0.5em;
  margin-bottom: 5px;
  text-align: left;
  font-size: larger;
}
button.ok-button {
  position: fixed;
  right: 0.5em;
  top: 0.5em;
}
</style>
