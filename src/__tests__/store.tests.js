import { createLocalVue } from "@vue/test-utils";
import Vuex from "vuex";
import storeConfig from "../store-config";
import cloneDeep from "lodash.clonedeep";
import graphService from "../services/graph.service";

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
    let testStore;
    const sortPhotosMock = jest.fn();
    const shufflePhotosMock = jest.fn();
    const setLoadingPhotosMock = jest.fn();

    beforeEach(() => {
      sortPhotosMock.mockClear();
      shufflePhotosMock.mockClear();
      setLoadingPhotosMock.mockClear();
      testStore = cloneDeep(storeConfig);
      testStore.mutations.sortPhotos = sortPhotosMock;
      testStore.mutations.shufflePhotos = shufflePhotosMock;
      testStore.mutations.setLoadingPhotos = setLoadingPhotosMock;
    });

    test("with empty folders", done => {
      testStore.state.photos = ["p", "q"];
      store = new Vuex.Store(testStore);
      expect(store.state.loadingPhotos).toEqual(false);
      store.dispatch("getPhotos").then(() => {
        expect(store.state.folders).toEqual([]);
        expect(store.state.photos).toEqual(["p", "q"]);
        expect(sortPhotosMock).toBeCalledTimes(1);
        expect(shufflePhotosMock).not.toBeCalled();
        expect(store.state.loadingPhotos).toEqual(false);
        expect(setLoadingPhotosMock.mock.calls.map(p => p[1])).toEqual([true, false]);
        done();
      });
    });

    describe("with", () => {
      test("one folder", done => {
        graphService.getPhotoList = jest.fn().mockResolvedValue(["a"]);
        testStore.state.folders = ["f"];
        testStore.state.photos = ["p", "q"];
        store = new Vuex.Store(testStore);
        store.dispatch("getPhotos").then(() => {
          expect(store.state.photos).toEqual(["a"]);
          expect(sortPhotosMock).toBeCalledTimes(2);
          expect(shufflePhotosMock).not.toBeCalled();
          expect(store.state.loadingPhotos).toEqual(false);
          expect(setLoadingPhotosMock.mock.calls.map(p => p[1])).toEqual([true, false]);
          done();
        });
      });
      test("two folders", done => {
        graphService.getPhotoList = jest
          .fn()
          .mockResolvedValueOnce(["a"])
          .mockResolvedValueOnce(["b"]);
        testStore.state.folders = ["f", "g"];
        testStore.state.photos = ["p", "q"];
        testStore.state.isNextRandom = true;
        store = new Vuex.Store(testStore);
        store.dispatch("getPhotos").then(() => {
          expect(store.state.photos).toEqual(["a", "b"]);
          expect(sortPhotosMock).not.toBeCalled();
          expect(shufflePhotosMock).toBeCalledTimes(2);
          expect(store.state.loadingPhotos).toEqual(false);
          expect(setLoadingPhotosMock.mock.calls.map(p => p[1])).toEqual([true, false]);
          done();
        });
      });
    });
  });
});
