import * as Msal from "msal";
import { clientId } from "../config.json";

const graphScopes = ["user.read"];
const app = new Msal.UserAgentApplication(
  clientId,
  "",
  () => {
    console.log("login-redirecting...");
  },
  {
    redirectUri: "http://localhost:8080",
    cacheLocation: "localStorage"
  }
);

export default {
  getToken() {
    return app.acquireTokenSilent(graphScopes).catch(error => {
      console.log(`acquireTokenSilent error: ${error}`);
      return app.acquireTokenPopup(graphScopes);
    });
  },
  getUser() {
    return app.getUser();
  },
  login() {
    return app.loginPopup(graphScopes).then(
      idToken => app.getUser(),
      err => {
        console.log(`loginPopup error: ${err}`);
        return null;
      }
    );
  },
  logout() {
    app.logout();
  }
};
