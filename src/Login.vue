<template>
  <div>
    <button
      class="infotext z5"
      v-if="!isSignedIn"
      v-bind:style="{ fontSize: fontSize }"
      @click="login"
    >Login</button>
    <button
      class="infotext z5"
      v-if="isSignedIn"
      v-bind:style="{ fontSize: fontSize }"
      @click="logout"
    >L</button>
  </div>
</template>

<script>
import authService from "./services/auth.service";
import { mapGetters, mapMutations, mapState } from "vuex";

export default {
  computed: {
    ...mapGetters(["isSignedIn"]),
    ...mapState(["fontSize"])
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
  border-width: 0px;
  padding: 1em 1em 0 0;
}
</style>
