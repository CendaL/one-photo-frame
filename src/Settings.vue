<template>
  <div>
    <div class="infotext rightbottom">v{{version}}</div>
    <div class="photo-folders">
      <h2 class="infotext">{{title}}</h2>
      <ul>
        <li v-for="item in onedriveFolders" :key="item.id">
          <button v-if="!item.title" class="infotext" @click="addManualFolder(item)">+</button>
          <button class="infotext" @click="load(item)">{{ item.title || item.name }}</button>
        </li>
      </ul>
    </div>
    <div class="selected-photos">
      <h2 class="infotext" v-bind:style="{ fontSize: fontSize }">
        Velikost fontu:
        <input class="infotext" v-model="fontSize">
      </h2>
      <h2 class="infotext">Vybrané fotky:</h2>
      <ul>
        <li v-for="item in manualFolders" :key="item.id">
          <button class="infotext" @click="removeManualFolder(item)">{{ item.name }}</button>
        </li>
      </ul>
    </div>
    <button class="infotext ok-button" @click="startSlideshow">OK</button>
  </div>
</template>

<script>
import { mapActions, mapMutations, mapState } from "vuex";
import { log } from "./utils";
import graphService from "./services/graph.service";

export default {
  data() {
    return {
      onedriveFolders: [],
      title: "nahrávám..."
    };
  },
  computed: {
    ...mapState(["manualFolders", "version"]),
    fontSize: {
      get() {
        return this.$store.state.fontSize;
      },
      set(value) {
        this.$store.commit("setFontSize", value);
      }
    }
  },
  mounted() {
    log("Settings: mounted");
    this.load(JSON.parse(localStorage.getItem("baseFolder")));
  },
  beforeDestroy() {
    log("Settings: beforeDestroy");
  },
  methods: {
    ...mapActions(["setFolders"]),
    ...mapMutations([
      "addManualFolder",
      "logError",
      "removeManualFolder",
      "setManualTimestamp",
      "setPhotos",
      "setRoute"
    ]),
    load(baseFolder) {
      this.title = "nahrávám...";
      localStorage.setItem("baseFolder", JSON.stringify(baseFolder));
      graphService
        .listPhotoFolders(baseFolder)
        .then(data => {
          this.title = "Přidat fotky:";
          this.onedriveFolders = data;
        })
        .catch(error => {
          this.logError(`listPhotoFolders error ${error}`);
          this.onedriveFolders = [{ name: "zkusit znovu" }];
        });
    },
    startSlideshow() {
      log("settings - startSlideshow");
      this.setManualTimestamp();
      this.setPhotos([]);
      this.setFolders(this.manualFolders.map(i => i.id));
      this.setRoute("slideshow");
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
  padding-left: 0.4em;
}
button {
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
div.rightbottom {
  bottom: 0.5em;
  right: 0.5em;
  position: fixed;
  border-width: 0px;
  padding: 2em 0 0 2em;
}
</style>
