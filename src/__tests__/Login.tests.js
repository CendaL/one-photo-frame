import { createLocalVue, shallowMount } from "@vue/test-utils";
import Vuex from "vuex";
import storeConfig from "../store-config";
import cloneDeep from "lodash.clonedeep";
jest.mock("../utils");
import { logError } from "../utils";
import Login from "../Login";

const _log = console.log;
console.log = () => {};

const localVue = createLocalVue();
localVue.use(Vuex);

describe("Login", () => {
  let store;
  const refreshRemoteConfigMock = jest.fn();
  const setStatusTextMock = jest.fn();

  beforeEach(() => {
    refreshRemoteConfigMock.mockReset();
    setStatusTextMock.mockReset();
    store = new Vuex.Store(cloneDeep(storeConfig));
    shallowMount(Login, {
      localVue,
      store,
      methods: {
        setUser: () => {},
        setStatusText: setStatusTextMock,
        refreshRemoteConfig: refreshRemoteConfigMock
      }
    });
  });

  test.only("flow", done => {
    const expectedStatus = [["nepřihlášený uživatel"]];
    const expectedRefresh = [];
    refreshRemoteConfigMock.mockResolvedValue("pass");
    expect(setStatusTextMock.mock.calls).toEqual(expectedStatus);
    expect(refreshRemoteConfigMock.mock.calls).toEqual(expectedRefresh);

    store.commit("setUser", "user");
    expectedStatus.push([""]);
    expectedRefresh.push([]);
    expect(setStatusTextMock.mock.calls).toEqual(expectedStatus);
    expect(refreshRemoteConfigMock.mock.calls).toEqual(expectedRefresh);

    process.nextTick(() => {
      store.commit("setUser", null);
      expectedStatus.push(["nepřihlášený uživatel"]);
      expect(setStatusTextMock.mock.calls).toEqual(expectedStatus);
      expect(refreshRemoteConfigMock.mock.calls).toEqual(expectedRefresh);

      process.nextTick(() => {
        expect(logError).toHaveBeenCalledTimes(0);
        done();
      });
    });
  });

  test("flow fail refresh remote config", done => {
    refreshRemoteConfigMock.mockRejectedValueOnce("x");
    expect(refreshRemoteConfigMock.mock.calls).toEqual([]);

    store.commit("setUser", "user");
    expect(refreshRemoteConfigMock.mock.calls).toEqual([[]]);

    process.nextTick(() => {
      expect(logError.mock.calls).toEqual([["refreshRemoteConfig error: x"]]);
      done();
    });
  });
});
