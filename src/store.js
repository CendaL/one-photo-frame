import Vue from "vue";
import Vuex from "vuex";
import createPersistedStore from "vuex-persistedstate";
import graphService from "./services/graph.service";

Vue.use(Vuex);

const state = {
  currentPhoto: null,
  currentRoute: null,
  isSlideshowRunning: false,
  photos: [],
  slideshowDelay: 3,
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
  },
  setPhotos(state, photos) {
    state.photos = photos;
  },
  setRoute(state, route) {
    state.currentRoute = route;
  },
  setUser(state, user) {
    state.user = user;
  },
  toggleSlideshow(state) {
    state.isSlideshowRunning = !state.isSlideshowRunning;
  }
};

const actions = {
  navigate({ state, commit, dispatch }, options) {
    console.log(
      "navigate " + window.location.pathname + window.location.search + " => " + JSON.stringify(options)
    );
    if (state.currentRoute !== options.route) {
      commit("setRoute", options.route);
    }
    if (state.photos.length === 0) {
      console.log("no photos to navigate");
      return;
    }
    let nextPhotoAction = Promise.resolve();
    if (options.route === "/slideshow" && (options.photo !== undefined || state.currentPhoto == null)) {
      nextPhotoAction = dispatch("nextPhoto", options.photo);
    }
    nextPhotoAction.then(() => {
      if (options.addToHistory !== false) {
        const newLocation = getLocation(state.currentRoute, state.currentPhoto && state.currentPhoto.path);
        if (options.replaceHistory) {
          window.history.replaceState(null, "", newLocation);
        } else {
          window.history.pushState(null, "", newLocation);
        }
      }
      document.title =
        options.route === "/slideshow" ? state.currentPhoto && state.currentPhoto.name : options.route;
    });
  },
  nextPhoto({ state, commit }, newPhoto) {
    if (state.photos.length === 0) {
      console.log("no photos");
      return;
    }
    var photo = state.photos.find(p => p.path === escape(newPhoto));
    if (photo === undefined) {
      do {
        photo = state.photos[getRandomInt(0, state.photos.length)];
      } while (state.currentPhoto && state.currentPhoto.path === photo.path);
      console.log(`next random photo ${state.currentPhoto && state.currentPhoto.path} => ${photo.path}`);
    } else {
      console.log(`next photo ${newPhoto}`);
    }
    graphService
      .getPhotoUrl(photo.path)
      .then(photoUrl => {
        console.log(`photo url: ${photoUrl}`);
        commit("setCurrentPhoto", { photo, photoUrl });
      })
      .catch(e => console.error(e));
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
