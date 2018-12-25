import { createLocalVue } from "@vue/test-utils";
import Vuex from "vuex";
import storeConfig from "../store-config";
import cloneDeep from "lodash.clonedeep";
import graphService from "../services/graph.service";

const _log = console.log;
console.log = () => {};

const localVue = createLocalVue();
localVue.use(Vuex);

describe("Store", () => {
  let store;

  describe("refreshRemoteConfig", () => {
    beforeEach(() => {
      const mockedStoreConfig = cloneDeep(storeConfig);
      mockedStoreConfig.actions.getPhotos = jest.fn();
      store = new Vuex.Store(mockedStoreConfig);
    });

    test("user signed out", done => {
      graphService.getRemoteConfig = jest.fn().mockResolvedValue({ folders: ["a"] });
      expect(store.getters.isSignedIn).toEqual(false);
      store.dispatch("refreshRemoteConfig").then(() => {
        expect(store.state.folders).toEqual([]);
        done();
      });
    });

    describe("user signed in", () => {
      beforeEach(() => {
        store.commit("setUser", "user");
        expect(store.getters.isSignedIn).toEqual(true);
      });

      test("folders", done => {
        graphService.getRemoteConfig = jest.fn().mockResolvedValue({ folders: ["a"] });
        store.dispatch("refreshRemoteConfig").then(() => {
          expect(store.state.folders).toEqual(["a"]);
          done();
        });
      });
    });
  });

  describe("getPhotos", () => {
    test("with empty folders", done => {
      const testStore = cloneDeep(storeConfig);
      testStore.state.photos = ["p", "q"];
      store = new Vuex.Store(testStore);
      store.dispatch("getPhotos").then(() => {
        expect(store.state.folders).toEqual([]);
        expect(store.state.photos).toEqual(["p", "q"]);
        done();
      });
    });

    describe("with", () => {
      test("one folder", done => {
        graphService.getPhotoList = jest.fn().mockResolvedValue(["a"]);
        const testStore = cloneDeep(storeConfig);
        testStore.state.folders = ["f"];
        testStore.state.photos = ["p", "q"];
        store = new Vuex.Store(testStore);
        store.dispatch("getPhotos").then(() => {
          expect(store.state.photos).toEqual(["a"]);
          done();
        });
      });
      test("two folders", done => {
        graphService.getPhotoList = jest
          .fn()
          .mockResolvedValueOnce(["a"])
          .mockResolvedValueOnce(["b"]);
        const testStore = cloneDeep(storeConfig);
        testStore.state.folders = ["f", "g"];
        testStore.state.photos = ["p", "q"];
        store = new Vuex.Store(testStore);
        store.dispatch("getPhotos").then(() => {
          expect(store.state.photos).toEqual(["a", "b"]);
          done();
        });
      });
    });
  });
});
