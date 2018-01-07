import authService from "./auth.service";
import { baseName, isVideo } from "../utils";

const graphUrl = "https://graph.microsoft.com/v1.0";
const listSuffix = ":/children?select=name,photo,video";
const imageSuffix = ":/content?width=100&height=100&cropmode=none";

export default {
  getPhotoList(path) {
    const basePath = `${graphUrl}/me/drive/root:/${escape(path)}`;
    const url = `${basePath}${listSuffix}`;
    return authService.getToken().then(token => {
      const headers = new Headers({
        Authorization: `Bearer ${token}`
      });
      const options = {
        headers
      };
      return fetch(url, options)
        .then(response => response.json())
        .then(response => {
          const videoBaseNames = response.value
            .filter(photo => isVideo(photo.name))
            .map(photo => baseName(photo.name));
          return Promise.resolve(
            response.value
              .filter(photo => isVideo(photo.name) || videoBaseNames.indexOf(baseName(photo.name)) === -1)
              .map((photo, idx) => {
                return {
                  index: idx + 1,
                  name: photo.name
                  // path: `${basePath}/${photo.name}`
                  // taken: photo.photo.takenDateTime
                };
              })
          );
        });
    });
  },
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
