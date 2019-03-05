<template>
  <div>
    <button v-if="!isSignedIn" @click="login">Login</button>
    <button v-if="isSignedIn" @click="logout">L</button>
  </div>
</template>

<script>
import authService from "./services/auth.service";
import { mapGetters, mapMutations } from "vuex";

export default {
  computed: {
    ...mapGetters(["isSignedIn"])
  },
  created() {
    this.setUser(authService.getUser());
    this.setStatusText(this.isSignedIn ? "" : "nepřihlášený uživatel");
  },
  methods: {
    login() {
      authService.login();
    },
    logout() {
      localStorage.removeItem("vuex");
      authService.logout();
    },
    ...mapMutations(["setStatusText", "setUser"])
  },
  watch: {
    isSignedIn() {
      this.setStatusText(this.isSignedIn ? "" : "nepřihlášený uživatel");
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
