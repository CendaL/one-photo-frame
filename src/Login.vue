<template>
  <div>
    <p>User {{user}}</p>
    <p>UserInfo {{userInfo}}</p>
    <button @click="login">Login</button>
    <button @click="getUser()">get user</button>
  </div>
</template>

<script>
import AuthService from "./services/auth.service";
import GraphService from "./services/graph.service";

export default {
  data() {
    return {
      user: "?",
      userInfo: "?"
    };
  },
  created() {
    this.authService = new AuthService();
    this.graphService = new GraphService();
    this.user = this.authService.getUser();
  },
  methods: {
    getUser() {
      this.authService.getToken().then(
        token => {
          this.graphService.getUserInfo(token).then(
            data => {
              this.userInfo = data;
            },
            error => {
              console.error(error);
            }
          );
        },
        error => {
          console.error(error);
        }
      );
    },
    login() {
      this.authService.login().then(
        user => {
          if (user) {
            this.user = user;
          } else {
            console.log("login failed");
          }
        },
        () => {
          console.log("login failed");
        }
      );
    }
  }
};
</script>

<style scoped>
img,
video {
  max-width: 300px;
  max-height: 200px;
}
</style>

