import Vue from "vue";
import Vuex from "vuex";
import createPersistedStore from "vuex-persistedstate";
import graphService from "./services/graph.service";

Vue.use(Vuex);

const state = {
  currentPhoto: null,
  currentRoute: null,
  folders: [],
  isSlideshowRunning: false,
  photos: [],
  remoteRefreshDelay: 10,
  slideshowDelay: 10,
  user: null
};

const getters = {
  isSignedIn: state => {
    return Boolean(state.user);
  }
};

const mutations = {
  setCurrentPhoto(state, payload) {
    state.currentPhoto = payload.photo;
    state.currentPhoto.url = payload.photoUrl;
    console.log(`set currentPhoto to ${JSON.stringify(state.currentPhoto)}`);
  },
  setFolders(state, folders) {
    state.folders = folders;
    console.log(`set folders to ${JSON.stringify(folders)}`);
  },
  setPhotos(state, photos) {
    state.photos = photos;
    console.log(`set photos to ${JSON.stringify(photos)}`);
  },
  setRemoteRefreshDelay(state, delay) {
    if (delay) {
      state.remoteRefreshDelay = delay;
      console.log(`set remoteRefreshDelay to ${delay}`);
    }
  },
  setRoute(state, route) {
    state.currentRoute = route;
    console.log(`set currentRoute to ${route}`);
  },
  setSlideshowDelay(state, delay) {
    if (delay) {
      state.slideshowDelay = delay;
      console.log(`set slideshowDelay to ${delay}`);
    }
  },
  setUser(state, user) {
    state.user = user;
    console.log(`set user to ${JSON.stringify(user)}`);
  },
  toggleSlideshow(state) {
    state.isSlideshowRunning = !state.isSlideshowRunning;
    console.log(`set isSlideshowRunning to ${state.isSlideshowRunning}`);
  }
};

const actions = {
  navigate({ state, commit, dispatch }, options) {
    console.debug(
      `navigate: ${window.location.pathname}${window.location.search} => ${JSON.stringify(options)}`
    );
    if (state.currentRoute !== options.route) {
      commit("setRoute", options.route);
    }
    if (state.photos.length === 0) {
      console.warn("navigate: no photos");
      return;
    }
    let nextPhotoAction = Promise.resolve(state.currentPhoto);
    if (options.route === "/slideshow" && (options.photo !== undefined || state.currentPhoto == null)) {
      nextPhotoAction = dispatch("nextPhoto", options.photo);
    }
    nextPhotoAction.then(currentPhoto => {
      if (options.addToHistory !== false) {
        const newLocation = getLocation(state.currentRoute, currentPhoto && currentPhoto.path);
        if (options.replaceHistory) {
          window.history.replaceState(null, "", newLocation);
        } else {
          window.history.pushState(null, "", newLocation);
        }
      }
      document.title = options.route === "/slideshow" ? currentPhoto && currentPhoto.name : options.route;
    });
  },
  nextPhoto({ state, commit }, newPhoto) {
    if (state.photos.length === 0) {
      console.warn("nextPhoto: no photos");
      return;
    }
    var photo = state.photos.find(p => p.path === newPhoto);
    if (photo === undefined) {
      do {
        photo = state.photos[getRandomInt(0, state.photos.length)];
      } while (state.currentPhoto && state.currentPhoto.path === photo.path);
      console.log(`next random photo ${state.currentPhoto && state.currentPhoto.path} => ${photo.path}`);
    } else {
      console.log(`next photo ${newPhoto}`);
    }
    return graphService.getPhotoUrl(photo.path).then(photoUrl => {
      commit("setCurrentPhoto", { photo, photoUrl });
      return Promise.resolve(state.currentPhoto);
    });
  }
};

function getLocation(route, photo) {
  return route + (route === "/slideshow" ? `?photo=${photo}` : "");
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
  plugins: [createPersistedStore()]
});
