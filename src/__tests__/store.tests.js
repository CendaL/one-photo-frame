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
    const showNextPhotoMock = jest.fn();

    beforeEach(() => {
      sortPhotosMock.mockClear();
      shufflePhotosMock.mockClear();
      setLoadingPhotosMock.mockClear();
      showNextPhotoMock.mockClear();
      testStore = cloneDeep(storeConfig);
      testStore.mutations.sortPhotos = sortPhotosMock;
      testStore.mutations.shufflePhotos = shufflePhotosMock;
      testStore.mutations.setLoadingPhotos = setLoadingPhotosMock;
      testStore.actions.showNextPhoto = showNextPhotoMock;
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
        expect(showNextPhotoMock).toBeCalledTimes(1);
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
          expect(showNextPhotoMock).toBeCalledTimes(1);
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
          expect(showNextPhotoMock).toBeCalledTimes(1);
          done();
        });
      });
    });
  });

  const dummyPhoto = id => {
    return { id, name: id, path: id };
  };

  describe("showNextPhoto", () => {
    let mockedStoreConfig;
    const mockedShufflePhotos = jest.fn();

    beforeEach(() => {
      mockedStoreConfig = cloneDeep(storeConfig);
      mockedStoreConfig.state.photos = [dummyPhoto("p"), dummyPhoto("q"), dummyPhoto("r")];
      mockedShufflePhotos.mockClear();
      mockedStoreConfig.mutations.shufflePhotos = mockedShufflePhotos;
    });

    test("third after second", done => {
      mockedStoreConfig.state.currentPhoto = mockedStoreConfig.state.photos[1];
      graphService.getPhotoUrl = jest.fn().mockResolvedValue("r_url");
      store = new Vuex.Store(mockedStoreConfig);
      store.dispatch("showNextPhoto").then(() => {
        const expectedPhoto = cloneDeep(mockedStoreConfig.state.photos[2]);
        expectedPhoto.url = "r_url";
        expect(store.state.currentPhoto).toEqual(expectedPhoto);
        expect(mockedShufflePhotos).not.toBeCalled();
        done();
      });
    });

    test("first after last", done => {
      mockedStoreConfig.state.currentPhoto = mockedStoreConfig.state.photos[2];
      graphService.getPhotoUrl = jest.fn().mockResolvedValue("p_url");
      store = new Vuex.Store(mockedStoreConfig);
      store.dispatch("showNextPhoto").then(() => {
        const expectedPhoto = cloneDeep(mockedStoreConfig.state.photos[0]);
        expectedPhoto.url = "p_url";
        expect(store.state.currentPhoto).toEqual(expectedPhoto);
        expect(mockedShufflePhotos).not.toBeCalled();
        done();
      });
    });

    test("first after last shuffled", done => {
      mockedStoreConfig.state.isNextRandom = true;
      mockedStoreConfig.state.currentPhoto = mockedStoreConfig.state.photos[2];
      graphService.getPhotoUrl = jest.fn().mockResolvedValue("p_url");
      store = new Vuex.Store(mockedStoreConfig);
      store.dispatch("showNextPhoto").then(() => {
        const expectedPhoto = cloneDeep(mockedStoreConfig.state.photos[0]);
        expectedPhoto.url = "p_url";
        expect(store.state.currentPhoto).toEqual(expectedPhoto);
        expect(mockedShufflePhotos).toBeCalledTimes(1);
        done();
      });
    });

    describe("with nextPhotoId", () => {
      test("p after second", done => {
        mockedStoreConfig.state.nextPhotoId = "p";
        mockedStoreConfig.state.currentPhoto = mockedStoreConfig.state.photos[1];
        graphService.getPhotoUrl = jest.fn().mockResolvedValue("p_url");
        store = new Vuex.Store(mockedStoreConfig);
        store.dispatch("showNextPhoto").then(() => {
          const expectedPhoto = cloneDeep(mockedStoreConfig.state.photos[0]);
          expectedPhoto.url = "p_url";
          expect(store.state.currentPhoto).toEqual(expectedPhoto);
          expect(mockedShufflePhotos).not.toBeCalled();
          expect(store.state.nextPhotoId).toEqual(null);
          done();
        });
      });

      test("third after second for non-existing nextPhotoId", done => {
        mockedStoreConfig.state.nextPhotoId = "s";
        mockedStoreConfig.state.currentPhoto = mockedStoreConfig.state.photos[1];
        graphService.getPhotoUrl = jest.fn().mockResolvedValue("r_url");
        store = new Vuex.Store(mockedStoreConfig);
        store.dispatch("showNextPhoto").then(() => {
          const expectedPhoto = cloneDeep(mockedStoreConfig.state.photos[2]);
          expectedPhoto.url = "r_url";
          expect(store.state.currentPhoto).toEqual(expectedPhoto);
          expect(mockedShufflePhotos).not.toBeCalled();
          expect(store.state.nextPhotoId).toEqual(null);
          done();
        });
      });
    });
  });
});
