import graphService from "./services/graph.service";
import { log, logError } from "./utils";

const state = {
  currentPhoto: null,
  currentRoute: null,
  folders: [],
  fontSize: "150%",
  isNextRandom: false,
  isLoadingPhotos: false,
  manualFolders: [],
  manualTimestamp: null,
  nextPhotoId: null,
  photos: [],
  remoteRefreshDelay: 10,
  showDescriptions: true,
  slideshowDelay: 300,
  statusText: "inicializece...",
  user: null,
  version: VERSION
};

const getters = {
  isSignedIn: state => Boolean(state.user)
};

const mutations = {
  addManualFolder(state, folder) {
    log(`add manual folder ${JSON.stringify(folder)}`);
    if (
      folder &&
      folder.id &&
      folder.name !== ".." &&
      state.manualFolders.filter(i => i.id === folder.id).length === 0
    ) {
      state.manualFolders.push({ id: folder.id, name: folder.name || folder.id });
      state.manualTimestamp = new Date().toISOString();
      localStorage.setItem("manualFolders", JSON.stringify(state.manualFolders));
      localStorage.setItem("manualTimestamp", state.manualTimestamp);
    }
    log(`manualFolders: ${JSON.stringify(state.manualFolders)}`);
  },
  addPhotos(state, photos) {
    state.photos.push(...photos);
    log(`add photos: ${JSON.stringify(photos)}`);
  },
  logError(state, text) {
    state.statusText = text;
    log(`logError set statusText to ${status}`);
    logError(text);
  },
  removeManualFolder(state, folder) {
    log(`remove ${JSON.stringify(folder)}`);
    state.manualFolders = state.manualFolders.filter(i => i.id !== folder.id);
    log(`manualFolders: ${JSON.stringify(state.manualFolders)}`);
  },
  setManualFoldersAndTimestamp(state, data) {
    state.manualTimestamp = data.manualTimestamp;
    state.manualFolders = data.manualFolders;
    log(`set manualFolders and manualTimestamp to ${JSON.stringify(data)}`);
  },
  setCurrentPhoto(state, payload) {
    state.currentPhoto = payload.photo;
    state.currentPhoto.url = payload.photoUrl;
    log(`set currentPhoto to ${JSON.stringify(state.currentPhoto)}`);
  },
  setFolders(state, folders) {
    state.folders = folders;
    log(`set folders to ${JSON.stringify(folders)}`);
  },
  setIsLoadingPhotos(state, value) {
    state.isLoadingPhotos = value;
    log(`set isLoadingPhotos to ${JSON.stringify(value)}`);
  },
  setNextPhotoId(state, photoId) {
    state.nextPhotoId = photoId;
    log(`set nextPhotoId to ${JSON.stringify(photoId)}`);
  },
  setIsNextRandom(state, isNextRandom) {
    state.isNextRandom = isNextRandom;
    log(`set isNextRandom to ${JSON.stringify(isNextRandom)}`);
  },
  setPhotos(state, photos) {
    state.photos = photos;
    log(`set photos to ${JSON.stringify(photos)}`);
  },
  shufflePhotos(state) {
    let toRandomizeCount = state.photos.length,
      tmp,
      idx;
    // While there remain elements to shuffle…
    while (toRandomizeCount) {
      // Pick a remaining element…
      idx = Math.floor(Math.random() * toRandomizeCount--);
      // And swap it with the current element.
      tmp = state.photos[toRandomizeCount];
      state.photos[toRandomizeCount] = state.photos[idx];
      state.photos[idx] = tmp;
    }
    log(`photos shuffled ${JSON.stringify(state.photos.map(p => p.name))}`);
  },
  sortPhotos(state) {
    state.photos.sort((a, b) => a.path.localeCompare(b.path));
    log(`photos sorted ${JSON.stringify(state.photos.map(p => p.name))}`);
  },
  setFontSize(state, size) {
    state.fontSize = size;
    localStorage.setItem("fontSize", state.fontSize);
    log(`set fontSize to ${state.fontSize}`);
  },
  setRemoteRefreshDelay(state, delay) {
    if (delay) {
      state.remoteRefreshDelay = delay;
      log(`set remoteRefreshDelay to ${delay}`);
    }
  },
  setRoute(state, route) {
    state.currentRoute = route;
    if (state.currentRoute === "settings") {
      window.history.replaceState(null, "", `?route=${state.currentRoute}`);
      document.title = state.currentRoute;
    }
    log(`set currentRoute to ${route} on ${window.location.pathname}${window.location.search}`);
  },
  setSlideshowDelay(state, delay) {
    if (delay) {
      state.slideshowDelay = delay;
      log(`set slideshowDelay to ${delay}`);
    }
  },
  setStatusText(state, status) {
    state.statusText = status;
    log(`set statusText to ${status}`);
  },
  setUser(state, user) {
    state.user = user;
    log(`set user to ${JSON.stringify(user)}`);
  },
  toggleDescriptions(state) {
    state.showDescriptions = !state.showDescriptions;
  }
};

