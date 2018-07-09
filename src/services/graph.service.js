import authService from "./auth.service";
import { baseName, formatDateTime, getDriveId, isVideo } from "../utils";
import { log } from "../utils";

const isProd = IS_PROD;
const graphUrl = "https://graph.microsoft.com/v1.0";
const listSuffix = "/delta?select=id,name,description,photo,video,file,parentReference";

function getSharedConfig() {
  return prepareRequest(`${graphUrl}/me/drive/sharedWithMe`)
    .then(parseResponse)
    .then(response => {
      const sharedConfig = response.value.filter(item => item.name === "one-photo-frame.json")[0];
      if (sharedConfig && sharedConfig.remoteItem) {
        const sharedConfigId = sharedConfig.remoteItem.id;
        return prepareRequest(
          `${graphUrl}/drives/${getDriveId(sharedConfigId)}/items/${sharedConfigId}/content`
        );
      } else {
        throw "one-photo-frame.others.json not found";
      }
    });
}

function getPhotoList(path) {
  function getPhotoListFromUrl(url) {
    return prepareRequest(url)
      .then(response => response.json())
      .then(response => {
        log(`add photos: ${response.value.length}`);
        photoList.push(...response.value);
        if (response["@odata.nextLink"]) {
          return getPhotoListFromUrl(response["@odata.nextLink"]);
        }
      });
  }

  let photoList = [];
  return getPhotoListFromUrl(`${graphUrl}/drives/${getDriveId(path)}/items/${path}${listSuffix}`).then(_ => {
    log(`all photos: ${photoList.length}`);
    return Promise.resolve(getPhotosFromPhotoList(photoList));
  });
}

function getPhotosFromPhotoList(photoList) {
  const videoBaseNames = photoList.filter(photo => isVideo(photo.name)).map(photo => baseName(photo.name));
  return photoList
    .filter(photo => {
      if (photo.photo && (isVideo(photo.name) || videoBaseNames.indexOf(baseName(photo.name)) === -1)) {
        return true;
      }
      log(`Filter out ${photo.name}`);
    })
    .map(photo => {
      const folder = decodeURI(photo.parentReference.path.split("/").pop());
      return {
        id: photo.id,
        name: photo.name,
        description: photo.description ? photo.description : "",
        folder: folder.substring(folder.indexOf(" ") + 1),
        path: `${photo.parentReference.path}/${photo.name}`,
        url: null,
        duration: photo.video ? parseInt(photo.video.duration) / 1000 : 0,
        taken: photo.photo ? formatDateTime(photo.photo.takenDateTime) : ""
      };
    });
}

function parseResponse(response) {
  if (!response.ok) {
    throw new Error(response.statusText);
  }
  return response.json();
}

function prepareRequest(url) {
  return authService.getToken().then(token => {
    const headers = new Headers({
      Authorization: `Bearer ${token}`
    });
    const options = {
      headers,
      retries: 3,
      retryDelay: 3000
    };
    log(`getting data from url '${url}'...`);
    return fetch(url, options);
  });
}

export default {
  getRemoteConfig() {
    return prepareRequest(`${graphUrl}/me/drive/root:/one-photo-frame${isProd ? "" : ""}.json:/content`)
      .then(response => (response.status === 404 ? getSharedConfig() : response))
      .then(parseResponse);
  },
  getPhotoList,
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
        headers,
        retries: 3,
        retryDelay: 3000
      };
      return fetch(`${graphUrl}/me`, options).then(response => response.json());
    });
  }
};
