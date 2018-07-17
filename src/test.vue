<template>
  <div>
    <button @click="load">load</button>
    <ul>
      <li v-for="item in folders" :key="item.id">
        {{ item.name }}
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
      folders: [{ id: 1, name: "def" }]
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
    load() {
      graphService.listPhotoFolders().then(data => {
        debugger;
        this.folders = data;
      });
    }
  }
};
</script>

<style scoped>
li {
  color: white;
}
</style>

