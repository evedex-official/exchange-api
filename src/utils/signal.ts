export type Listener<T> = (data: T) => unknown;

export interface SignalMarker {
  __isSignal: true;
}

export const SignalSkipAll = Symbol("Skip all listeners");

export interface Signal<T> extends SignalMarker {
  (dataOrListener: T | Listener<T> | typeof SignalSkipAll): unknown;
}

export function signal<T>(listener?: Listener<T>): Signal<T> {
  let listeners = listener ? [listener] : [];

  const fn: Signal<T> = (dataOrListener) => {
    if (dataOrListener === SignalSkipAll) {
      listeners = [];
      return;
    }

    if (typeof dataOrListener === "function") {
      const n = listeners.push(dataOrListener as Listener<T>);
      if (n >= 10) {
        console.debug("Too many signal listeners", new Error().stack);
      }

      return n;
    }

    return listeners.forEach((currentListener) => currentListener(dataOrListener));
  };

  fn.__isSignal = true;

  return fn;
}
