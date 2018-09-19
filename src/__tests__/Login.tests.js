import { shallowMount } from "@vue/test-utils";
import Login from "../Login";

const mockFn = jest.fn().mockReturnValue(42);
const wrapper = shallowMount(Login, {
  computed: {
    isSignedIn: () => false
  },
  methods: {
    setUser: mockFn,
    setStatusText: () => {}
  }
});

// You can access the actual Vue instance via `wrapper.vm`
const vm = wrapper.vm;

// To inspect the wrapper deeper just log it to the console
// and your adventure with the Vue Test Utils begins
test("component", () => {
  console.log(wrapper);
  console.log(wrapper.vm.setUser);
  console.log(mockFn.mock);
});
