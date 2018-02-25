import Vue from "vue";
import Vuex from "vuex";
import createPersistedStore from "vuex-persistedstate";
import graphService from "./services/graph.service";
import { log } from "./utils";

Vue.use(Vuex);

const state = {
  currentPhoto: null,
  currentRoute: null,
  folders: [],
  photos: [],
  remoteRefreshDelay: 14400,
  slideshowDelay: 300,
  statusText: "inicializece...",
  user: null
};

const getters = {
  isSignedIn: state => Boolean(state.user)
};

const mutations = {
  setCurrentPhoto(state, payload) {
    state.currentPhoto = payload.photo;
    state.currentPhoto.url = payload.photoUrl;
    log(`set currentPhoto to ${JSON.stringify(state.currentPhoto)}`);
  },
  setFolders(state, folders) {
    state.folders = folders;
    log(`set folders to ${JSON.stringify(folders)}`);
  },
  setPhotos(state, photos) {
    state.photos = photos;
    log(`set photos to ${JSON.stringify(photos)}`);
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
      if (options.sequential) {
        if (state.currentPhoto) {
          photo = state.photos[(state.photos.indexOf(state.currentPhoto) + 1) % state.photos.length];
        } else {
          photo = state.photos[0];
        }
        log(`next sequential photo ${state.currentPhoto && state.currentPhoto.path} => ${photo.path}`);
      } else {
        do {
          photo = state.photos[getRandomInt(0, state.photos.length)];
        } while (state.currentPhoto && state.currentPhoto.path === photo.path);
        log(`next random photo ${state.currentPhoto && state.currentPhoto.path} => ${photo.path}`);
      }
    } else {
      log(`next photo ${options.photo}`);
    }
    return graphService.getPhotoUrl(photo).then(photoUrl => {
      commit("setCurrentPhoto", { photo, photoUrl });
      return Promise.resolve(state.currentPhoto);
    });
  },
  refreshRemoteConfig({ state, commit }) {
    return graphService.getRemoteConfig().then(config => {
      commit("setFolders", config.folders);
      commit("setRemoteRefreshDelay", config.remoteRefreshDelay);
      commit("setSlideshowDelay", config.slideshowDelay);
    });
  }
};

function getLocation(route, photoId) {
  return `?route=${route}` + (route === "slideshow" ? `&photo=${photoId}` : "");
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

export default new Vuex.Store({
  strict: process.env.NODE_ENV !== "production",
  state,
  getters,
  mutations,
  actions,
  plugins: [createPersistedStore({ paths: ["currentPhoto", "currentRoute", "folders"] })]
});
