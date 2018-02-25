import * as Msal from "msal";
import { clientId } from "../config.json";
import { log, logError } from "../utils";

const graphScopes = ["User.Read", "Files.Read.All"];
const app = new Msal.UserAgentApplication(
  clientId,
  "",
  () => {
    log("login-redirecting...");
  },
  {
    redirectUri: MSAL_REDIRECT_URL,
    cacheLocation: "localStorage"
  }
);

export default {
  getToken() {
    return app.acquireTokenSilent(graphScopes).catch(error => {
      log(`acquireTokenSilent error: ${error}`);
      return app.acquireTokenPopup(graphScopes);
    });
  },
  getUser() {
    return app.getUser();
  },
  login() {
    log("loging in...");
    return app.loginPopup(graphScopes).then(
      idToken => {
        log("got token");
        return app.getUser();
      },
      err => {
        logError(`loginPopup error: ${err}`);
        return null;
      }
    );
  },
  logout() {
    app.logout();
  }
};
