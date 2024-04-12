# react-dedup-async

https://www.npmjs.com/package/react-dedup-async

React hook to dedup calls to an async callback.

Calls which are overriden resolve to the next 'winning' call's result.

```ts
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
```
