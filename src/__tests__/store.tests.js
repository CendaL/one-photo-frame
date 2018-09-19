import { createLocalVue } from "@vue/test-utils";
import Vuex from "vuex";
import storeConfig from "../store-config";
import cloneDeep from "lodash.clonedeep";

describe("refreshRemoteConfg", () => {
  test("neco", () => {
    const localVue = createLocalVue();
    localVue.use(Vuex);
    const store = new Vuex.Store(cloneDeep(storeConfig));
    expect(store.state.currentPhoto).toBe(null);
    expect(store.state.currentRoute).toBe(null);
  });
});
