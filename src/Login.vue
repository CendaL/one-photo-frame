<template>
  <div>
    <button v-if="!isSignedIn" @click="login">Login</button>
    <button v-if="isSignedIn" @click="logout">L</button>
  </div>
</template>

<script>
import authService from "./services/auth.service";
import graphService from "./services/graph.service";
import { logError } from "./utils";
import { mapActions, mapGetters, mapMutations, mapState } from "vuex";

export default {
  computed: {
    ...mapState(["user"]),
    ...mapGetters(["isSignedIn"])
  },
  created() {
    this.setUser(authService.getUser());
    this.setStatusText(this.isSignedIn ? "" : "nepřihlášený uživatel");
  },
  methods: {
    login() {
      authService.login().then(
        user => {
          if (user) {
            this.setUser(user);
          } else {
            this.setUser(null);
            logError("login failed: no user");
          }
        },
        err => {
          this.setUser(null);
          logError(`login failed: ${err}`);
        }
      );
    },
    logout() {
      localStorage.removeItem("vuex");
      authService.logout();
    },
    ...mapActions(["refreshRemoteConfig"]),
    ...mapMutations(["setStatusText", "setUser"])
  },
  watch: {
    isSignedIn() {
      this.setStatusText(this.isSignedIn ? "" : "nepřihlášený uživatel");
      if (this.isSignedIn) {
        this.refreshRemoteConfig().catch(e => {
          logError(`refreshRemoteConfig error: ${e}`);
        });
      }
    }
  }
};
</script>

<style scoped>
button {
  font-family: sans-serif;
  color: gray;
  background-color: transparent;
  border-width: 0px;
}
</style>
