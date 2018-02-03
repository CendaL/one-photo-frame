<template>
  <div>
    <button v-if="!isSignedIn" @click="login">Login</button>
    <button v-if="isSignedIn" @click="logout">L</button>
  </div>
</template>

<script>
import authService from "./services/auth.service";
import graphService from "./services/graph.service";
import { log } from "./utils";
import { mapActions, mapGetters, mapMutations, mapState } from "vuex";

export default {
  computed: {
    ...mapState(["user"]),
    ...mapGetters(["isSignedIn"])
  },
  created() {
    this.setUser(authService.getUser());
  },
  methods: {
    login() {
      authService.login().then(
        user => {
          if (user) {
            this.setUser(user);
            this.refreshRemoteConfig();
          } else {
            this.setUser(null);
            log("login failed: no user");
          }
        },
        err => {
          log(`login failed: ${err}`);
        }
      );
    },
    logout() {
      localStorage.removeItem("vuex");
      authService.logout();
    },
    ...mapActions(["refreshRemoteConfig"]),
    ...mapMutations(["setUser"])
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
