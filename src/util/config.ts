import { IChainConfig, ISupportChain } from "../types";

export const chainConfig = (() => {
  const defaultConfigs = {
    jingtum: {
      nativeToken: "SWT",
      minGas: 10
    },
    bizain: {
      nativeToken: "BWT",
      minGas: 10
    },
    seaaps: {
      nativeToken: "SEAA",
      minGas: 10000
    }
  };

  let defaultChain: ISupportChain = "jingtum";

  /**
   * get default config
   *
   * @returns {IChainConfig}
   */
  const getDefaultConfig = (): IChainConfig => {
    return defaultConfigs[defaultChain];
  };

  /**
   * set default chain
   *
   * @param {ISupportChain} chain
   */
  const setDefaultChain = (chain: ISupportChain) => {
    defaultChain = chain;
  };

  return {
    getDefaultConfig,
    setDefaultChain
  };
})();
