<template>
  <div>
    <div class="infotext rightbottom">v{{version}}</div>
    <div class="photo-folders">
      <h2 class="infotext">{{title}}</h2>
      <ul v-bind:style="{ fontSize: fontSize }">
        <li v-for="item in onedriveFolders" :key="item.id">
          <button v-if="!item.title" class="infotext" @click="addManualFolder(item)">+</button>
          <button class="infotext" @click="load(item)">{{ item.title || item.name }}</button>
        </li>
      </ul>
    </div>
    <div class="selected-photos">
      <h2 class="infotext">
        Velikost fontu:
        <input class="infotext" v-model="fontSize">
      </h2>
      <h2 class="infotext" @click="copyFolderIdsToClipboard">Vybrané fotky:</h2>
      <ul v-bind:style="{ fontSize: fontSize }">
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
import { log, logError } from "./utils";
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
      this.setFolders(this.manualFolders.map(i => i.id));
      this.setRoute("slideshow");
    },
    copyFolderIdsToClipboard() {
      //https://stackoverflow.com/a/30810322/138803
      var textArea = document.createElement("textarea");

      //
      // *** This styling is an extra step which is likely not required. ***
      //
      // Why is it here? To ensure:
      // 1. the element is able to have focus and selection.
      // 2. if element was to flash render it has minimal visual impact.
      // 3. less flakyness with selection and copying which **might** occur if
      //    the textarea element is not visible.
      //
      // The likelihood is the element won't even render, not even a
      // flash, so some of these are just precautions. However in
      // Internet Explorer the element is visible whilst the popup
      // box asking the user for permission for the web page to
      // copy to the clipboard.
      //

      // Place in top-left corner of screen regardless of scroll position.
      textArea.style.position = "fixed";
      textArea.style.top = 0;
      textArea.style.left = 0;

      // Ensure it has a small width and height. Setting to 1px / 1em
      // doesn't work as this gives a negative w/h on some browsers.
      textArea.style.width = "2em";
      textArea.style.height = "2em";

      // We don't need padding, reducing the size if it does flash render.
      textArea.style.padding = 0;

      // Clean up any borders.
      textArea.style.border = "none";
      textArea.style.outline = "none";
      textArea.style.boxShadow = "none";

      // Avoid flash of white box if rendered for any reason.
      textArea.style.background = "transparent";

      textArea.value = JSON.stringify(this.manualFolders.map(i => i.id));

      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      try {
        var successful = document.execCommand("copy");
        var msg = successful ? "successful" : "unsuccessful";
        log(`Copying ${textArea.value} into clipboard was ${msg}`);
      } catch (err) {
        logError(`Oops, unable to copy: ${err}`);
      }

      document.body.removeChild(textArea);
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
