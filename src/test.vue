<template>
  <div>
    <div class="photo-folders">
      <h2>Přidat fotky:</h2>
      <ul>
        <li v-for="item in folders" :key="item.id">
          <button @click="add(item)">+</button>
          <button @click="load(item)">{{ item.name }}</button>
        </li>
      </ul>
    </div>
    <div class="selected-photos">
      <h2>Vybrané fotky:</h2>
      <ul>
        <li v-for="item in selected" :key="item.id">
          <button @click="remove(item)">{{ item.name }} ({{item.id}})</button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters, mapMutations, mapState } from "vuex";
import { log, logError } from "./utils";
import graphService from "./services/graph.service";

export default {
  data() {
    return {
      folders: [{ name: "nahrávám..." }],
      selected: []
    };
  },
  computed: {
    // ...mapState(["folders"]),
    ...mapGetters(["isSignedIn"])
  },
  created() {
    this.load();
  },
  methods: {
    ...mapActions([]),
    ...mapMutations(["setFolders"]),
    load(baseFolder) {
      graphService.listPhotoFolders(baseFolder).then(data => {
        this.folders = data;
      });
    },
    add(baseFolder) {
      log(`add ${JSON.stringify(baseFolder)}`);
      if (
        baseFolder &&
        baseFolder.id &&
        baseFolder.name !== ".." &&
        this.selected.filter(i => i.id === baseFolder.id).length === 0
      ) {
        this.selected.push({ id: baseFolder.id, name: baseFolder.name || baseFolder.id });
      }
    },
    remove(baseFolder) {
      log(`remove ${JSON.stringify(baseFolder)}`);
      this.selected = this.selected.filter(i => i.id !== baseFolder.id);
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
</style>

