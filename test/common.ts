import type { Signal } from "../src/utils";
export * as src from "../src";
export { default as config } from "./config";

export class WaitSignalTimeoutError extends Error {}

export interface WaitSignalOptions {
  timeout?: number;
}

export function waitSignal<T>(signal: Signal<T>, options: WaitSignalOptions = {}) {
  const timeout = options.timeout ?? 2000;

  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new WaitSignalTimeoutError()), timeout);
    signal((data) => {
      clearTimeout(timer);
      resolve(data);
    });
  });
}
