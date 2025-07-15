/**
 * Mock implementation of @raycast/utils for testing
 */

export const useCachedState = jest.fn((key: string, initialValue: any) => [
  initialValue,
  jest.fn(),
  jest.fn()
]);

export const useCachedPromise = jest.fn((fn: Function, deps?: any[]) => ({
  data: undefined,
  error: undefined,
  isLoading: false,
  mutate: jest.fn(),
  revalidate: jest.fn()
}));

export const usePromise = jest.fn((fn: Function, deps?: any[]) => ({
  data: undefined,
  error: undefined,
  isLoading: false,
  mutate: jest.fn(),
  revalidate: jest.fn()
}));

export const useFetch = jest.fn((url: string, options?: any) => ({
  data: undefined,
  error: undefined,
  isLoading: false,
  mutate: jest.fn(),
  revalidate: jest.fn()
}));

export const useLocalStorage = jest.fn((key: string, initialValue: any) => [
  initialValue,
  jest.fn(),
  jest.fn()
]);

export const showFailureToast = jest.fn();
export const showSuccessToast = jest.fn();

export default {
  useCachedState,
  useCachedPromise,
  usePromise,
  useFetch,
  useLocalStorage,
  showFailureToast,
  showSuccessToast
};
