import assert = require("assert");
import { JcNodeRpc, NodeRpcFactory } from "jcc_rpc";

export const exchangeInstance = {
  init: (urls: string[]): JcNodeRpc => {
    let inst = NodeRpcFactory.get();
    if (inst === null) {
      inst = NodeRpcFactory.init(urls);
    } else {
      try {
        assert.deepStrictEqual(inst.urls, urls);
      } catch (error) {
        inst.urls = urls;
      }
    }
    return inst;
  },
  destroy: () => {
    NodeRpcFactory.destroy();
  }
};

export const swtcSequence = (() => {
  // sequence cache for address
  const cache: Map<string, number> = new Map();

  /**
   * get sequence
   *
   * the value is from callback function if the cache is empty, otherwise is from memory
   *
   * @param {(...args) => Promise<number>} callback
   * @param {*} args
   * @returns {Promise<number>}
   */
  const get = async (callback: (...args) => Promise<number>, address, ...args): Promise<number> => {
    let sequence = cache.get(address);
    if (sequence === undefined) {
      sequence = await callback.apply(null, [address, ...args]);
      cache.set(address, sequence);
    }
    return sequence;
  };

  /**
   * sequence add 1 for the given address
   *
   */
  const rise = (address: string) => {
    const sequence = cache.get(address);
    if (sequence !== undefined) {
      cache.set(address, sequence + 1);
    }
  };

  /**
   * delete sequence cache for the given address
   *
   */
  const reset = (address: string) => {
    cache.delete(address);
  };

  /**
   * clear cache
   *
   */
  const clear = () => {
    cache.clear();
  };

  return {
    clear,
    get,
    reset,
    rise
  };
})();
