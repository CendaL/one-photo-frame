import { createLocalVue } from "@vue/test-utils";
import Vuex from "vuex";
import storeConfig from "../store-config";
import cloneDeep from "lodash.clonedeep";
import graphService from "../services/graph.service";

const _log = console.log;
// console.log = () => {};

const localVue = createLocalVue();
localVue.use(Vuex);

describe("Store", () => {
  let store;

  beforeEach(() => {
    store = new Vuex.Store(cloneDeep(storeConfig));
  });

  describe("refreshRemoteConfig", () => {
    test("user signed out", done => {
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
});
