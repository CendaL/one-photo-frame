import { escape } from "querystring";
import authService from "./auth.service";

const graphUrl = "https://graph.microsoft.com/v1.0";

export default {
  getUserInfo() {
    return authService.getToken().then(token => {
      const headers = new Headers({
        Authorization: `Bearer ${token}`
      });
      const options = {
        headers
      };
      return fetch(`${graphUrl}/me`, options).then(response => response.json());
    });
  }
};
