import Vue from "vue";
import Vuex from "vuex";
import createPersistedStore from "vuex-persistedstate";

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
  nextPhoto(state, newPhoto) {
    if (state.photos.length === 0) {
      console.log("no photos");
      return;
    }
    var photo = state.photos.find(p => p.path === escape(newPhoto));
    if (photo === undefined) {
      do {
        photo = state.photos[getRandomInt(0, state.photos.length)];
      } while (state.currentPhoto === photo.path);
      console.log(`next random photo ${state.currentPhoto} => ${photo.path}`);
    } else {
      console.log(`next photo ${newPhoto}`);
    }
    state.currentPhoto = photo.path;
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
  navigate({ state, commit }, options) {
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
    if (options.route === "/slideshow" && (options.photo !== undefined || state.currentPhoto == null)) {
      commit("nextPhoto", options.photo);
    }
    if (options.addToHistory !== false) {
      const newLocation = getLocation(state.currentRoute, state.currentPhoto);
      if (options.replaceHistory) {
        window.history.replaceState(null, "", newLocation);
      } else {
        window.history.pushState(null, "", newLocation);
      }
    }
    document.title = options.route === "/slideshow" ? state.currentPhoto : options.route;
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
