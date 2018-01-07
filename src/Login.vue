<template>
  <div>
    <p>User {{user}}</p>
    <button v-if="!isSignedIn" @click="login">Login</button>
    <button v-if="isSignedIn" @click="logout">Logout</button>
  </div>
</template>

<script>
import authService from "./services/auth.service";
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
          } else {
            this.setUser(null);
            console.log("login failed 2");
          }
        },
        () => {
          console.log("login failed");
        }
      );
    },
    logout() {
      this.setUser(null);
      authService.logout();
    },
    ...mapMutations(["setUser"])
  }
};
</script>

<style scoped>

</style>
