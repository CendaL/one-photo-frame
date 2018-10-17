import { createLocalVue, shallowMount } from "@vue/test-utils";
import Vuex from "vuex";
import storeConfig from "../store-config";
import cloneDeep from "lodash.clonedeep";
jest.mock("../utils");
import Shell from "../Shell";

const _log = console.log;
console.log = () => {};

const localVue = createLocalVue();
localVue.use(Vuex);

describe("Shell", () => {
  let store;
  let wrapper;
  const refreshRemoteConfigMock = jest.fn().mockResolvedValue();

  beforeEach(() => {
    jest.useFakeTimers();
    refreshRemoteConfigMock.mockClear();
    store = new Vuex.Store(cloneDeep(storeConfig));
    wrapper = shallowMount(Shell, {
      localVue,
      store,
      methods: {
        refreshRemoteConfig: refreshRemoteConfigMock
      }
    });
  });
  test("mounting sets update remote config task", async () => {
    // https://stackoverflow.com/questions/52177631
    expect(setTimeout).toBeCalledTimes(1);
    expect(setTimeout).lastCalledWith(wrapper.vm.updateRemoteConfig, 10000);
    await Promise.resolve().then(); // allow any pending jobs in the PromiseJobs queue to run
    expect(refreshRemoteConfigMock).not.toBeCalled();
    let taskId = wrapper.vm.refreshRemoteConfigTaskId;
    expect(taskId).toEqual(expect.anything());

    jest.advanceTimersByTime(1000);
    await Promise.resolve().then(); // setTimeout is called in then
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
});
