import { createLocalVue, shallowMount } from "@vue/test-utils";
import Vuex from "vuex";
import storeConfig from "../store-config";
import cloneDeep from "lodash.clonedeep";
jest.mock("../utils");
import Shell from "../Shell";

console.log = () => {};

const localVue = createLocalVue();
localVue.use(Vuex);

describe("Shell", () => {
  let store;
  let wrapper;
  const refreshRemoteConfigMock = jest.fn().mockResolvedValue();

  function createWrapper() {
    return shallowMount(Shell, {
      localVue,
      store,
      methods: {
        refreshRemoteConfig: refreshRemoteConfigMock
      }
    });
  }

  beforeEach(() => {
    jest.useFakeTimers();
    refreshRemoteConfigMock.mockClear();
    var s = cloneDeep(storeConfig);
    // find better way
    s.state.currentRoute = "settings";
    store = new Vuex.Store(s);
  });

  test("mounting sets update remote config task", async () => {
    wrapper = createWrapper();
    // https://stackoverflow.com/questions/52177631
    await Promise.resolve().then(); // setTimeout is called in then

    expect(store.state.remoteRefreshDelay).toBe(10);
    expect(store.getters.isSignedIn).toBe(false);
    expect(setTimeout).toBeCalledTimes(1);
    expect(setTimeout).lastCalledWith(wrapper.vm.updateRemoteConfig, 10000);
    await Promise.resolve().then(); // allow any pending jobs in the PromiseJobs queue to run
    expect(refreshRemoteConfigMock).not.toBeCalled();
    let taskId = wrapper.vm.refreshRemoteConfigTaskId;
    expect(taskId).toEqual(expect.anything());

    jest.advanceTimersByTime(1000);
    await Promise.resolve().then();
    expect(setTimeout).toBeCalledTimes(1);
    expect(refreshRemoteConfigMock).not.toBeCalled();
    expect(wrapper.vm.refreshRemoteConfigTaskId).toEqual(taskId);

    jest.advanceTimersByTime(9000);
    await Promise.resolve().then();
    expect(setTimeout).toBeCalledTimes(2);
    expect(setTimeout).lastCalledWith(wrapper.vm.updateRemoteConfig, 10000);
    expect(refreshRemoteConfigMock).toBeCalledTimes(1);
    expect(wrapper.vm.refreshRemoteConfigTaskId).not.toEqual(taskId);
  });

  test("mount signed in user", async () => {
    store.commit("setUser", "user");
    wrapper = createWrapper();
    await Promise.resolve().then();

    expect(store.getters.isSignedIn).toBe(true);
    expect(setTimeout).toBeCalledTimes(1);
    expect(setTimeout).lastCalledWith(wrapper.vm.updateRemoteConfig, 10000);
    await Promise.resolve().then();
    expect(refreshRemoteConfigMock).not.toBeCalled();
    let taskId = wrapper.vm.refreshRemoteConfigTaskId;
    expect(taskId).toEqual(expect.anything());
  });

  test("mount and sign in", async () => {
    wrapper = createWrapper();
    await Promise.resolve().then();

    expect(store.getters.isSignedIn).toBe(false);
    expect(setTimeout).toBeCalledTimes(1);
    expect(setTimeout).lastCalledWith(wrapper.vm.updateRemoteConfig, 10000);
    await Promise.resolve().then();
    expect(refreshRemoteConfigMock).not.toBeCalled();
    let taskId = wrapper.vm.refreshRemoteConfigTaskId;
    expect(taskId).toEqual(expect.anything());

    store.commit("setUser", "user");
    expect(store.getters.isSignedIn).toBe(true);
    await Promise.resolve().then();
    expect(setTimeout).toBeCalledTimes(2);
    expect(setTimeout).lastCalledWith(wrapper.vm.updateRemoteConfig, 10000);
    expect(refreshRemoteConfigMock).toBeCalledTimes(1);
    expect(wrapper.vm.refreshRemoteConfigTaskId).not.toEqual(taskId);
  });
});
