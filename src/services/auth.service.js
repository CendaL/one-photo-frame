import * as Msal from "msal";
import { clientId } from "../config.json";

const graphScopes = ["User.Read", "Files.Read.All"];
const app = new Msal.UserAgentApplication(
  clientId,
  "",
  () => {
    console.debug("login-redirecting...");
  },
  {
    redirectUri: MSAL_REDIRECT_URL,
    cacheLocation: "localStorage"
  }
);

export default {
  getToken() {
    return app.acquireTokenSilent(graphScopes).catch(error => {
      console.warn(`acquireTokenSilent error: ${error}`);
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
        console.error(`loginPopup error: ${err}`);
        return null;
      }
    );
  },
  logout() {
    app.logout();
  }
};
