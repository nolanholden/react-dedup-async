import { useRef } from "react";

/**
 * React hook to dedupe async calls. The latest args wins.
 *
 * If idle, it runs the args on the latest callback immediately, returning the promise.
 * If busy, it returns a promise that resolves to the next latest call, ignoring all intermediate calls.
 */
export function useDedupedAsyncCallback<P extends unknown[], R>(
  fn: (...args: P) => Promise<R>
) {
  const f = useLatestRef(fn);

  let p: Promise<R> | null = null;
  let latest: P;
  return useRef(function wrapper(...args: P): Promise<R> {
    latest = args;
    return p
      ? p.then(() => p ?? wrapper(...latest))
      : (p = f.current(...latest).finally(() => (p = null)));
  }).current;
}

/**
 * React hook to dedupe async calls. Calls while busy are ignored.
 *
 * If busy, it returns the active promise.
 */
export function useDedupedAsyncCallbackIgnoreWhileBusy<P extends unknown[], R>(
  fn: (...args: P) => Promise<R>
) {
  const f = useLatestRef(fn);
  let p: Promise<R> | null = null;
  return useRef(
    (...args: P) => p ?? (p = f.current(...args).finally(() => (p = null)))
  ).current;
}

function useLatestRef<T>(value: T) {
  const r = useRef(value);
  r.current = value;
  return r;
}
