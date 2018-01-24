<template>
  <div>
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
            console.error("login failed: no user");
          }
        },
        err => {
          console.error(`login failed: ${err}`);
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