const actions = {
  setFolders({ commit, dispatch, state }, folders) {
    if (state.folders.toString() !== folders.toString()) {
      log(`setFolders action ${folders}`);
      commit("setFolders", folders);
      dispatch("getPhotos", folders);
    } else {
      log(`setFolders got the same folders ${folders}`);
    }
  },
  getPhotos({ state, commit, dispatch }) {
    function dispatchShowNextPhoto() {
      if (state.isNextRandom) {
        commit("shufflePhotos");
      } else {
        commit("sortPhotos");
      }
      dispatch("showNextPhoto");
    }
    function getPhotosFromFolders(folders) {
      if (folders.length <= 0) {
        // loading more folders is finished
        commit("setIsLoadingPhotos", false);
        if (foldersCount === 1 || state.nextPhotoId) {
          dispatchShowNextPhoto();
        }
        return Promise.resolve();
      }
      log(`get photos for ${folders[0]}`);
      commit(
        "setStatusText",
        `nahrávám ${folders[0]} (${foldersCount - folders.length + 1}/${foldersCount})`
      );
      return graphService.getPhotoList(folders[0]).then(photos => {
        if (folders.length === foldersCount) {
          // the first folder is loaded
          commit("setPhotos", photos);
          if (foldersCount > 1 && !state.nextPhotoId) {
            // showNextPhoto only when loading more folders
            dispatchShowNextPhoto();
          }
        } else {
          commit("addPhotos", photos);
        }
        return getPhotosFromFolders(folders.slice(1));
      });
    }
    log(`getPhotos '${state.folders}'`);
    const foldersCount = (state.folders && state.folders.length) || 0;
    if (foldersCount > 0) {
      commit("setIsLoadingPhotos", true);
      return getPhotosFromFolders(state.folders);
    }
    return Promise.resolve();
  },
  showNextPhoto({ state, commit }) {
    if (state.isLoadingPhotos && state.nextPhotoId) {
      log("showNextPhoto - isLoadingPhotos with nextPhotoId");
      return Promise.resolve("isLoadingPhotos with nextPhotoId");
    }
    if (state.photos.length === 0) {
      log("showNextPhoto: no photos");
      return Promise.resolve("no photos");
    }
    log("showNextPhoto");
    let nextIndex = 0;
    const nextPhoto = state.photos.filter(p => state.nextPhotoId && p.id == state.nextPhotoId);
    if (nextPhoto.length > 0) {
      nextIndex = state.photos.indexOf(nextPhoto[0]);
    } else if (state.currentPhoto) {
      nextIndex = state.photos.indexOf(state.currentPhoto) + 1;
      if (nextIndex >= state.photos.length) {
        if (state.isNextRandom) {
          commit("shufflePhotos");
        }
        nextIndex = 0;
      }
    }
    const photo = state.photos[nextIndex];
    log(
      `showNextPhoto ${state.currentPhoto && state.currentPhoto.path} (${state.currentPhoto &&
        state.currentPhoto.id}) => ${photo.path} (${photo.id})`
    );
    commit("setNextPhotoId", null);

    if (state.currentPhoto && state.currentPhoto.id === photo.id) {
      return Promise.resolve("the same photo");
    }

    commit("setStatusText", "nahrávám...");
    return graphService
      .getPhotoUrl(photo)
      .then(photoUrl => {
        commit("setCurrentPhoto", { photo, photoUrl });
      })
      .then(_ => {
        const newLocation = `?route=${state.currentRoute}&photo=${state.currentPhoto.id}`;
        window.history.pushState(null, "", newLocation);
        document.title = state.currentPhoto && state.currentPhoto.name;
      });
  },
  refreshRemoteConfig({ state, getters, commit, dispatch }) {
    if (!getters.isSignedIn) {
      log("skip refreshing remote config - user not signed in");
      return Promise.resolve();
    }
    log("refreshing remote config...");
    return graphService.getRemoteConfig().then(config => {
      commit("setIsNextRandom", config.isNextRandom === true);
      commit("setRemoteRefreshDelay", config.remoteRefreshDelay);
      commit("setSlideshowDelay", config.slideshowDelay);
      if (
        state.manualFolders &&
        state.manualFolders.length > 0 &&
        state.manualTimestamp > config.foldersUpdated
      ) {
        log("manual folders newer then remoteConfig folders");
        dispatch("setFolders", state.manualFolders.map(i => i.id));
      } else {
        dispatch("setFolders", config.folders);
      }
      if (config.version > state.version) {
        commit("logError", "app refresh");
        window.location.reload(true);
      }
    });
  }
};

function getLocation(route, photoId) {
  return `?route=${route}` + (route === "slideshow" ? `&photo=${photoId}` : "");
}

export default {
  strict: process.env.NODE_ENV !== "production",
  state,
  getters,
  mutations,
  actions
};
