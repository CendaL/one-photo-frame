import graphService from "./services/graph.service";
import { log, logError } from "./utils";

const state = {
  currentPhoto: null,
  currentRoute: null,
  folders: [],
  isNextRandom: false,
  loadingPhotos: false,
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
  setLoadingPhotos(state, value) {
    state.loadingPhotos = value;
    log(`set loadingPhotos to ${JSON.stringify(value)}`);
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
        // loading folders is finished
        commit("setLoadingPhotos", false);
        if (state.isNextRandom) {
          commit("shufflePhotos");
        } else {
          commit("sortPhotos");
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
          commit("setPhotos", photos);
          if (state.isNextRandom) {
            commit("shufflePhotos");
          } else {
            commit("sortPhotos");
          }
        } else {
          commit("addPhotos", photos);
        }
        return getPhotosFromFolders(folders.slice(1));
      });
    }
    log(`getPhotos '${state.folders}'`);
    commit("setLoadingPhotos", true);
    const foldersCount = (state.folders && state.folders.length) || 0;
    return getPhotosFromFolders(state.folders);
  },
  navigate({ state, commit, dispatch }, options) {
    commit("setStatusText", "nahrávám...");
    log(`navigate: ${window.location.pathname}${window.location.search} => ${JSON.stringify(options)}`);
    if (state.currentRoute !== options.route) {
      commit("setRoute", options.route);
    }
  },
  showNextPhoto({ state, commit }, options) {
    if (state.loadingPhotos) {
      log("showNextPhoto - loadingPhotos");
      return Promise.resolve();
    }
    if (state.photos.length === 0) {
      log("showNextPhoto: no photos");
      return Promise.reject("no photos");
    }
    log("showNextPhoto");
    let nextIndex = 0;
    if (state.currentPhoto) {
      nextIndex = state.photos.indexOf(state.currentPhoto) + 1;
      if (nextIndex >= state.photos.length) {
        if (state.isNextRandom) {
          commit("shufflePhotos");
        }
        nextIndex = 0;
      }
    }
    const photo = state.photos[nextIndex];
    log(`showNextPhoto ${state.currentPhoto && state.currentPhoto.path} => ${photo.path}`);

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
