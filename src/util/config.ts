import { IChainConfig, ISupportChain } from "../types";

export const chainConfig = (() => {
  const defaultConfigs = {
    bizain: {
      minGas: 10,
      nativeToken: "BWT"
    },
    jingtum: {
      minGas: 10,
      nativeToken: "SWT"
    },
    seaaps: {
      minGas: 10000,
      nativeToken: "SEAA"
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
