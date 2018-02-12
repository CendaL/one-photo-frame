import authService from "./auth.service";
import { baseName, formatDateTime, getDriveId, isVideo } from "../utils";
import { log } from "../utils";

const isProd = IS_PROD;
const graphUrl = "https://graph.microsoft.com/v1.0";
const listSuffix = "/delta?select=id,name,photo,video,file,parentReference";

function prepareRequest(url) {
  return authService.getToken().then(token => {
    const headers = new Headers({
      Authorization: `Bearer ${token}`
    });
    const options = {
      headers
    };
    log(`getting data from url '${url}'...`);
    return fetch(url, options);
  });
}

function parseResponse(response) {
  if (!response.ok) {
    throw new Error(response.statusText);
  }
  return response.json();
}

function getOtherConfig() {
  return prepareRequest(`${graphUrl}/me/drive/sharedWithMe`)
    .then(parseResponse)
    .then(response => {
      const otherConfig = response.value.filter(item => item.name === "one-photo-frame.others.json")[0];
      if (otherConfig && otherConfig.remoteItem) {
        const otherConfigId = otherConfig.remoteItem.id;
        return prepareRequest(
          `${graphUrl}/drives/${getDriveId(otherConfigId)}/items/${otherConfigId}/content`
        );
      } else {
        throw "one-photo-frame.others.json not found";
      }
    });
}

export default {
  getRemoteConfig() {
    return prepareRequest(`${graphUrl}/me/drive/root:/one-photo-frame${isProd ? "" : ".other"}.json:/content`)
      .then(response => (response.status === 404 ? getOtherConfig() : response))
      .then(parseResponse);
  },
  getPhotoList(path) {
    return prepareRequest(`${graphUrl}/drives/${getDriveId(path)}/items/${path}${listSuffix}`)
      .then(response => response.json())
      .then(response => {
        const videoBaseNames = response.value
          .filter(photo => isVideo(photo.name))
          .map(photo => baseName(photo.name));
        const result = response.value
          .filter(photo => {
            if (photo.photo && (isVideo(photo.name) || videoBaseNames.indexOf(baseName(photo.name)) === -1)) {
              return true;
            }
            log(`Filter out ${photo.name}`);
          })
          .map((photo, idx) => {
            return {
              index: idx + 1,
              id: photo.id,
              name: photo.name,
              path: `${photo.parentReference.path}/${photo.name}`,
              url: null,
              taken: photo.photo ? formatDateTime(photo.photo.takenDateTime) : ""
            };
          });
        result.sort((a, b) => a.path.localeCompare(b.path));
        return Promise.resolve(result);
      });
  },
  getPhotoUrl(photo) {
    return prepareRequest(`${graphUrl}/drives/${getDriveId(photo.id)}/items/${photo.id}`)
      .then(response => response.json())
      .then(response => {
        if (response.hasOwnProperty("@microsoft.graph.downloadUrl")) {
          const suffix = isVideo(photo.path)
            ? ""
            : `?width=${window.innerWidth}&height=${window.innerHeight}&cropmode=none`;
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
