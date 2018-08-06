<template>
  <div>
    <button @click="load()">load</button>
    <ul>
      <li v-for="item in folders" :key="item.id">
        <button @click="add(item)">+</button>
        <button @click="load(item)">{{ item.name }}</button>
      </li>
    </ul>
    <ul>
      <li v-for="item in selected" :key="item.id">
        <button @click="remove(item)">{{ item.name }} ({{item.id}})</button>
      </li>
    </ul>
  </div>
</template>

<script>
import { mapActions, mapGetters, mapMutations, mapState } from "vuex";
import { log, logError } from "./utils";
import graphService from "./services/graph.service";
import Log from "./Log.vue";

export default {
  data() {
    return {
      folders: [{ id: 1, name: "def" }],
      selected: []
    };
  },
  components: {
    log: Log
  },
  computed: {
    // ...mapState(["folders"]),
    ...mapGetters(["isSignedIn"])
  },
  created() {},
  methods: {
    ...mapActions([]),
    ...mapMutations(["setFolders", "setStatusText"]),
    load(baseFolder) {
      graphService.listPhotoFolders(baseFolder).then(data => {
        this.folders = data;
      });
    },
    add(baseFolder) {
      console.log(`add ${JSON.stringify(baseFolder)}`);
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
      console.log(`remove ${JSON.stringify(baseFolder)}`);
      this.selected = this.selected.filter(i => i.id !== baseFolder.id);
    }
  }
};
</script>

<style scoped>
li {
  list-style-type: none;
}
button {
  font-family: sans-serif;
  color: gray;
  background-color: transparent;
  border-width: 0px;
  text-align: left;
  font-size: larger;
}
</style>

