<template>
  <div>
    <button
      class="infotext login center"
      v-if="!isSignedIn"
      v-bind:style="{ fontSize: fontSize }"
      @click="login"
    >Login</button>
    <button
      class="infotext"
      v-if="isSignedIn && currentRoute === 'settings'"
      v-bind:style="{ fontSize: fontSize }"
      @click="logout"
    >L</button>
  </div>
</template>

<script>
import authService from "./services/auth.service";
import { mapGetters, mapMutations, mapState } from "vuex";
import { log } from "./utils";

export default {
  computed: {
    ...mapGetters(["isSignedIn"]),
    ...mapState(["currentRoute", "fontSize"])
  },
  created() {
    this.setUser(authService.getUser());
    this.setStatusText(this.isSignedIn ? "" : "nepřihlášený uživatel");
  },
  mounted() {
    log("Login: mounted");
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
  border-width: 0px;
  padding: 2em 2em 0 0;
}
button.login {
  left: 50%;
  top: 50%;
  position: fixed;
  transform: translate(-50%, -50%);
}
</style>
