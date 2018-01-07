<template>
  <div>
    <p>User {{user}}</p>
    <button v-if="!isSignedIn" @click="login">Login</button>
    <button v-if="isSignedIn" @click="logout">Logout</button>
  </div>
</template>

<script>
import authService from "./services/auth.service";
import graphService from "./services/graph.service";

export default {
  data() {
    return {
      user: null
    };
  },
  computed: {
    isSignedIn() {
      return Boolean(this.user);
    }
  },
  created() {
    this.user = authService.getUser();
  },
  methods: {
    login() {
      authService.login().then(
        user => {
          if (user) {
            this.user = user;
          } else {
            console.log("login failed 2");
          }
        },
        () => {
          console.log("login failed");
        }
      );
    },
    logout() {
      authService.logout();
      this.user = "?";
    }
  }
};
</script>

<style scoped>

</style>
