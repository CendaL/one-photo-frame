import authService from "./auth.service";
import { baseName, isVideo } from "../utils";

const graphUrl = "https://graph.microsoft.com/v1.0";
const basePath = `${graphUrl}/me/drive/root:`;
const listSuffix = ":/delta?select=name,photo,video,file,parentReference";

function prepareRequest(url) {
  return authService.getToken().then(token => {
    const headers = new Headers({
      Authorization: `Bearer ${token}`
    });
    const options = {
      headers
    };
    console.debug(`getting data from url '${url}'...`);
    return fetch(url, options);
  });
}

export default {
  getRemoteConfig() {
    return prepareRequest(`${basePath}/one-photo-frame.json:/content`).then(response => response.json());
  },
  getPhotoList(path) {
    return prepareRequest(`${basePath}/${path}${listSuffix}`)
      .then(response => response.json())
      .then(response => {
        const videoBaseNames = response.value
          .filter(photo => isVideo(photo.name))
          .map(photo => baseName(photo.name));
        return Promise.resolve(
          response.value
            .filter(photo => {
              if (
                photo.file &&
                (isVideo(photo.name) || videoBaseNames.indexOf(baseName(photo.name)) === -1)
              ) {
                return true;
              }
              console.debug(`Filter out ${photo.name}`);
            })
            .map((photo, idx) => {
              photo.parentReference.path;
              let subfolder = photo.parentReference.path.substring(
                photo.parentReference.path.indexOf(path) + path.length
              );
              return {
                index: idx + 1,
                name: photo.name,
                path: `${path}${subfolder}/${photo.name}`,
                url: null,
                taken: photo.photo ? photo.photo.takenDateTime : null
              };
            })
        );
      });
  },
  getPhotoUrl(path) {
    return prepareRequest(`${basePath}/${path}`)
      .then(response => response.json())
      .then(response => {
        if (response.hasOwnProperty("@microsoft.graph.downloadUrl")) {
          const suffix = isVideo(path) ? "" : "?width=100&height=100&cropmode=none";
          return Promise.resolve(response["@microsoft.graph.downloadUrl"] + suffix);
        } else {
          return Promise.reject(`Error getting photo url: ${JSON.stringify(response["error"])}`);
        }
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
