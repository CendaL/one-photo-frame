import * as Msal from 'msal'
import { clientId } from "../config.json"

export default class AuthService {
    constructor() {
        this.graphScopes = ['user.read']
        this.app = new Msal.UserAgentApplication(
            clientId,
            '',
            () => {
                console.log("login-redirecting...")
            },
            {
                redirectUri: "http://localhost:8080"
            }
        )
    }
    login() {
        return this.app.loginPopup(this.graphScopes).then(
            idToken => {
                const user = this.app.getUser()
                if (user) {
                    return user
                } else {
                    return null
                }
            },
            err => {
                console.log("token error " + err)
                return null
            }
        )
    }
    logout() {
        this.app.logout()
    }
    getToken() {
        return this.app.acquireTokenSilent(this.graphScopes).then(
            accessToken => {
                return accessToken
            },
            error => {
                return this.app
                    .acquireTokenPopup(this.graphScopes)
                    .then(
                    accessToken => { return accessToken },
                    err => { console.error("access token error " + err) }
                    )
            }
        )
    }
}
