import { describe, expect, it, vi } from 'vitest';

import throttler from './throttler';

type Deferred<T> = {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (reason?: unknown) => void;
};

function createDeferred<T>(): Deferred<T> {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;

  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
}

async function flushMicrotasks() {
  await Promise.resolve();
  await Promise.resolve();
}

describe('throttler', () => {
  it('forwards fetch arguments', async () => {
    const response = new Response('ok');
    const fetch = vi.fn(async () => response);
    const limitedFetch = throttler(fetch as unknown as typeof global.fetch, 2);
    const init = { method: 'POST' };

    await limitedFetch('https://example.com/api', init);

    expect(fetch).toHaveBeenCalledWith('https://example.com/api', init);
  });

  it('resolves with the same fetch response', async () => {
    const response = new Response('ok');
    const fetch = vi.fn(async () => response);
    const limitedFetch = throttler(fetch as unknown as typeof global.fetch, 2);

    await expect(limitedFetch('https://example.com')).resolves.toBe(response);
  });

  it('propagates fetch rejection', async () => {
    const error = new Error('boom');
    const fetch = vi.fn(async () => Promise.reject(error));
    const limitedFetch = throttler(fetch as unknown as typeof global.fetch, 2);

    await expect(limitedFetch('https://example.com')).rejects.toBe(error);
  });

  it('enforces maximum concurrency', async () => {
    let active = 0;
    let maxActive = 0;
    const deferreds: Array<Deferred<Response>> = [];

    const fetch = vi.fn(() => {
      active++;
      maxActive = Math.max(maxActive, active);

      const deferred = createDeferred<Response>();
      deferreds.push(deferred);

      return deferred.promise.finally(() => {
        active--;
      });
    });

    const limitedFetch = throttler(fetch as unknown as typeof global.fetch, 2);
    const requests = [
      limitedFetch('https://example.com/1'),
      limitedFetch('https://example.com/2'),
      limitedFetch('https://example.com/3'),
      limitedFetch('https://example.com/4'),
      limitedFetch('https://example.com/5')
    ];

    await flushMicrotasks();
    expect(fetch).toHaveBeenCalledTimes(2);

    deferreds[0].resolve(new Response('1'));
    deferreds[1].resolve(new Response('2'));

    await vi.waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(4);
    });

    deferreds[2].resolve(new Response('3'));
    deferreds[3].resolve(new Response('4'));

    await vi.waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(5);
    });

    deferreds[4].resolve(new Response('5'));

    await Promise.all(requests);
    expect(maxActive).toBe(2);
  });

  it('queues calls and runs them when slots free up', async () => {
    const deferreds: Array<Deferred<Response>> = [];
    const fetch = vi.fn(() => {
      const deferred = createDeferred<Response>();
      deferreds.push(deferred);
      return deferred.promise;
    });

    const limitedFetch = throttler(fetch as unknown as typeof global.fetch, 1);
    const request1 = limitedFetch('https://example.com/1');
    const request2 = limitedFetch('https://example.com/2');
    const request3 = limitedFetch('https://example.com/3');

    await flushMicrotasks();
    expect(fetch).toHaveBeenCalledTimes(1);

    deferreds[0].resolve(new Response('1'));
    await vi.waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(2);
    });

    deferreds[1].resolve(new Response('2'));
    await vi.waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(3);
    });

    deferreds[2].resolve(new Response('3'));

    await Promise.all([request1, request2, request3]);
  });

  it('continues draining queue after a rejection', async () => {
    const deferreds: Array<Deferred<Response>> = [];
    const fetch = vi.fn(() => {
      const deferred = createDeferred<Response>();
      deferreds.push(deferred);
      return deferred.promise;
    });

    const limitedFetch = throttler(fetch as unknown as typeof global.fetch, 2);
    const error = new Error('first failed');

    const request1 = limitedFetch('https://example.com/1');
    void request1.catch(() => undefined);
    const request2 = limitedFetch('https://example.com/2');
    const request3 = limitedFetch('https://example.com/3');
    const request4 = limitedFetch('https://example.com/4');

    await flushMicrotasks();
    expect(fetch).toHaveBeenCalledTimes(2);

    deferreds[0].reject(error);
    deferreds[1].resolve(new Response('2'));

    await flushMicrotasks();
    expect(fetch).toHaveBeenCalledTimes(4);

    deferreds[2].resolve(new Response('3'));
    deferreds[3].resolve(new Response('4'));

    await expect(request1).rejects.toBe(error);
    await expect(request2).resolves.toBeInstanceOf(Response);
    await expect(request3).resolves.toBeInstanceOf(Response);
    await expect(request4).resolves.toBeInstanceOf(Response);
  });

  it('throws when limit is invalid', () => {
    const fetch = vi.fn(async () => new Response('ok'));

    expect(() => throttler(fetch as unknown as typeof global.fetch, 0)).toThrow();
  });
});
