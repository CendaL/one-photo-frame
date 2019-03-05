import { createLocalVue, shallowMount } from "@vue/test-utils";
import Vuex from "vuex";
import storeConfig from "../store-config";
import cloneDeep from "lodash.clonedeep";
jest.mock("../utils");
import { logError } from "../utils";
import Login from "../Login";

console.log = () => {};

const localVue = createLocalVue();
localVue.use(Vuex);

describe("Login", () => {
  let store;
  const setStatusTextMock = jest.fn();

  beforeEach(() => {
    setStatusTextMock.mockReset();
    store = new Vuex.Store(cloneDeep(storeConfig));
    shallowMount(Login, {
      localVue,
      store,
      methods: {
        setUser: () => {},
        setStatusText: setStatusTextMock,
      }
    });
  });

  test("flow", done => {
    const expectedStatus = [["nepřihlášený uživatel"]];
    expect(setStatusTextMock.mock.calls).toEqual(expectedStatus);

    store.commit("setUser", "user");
    expectedStatus.push([""]);
    expect(setStatusTextMock.mock.calls).toEqual(expectedStatus);

    process.nextTick(() => {
      store.commit("setUser", null);
      expectedStatus.push(["nepřihlášený uživatel"]);
      expect(setStatusTextMock.mock.calls).toEqual(expectedStatus);

      process.nextTick(() => {
        expect(logError).toHaveBeenCalledTimes(0);
        done();
      });
    });
  });
});
