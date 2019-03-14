import graphService from "./services/graph.service";
import { log, logError } from "./utils";

const state = {
  currentPhoto: null,
  currentRoute: null,
  folders: [],
  isNextRandom: false,
  manualFolders: [],
  manualTimestamp: null,
  photos: [],
  remoteRefreshDelay: 10,
  slideshowDelay: 300,
  statusText: "inicializece...",
  user: null
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
    }
    log(`manualFolders: ${JSON.stringify(state.manualFolders)}`);
  },
  addPhotos(state, photos) {
    state.photos.push(...photos);
    log(`add photos: ${JSON.stringify(photos)}`);
  },
  removeManualFolder(state, folder) {
    log(`remove ${JSON.stringify(folder)}`);
    state.manualFolders = state.manualFolders.filter(i => i.id !== folder.id);
    log(`manualFolders: ${JSON.stringify(state.manualFolders)}`);
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
  setRemoteRefreshDelay(state, delay) {
    if (delay) {
      state.remoteRefreshDelay = delay;
      log(`set remoteRefreshDelay to ${delay}`);
    }
  },
  setRoute(state, route) {
    state.currentRoute = route;
    log(`set currentRoute to ${route}`);
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
  }
};

const actions = {
  setFolders({ commit, dispatch }, folders) {
    log(`setFolders action ${folders}`);
    commit("setFolders", folders);
    dispatch("getPhotos", folders);
  },
  getPhotos({ state, commit, dispatch }) {
    function getPhotosFromFolders(folders) {
      if (folders.length <= 0) {
        return Promise.resolve();
      }
      log(`get photos for ${folders[0]}`);
      commit(
        "setStatusText",
        `nahrávám ${folders[0]} (${foldersCount - folders.length + 1}/${foldersCount})`
      );
      return graphService.getPhotoList(folders[0]).then(photos => {
        if (folders.length === foldersCount) {
          commit("setPhotos", photos);
        } else {
          commit("addPhotos", photos);
        }
        return getPhotosFromFolders(folders.slice(1));
      });
    }
    log(`getPhotos '${state.folders}'`);
    const foldersCount = (state.folders && state.folders.length) || 0;
    return getPhotosFromFolders(state.folders);
  },
  navigate({ state, commit, dispatch }, options) {
    commit("setStatusText", "nahrávám...");
    log(`navigate: ${window.location.pathname}${window.location.search} => ${JSON.stringify(options)}`);
    if (state.currentRoute !== options.route) {
      commit("setRoute", options.route);
    }
    if (state.photos.length === 0) {
      log("navigate: no photos");
      return Promise.reject("no photos");
    }
    let nextPhotoAction = Promise.resolve(state.currentPhoto);
    if (options.route === "slideshow" && (options.photo !== undefined || state.currentPhoto == null)) {
      nextPhotoAction = dispatch("nextPhoto", options);
    }
    return nextPhotoAction.then(currentPhoto => {
      if (options.addToHistory !== false) {
        const newLocation = getLocation(state.currentRoute, currentPhoto && currentPhoto.id);
        if (options.replaceHistory) {
          window.history.replaceState(null, "", newLocation);
        } else {
          window.history.pushState(null, "", newLocation);
        }
      }
      document.title = options.route === "slideshow" ? currentPhoto && currentPhoto.name : options.route;
    });
  },
  nextPhoto({ state, commit }, options) {
    if (state.photos.length === 0) {
      log("nextPhoto: no photos");
      return Promise.reject("no photos");
    }
    var photo = state.photos.find(p => p.id.toLowerCase() === options.photo.toLowerCase());
    if (photo === undefined) {
      if (state.currentPhoto) {
        let nextIndex = state.photos.indexOf(state.currentPhoto) + 1;
        if (nextIndex >= state.photos.length) {
          if (state.isNextRandom) {
            commit("shufflePhotos");
          }
          nextIndex = 0;
        }
        photo = state.photos[nextIndex];
      } else {
        photo = state.photos[0];
      }
      log(`next photo ${state.currentPhoto && state.currentPhoto.path} => ${photo.path}`);
    } else {
      log(`next specific photo ${options.photo}`);
    }
    return graphService.getPhotoUrl(photo).then(photoUrl => {
      commit("setCurrentPhoto", { photo, photoUrl });
      return Promise.resolve(state.currentPhoto);
    });
  },
  refreshRemoteConfig({ getters, commit, dispatch }) {
    if (!getters.isSignedIn) {
      log("skip refreshing remote config - user not signed in");
      return Promise.resolve();
    }
    log("refreshing remote config...");
    return graphService.getRemoteConfig().then(config => {
      dispatch("setFolders", config.folders);
      commit("setIsNextRandom", config.isNextRandom === true);
      commit("setRemoteRefreshDelay", config.remoteRefreshDelay);
      commit("setSlideshowDelay", config.slideshowDelay);
      if (config.version > VERSION) {
        logError("app refresh");
        window.location.reload(true);
      }
    });
  },
  updatePhotos({ state, commit }, photos) {
    commit("setPhotos", photos);
    if (state.isNextRandom) {
      commit("shufflePhotos");
    } else {
      commit("sortPhotos");
    }
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
