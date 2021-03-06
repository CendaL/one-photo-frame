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
  });

  describe.only("refreshRemoteConfig with manualFolders", () => {
    let mockedStoreConfig;
    let store;

    beforeEach(() => {
      mockedStoreConfig = cloneDeep(storeConfig);
      mockedStoreConfig.state.user = "user";
      mockedStoreConfig.actions.getPhotos = jest.fn();
      const _setFolders = mockedStoreConfig.actions.setFolders;
      mockedStoreConfig.actions.setFolders = jest.fn(_setFolders);
    });

    test("empty", done => {
      store = new Vuex.Store(mockedStoreConfig);
      expect(store.getters.isSignedIn).toEqual(true);
      graphService.getRemoteConfig = jest.fn().mockResolvedValue({ folders: ["a"], foldersUpdated: "2019" });
      store.dispatch("refreshRemoteConfig").then(() => {
        expect(mockedStoreConfig.actions.setFolders).toBeCalledTimes(1);
        expect(store.state.folders).toEqual(["a"]);
        done();
      });
    });

    test("older", done => {
      mockedStoreConfig.state.manualTimestamp = "2018";
      store = new Vuex.Store(mockedStoreConfig);
      expect(store.getters.isSignedIn).toEqual(true);
      graphService.getRemoteConfig = jest.fn().mockResolvedValue({ folders: ["a"], foldersUpdated: "2019" });
      store.dispatch("refreshRemoteConfig").then(() => {
        expect(mockedStoreConfig.actions.setFolders).toBeCalledTimes(1);
        expect(store.state.folders).toEqual(["a"]);
        done();
      });
    });

    test("newer and same folders", done => {
      mockedStoreConfig.state.manualTimestamp = "2020";
      mockedStoreConfig.state.manualFolders = [{ id: "f2020" }];
      mockedStoreConfig.state.folders = ["f2020"];
      store = new Vuex.Store(mockedStoreConfig);
      expect(store.getters.isSignedIn).toEqual(true);
      graphService.getRemoteConfig = jest.fn().mockResolvedValue({ folders: ["a"], foldersUpdated: "2019" });
      store.dispatch("refreshRemoteConfig").then(() => {
        expect(mockedStoreConfig.actions.setFolders).toBeCalledTimes(1);
        expect(mockedStoreConfig.actions.getPhotos).not.toBeCalled();
        expect(store.state.folders).toEqual(["f2020"]);
        done();
      });
    });

    test("newer got cleared", done => {
      mockedStoreConfig.state.manualTimestamp = "2020";
      mockedStoreConfig.state.folders = [];
      store = new Vuex.Store(mockedStoreConfig);
      expect(store.getters.isSignedIn).toEqual(true);
      graphService.getRemoteConfig = jest.fn().mockResolvedValue({ folders: ["a"], foldersUpdated: "2019" });
      store.dispatch("refreshRemoteConfig").then(() => {
        expect(mockedStoreConfig.actions.setFolders).toBeCalledTimes(1);
        expect(store.state.folders).toEqual(["a"]);
        done();
      });
    });
  });

  describe("getPhotos", () => {
    let testStore;
    const sortPhotosMock = jest.fn();
    const shufflePhotosMock = jest.fn();
    const setIsLoadingPhotosMock = jest.fn();
    const showNextPhotoMock = jest.fn();

    beforeEach(() => {
      sortPhotosMock.mockClear();
      shufflePhotosMock.mockClear();
      setIsLoadingPhotosMock.mockClear();
      showNextPhotoMock.mockReset();
      testStore = cloneDeep(storeConfig);
      testStore.mutations.sortPhotos = sortPhotosMock;
      testStore.mutations.shufflePhotos = shufflePhotosMock;
      testStore.mutations.setIsLoadingPhotos = setIsLoadingPhotosMock;
      testStore.actions.showNextPhoto = showNextPhotoMock;
    });

    test("with empty folders", done => {
      testStore.state.photos = ["p", "q"];
      store = new Vuex.Store(testStore);
      expect(store.state.isLoadingPhotos).toEqual(false);
      store.dispatch("getPhotos").then(() => {
        expect(store.state.folders).toEqual([]);
        expect(store.state.photos).toEqual(["p", "q"]);
        expect(sortPhotosMock).not.toBeCalled();
        expect(shufflePhotosMock).not.toBeCalled();
        expect(store.state.isLoadingPhotos).toEqual(false);
        expect(setIsLoadingPhotosMock).not.toBeCalled();
        expect(showNextPhotoMock).not.toBeCalled();
        done();
      });
    });

    test("with empty folders and nextPhotoId", done => {
      testStore.state.photos = ["p", "q"];
      testStore.state.nextPhotoId = "p";
      store = new Vuex.Store(testStore);
      expect(store.state.isLoadingPhotos).toEqual(false);
      store.dispatch("getPhotos").then(() => {
        expect(store.state.folders).toEqual([]);
        expect(store.state.photos).toEqual(["p", "q"]);
        expect(sortPhotosMock).not.toBeCalled();
        expect(shufflePhotosMock).not.toBeCalled();
        expect(store.state.isLoadingPhotos).toEqual(false);
        expect(setIsLoadingPhotosMock).not.toBeCalled();
        expect(showNextPhotoMock).not.toBeCalled();
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
          expect(sortPhotosMock).toBeCalledTimes(1);
          expect(shufflePhotosMock).not.toBeCalled();
          expect(store.state.isLoadingPhotos).toEqual(false);
          expect(setIsLoadingPhotosMock.mock.calls.map(p => p[1])).toEqual([true, false]);
          expect(showNextPhotoMock).toBeCalledTimes(1);
          done();
        });
      });

      test("one folder and nextPhotoId", done => {
        graphService.getPhotoList = jest.fn().mockResolvedValue(["a"]);
        testStore.state.folders = ["f"];
        testStore.state.photos = ["p", "q"];
        testStore.state.nextPhotoId = "a";
        store = new Vuex.Store(testStore);
        store.dispatch("getPhotos").then(() => {
          expect(store.state.photos).toEqual(["a"]);
          expect(sortPhotosMock).toBeCalledTimes(1);
          expect(shufflePhotosMock).not.toBeCalled();
          expect(store.state.isLoadingPhotos).toEqual(false);
          expect(setIsLoadingPhotosMock.mock.calls.map(p => p[1])).toEqual([true, false]);
          expect(showNextPhotoMock).toBeCalledTimes(1);
          done();
        });
      });

      test("two folders", done => {
        graphService.getPhotoList = jest
          .fn()
          .mockResolvedValueOnce(["a"])
          .mockImplementationOnce(() => {
            expect(showNextPhotoMock).toBeCalledTimes(1);
            return Promise.resolve(["b"]);
          });
        testStore.state.folders = ["f", "g"];
        testStore.state.photos = ["p", "q"];
        testStore.state.isNextRandom = true;
        store = new Vuex.Store(testStore);
        store.dispatch("getPhotos").then(() => {
          expect(store.state.photos).toEqual(["a", "b"]);
          expect(sortPhotosMock).not.toBeCalled();
          expect(shufflePhotosMock).toBeCalledTimes(1);
          expect(store.state.isLoadingPhotos).toEqual(false);
          expect(setIsLoadingPhotosMock.mock.calls.map(p => p[1])).toEqual([true, false]);
          expect(showNextPhotoMock).toBeCalledTimes(1);
          done();
        });
      });

      test("two folders with nextPhotoId", done => {
        graphService.getPhotoList = jest
          .fn()
          .mockResolvedValueOnce(["a"])
          .mockImplementationOnce(() => {
            expect(showNextPhotoMock).toBeCalledTimes(0);
            return Promise.resolve(["b"]);
          });
        testStore.state.folders = ["f", "g"];
        testStore.state.photos = ["p", "q"];
        testStore.state.nextPhotoId = "b";
        testStore.state.isNextRandom = true;
        store = new Vuex.Store(testStore);
        store.dispatch("getPhotos").then(() => {
          expect(store.state.photos).toEqual(["a", "b"]);
          expect(sortPhotosMock).not.toBeCalled();
          expect(shufflePhotosMock).toBeCalledTimes(1);
          expect(store.state.isLoadingPhotos).toEqual(false);
          expect(setIsLoadingPhotosMock.mock.calls.map(p => p[1])).toEqual([true, false]);
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
      test("when loading", done => {
        mockedStoreConfig.state.isLoadingPhotos = true;
        mockedStoreConfig.state.nextPhotoId = "p";
        store = new Vuex.Store(mockedStoreConfig);
        store.dispatch("showNextPhoto").then(res => {
          expect(res).toEqual("isLoadingPhotos with nextPhotoId");
          done();
        });
      });

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

      test("p after p", done => {
        mockedStoreConfig.state.nextPhotoId = "p";
        mockedStoreConfig.state.currentPhoto = mockedStoreConfig.state.photos[0];
        graphService.getPhotoUrl = jest.fn();
        store = new Vuex.Store(mockedStoreConfig);
        store.dispatch("showNextPhoto").then(res => {
          expect(res).toEqual("the same photo");
          const expectedPhoto = cloneDeep(mockedStoreConfig.state.photos[0]);
          expect(store.state.currentPhoto).toEqual(expectedPhoto);
          expect(graphService.getPhotoUrl).not.toBeCalled();
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
