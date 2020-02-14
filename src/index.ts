/**
 * MIT License
 * Copyright (c) 2018 JCC Dex
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
/**
 * @author https://github.com/GinMu
 */

import * as jingtumSignTx from "jcc_jingtum_lib/src/local_sign";
import { serializeBrokerage, serializeCancelOrder, serializeCreateOrder, serializePayment } from "./tx";
import { ExchangeType, IBrokerageExchange, ICancelExchange, ICreateExchange, IMemo, IPayExchange, ISupportChain } from "./types";
import { exchangeInstance, swtcSequence } from "./util";
import { chainConfig } from "./util/config";
class JCCExchange {
  private static urls: string[];
  private static retry: number;

  /**
   * init value of urls and retry
   *
   * @static
   * @param {string[]} urls
   * @param {number} [retry]  default 3
   * @memberof JCCExchange
   */
  public static init(urls: string[], retry?: number): void;
  /**
   * init value of hosts、port、https & retry
   *
   * @static
   * @param {string[]} hosts
   * @param {(number | string)} port
   * @param {boolean} https
   * @param {number} [retry] default 3
   * @memberof JCCExchange
   */
  public static init(hosts: string[], port: number | string, https: boolean, retry?: number): void;
  public static init(...args: any[]): void {
    let urls: string[];
    let retry: number;
    const len = args.length;
    if (len === 2 || len === 1) {
      urls = args[0];
      retry = args[1];
    } else if (len === 4 || len === 3) {
      const hosts = args[0];
      const port = args[1];
      const https = args[2];
      retry = args[3];
      urls = hosts.map((host) => (https ? `https://${host}:${port}` : `http://${host}:${port}`));
    } else {
      throw new Error("arguments does not match");
    }
    JCCExchange.urls = urls;
    JCCExchange.retry = retry || 3;
  }

  /**
   * destroy instance of jc exchange
   *
   * @static
   * @memberof JCCExchange
   */
  public static destroy() {
    exchangeInstance.destroy();
  }

  /**
   * set default chain
   *
   * @static
   * @param {ISupportChain} chain
   * @memberof JCCExchange
   */
  public static setDefaultChain(chain: ISupportChain) {
    chainConfig.setDefaultChain(chain);
  }

  /**
   * request sequence
   *
   * @static
   * @param {string} address
   * @returns {Promise<number>}
   * @memberof JCCExchange
   */
  public static async getSequence(address: string): Promise<number> {
    const inst = exchangeInstance.init(JCCExchange.urls);
    const sequence = await inst.getSequence(address);
    return sequence;
  }

  /**
   * create order
   *
   * @static
   * @param {string} address address of your jingtum wallet
   * @param {string} secret secret of your jingtum wallet
   * @param {string} amount amount of order
   * @param {string} base token name, if the transaction pair is jjcc-swt, the value of base is "jjcc"
   * @param {string} counter token name, if the transaction pair is jjcc-swt, the value of counter is "swt"
   * @param {string} sum the value is the amount multiplied by price
   * @param {ExchangeType} type the value is "buy" or "sell"
   * @param {string} platform platform address
   * @param {string} [issuer="jGa9J9TkqtBcUoHe2zqhVFFbgUVED6o9or"] issuer address of token, the default address is "jGa9J9TkqtBcUoHe2zqhVFFbgUVED6o9or"
   * @returns {Promise<string>} resolve hash if create success
   * @memberof JCCExchange
   */
  public static createOrder(address: string, secret: string, amount: string, base: string, counter: string, sum: string, type: ExchangeType, platform: string, issuer = "jGa9J9TkqtBcUoHe2zqhVFFbgUVED6o9or"): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        const tx = serializeCreateOrder(address, amount, base, counter, sum, type, platform, issuer);
        const inst = exchangeInstance.init(JCCExchange.urls);
        const hash = await JCCExchange.submit(secret, tx, inst.createOrder.bind(inst));
        swtcSequence.rise(address);
        return resolve(hash);
      } catch (error) {
        swtcSequence.reset(address);
        return reject(error);
      }
    });
  }

  /**
   * cancel order
   *
   * @static
   * @param {string} address address of your jingtum wallet
   * @param {string} secret secret of your jingtum wallet
   * @param {number} offerSequence sequence of order
   * @returns {Promise<string>} resolve hash if cancel success
   * @memberof JCCExchange
   */
  public static cancelOrder(address: string, secret: string, offerSequence: number): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        const tx = serializeCancelOrder(address, offerSequence);
        const inst = exchangeInstance.init(JCCExchange.urls);
        const hash = await JCCExchange.submit(secret, tx, inst.cancelOrder.bind(inst));
        swtcSequence.rise(address);
        return resolve(hash);
      } catch (error) {
        swtcSequence.reset(address);
        return reject(error);
      }
    });
  }

  /**
   * transfer token
   *
   * @static
   * @param {string} address address of your jingtum wallet
   * @param {string} secret secret of your jingtum wallet
   * @param {string} amount transfer amount
   * @param {(string | IMemo[])} memo transfer memo
   * @param {string} to destination address of jingtum wallet
   * @param {string} token token name of transfer
   * @param {string} [issuer="jGa9J9TkqtBcUoHe2zqhVFFbgUVED6o9or"] issuer address of token, the default address is "jGa9J9TkqtBcUoHe2zqhVFFbgUVED6o9or"
   * @returns {Promise<string>} resolve hash if transfer success
   * @memberof JCCExchange
   */
  public static transfer(address: string, secret: string, amount: string, memo: string | IMemo[], to: string, token: string, issuer = "jGa9J9TkqtBcUoHe2zqhVFFbgUVED6o9or"): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        const tx = serializePayment(address, amount, to, token, memo, issuer);
        const inst = exchangeInstance.init(JCCExchange.urls);
        const hash = await JCCExchange.submit(secret, tx, inst.transfer.bind(inst));
        swtcSequence.rise(address);
        return resolve(hash);
      } catch (error) {
        swtcSequence.reset(address);
        return reject(error);
      }
    });
  }

  /**
   * set brokerage
   *
   * @static
   * @param {string} platformAccount platform wallet address
   * @param {string} platformSecret platform wallet secret
   * @param {string} feeAccount fee wallet address
   * @param {number} rateNum fee numerator
   * @param {number} rateDen fee denominator
   * @param {string} token token name of transfer
   * @param {string} [issuer="jGa9J9TkqtBcUoHe2zqhVFFbgUVED6o9or"] issuer address of token, the default address is "jGa9J9TkqtBcUoHe2zqhVFFbgUVED6o9or"
   * @returns {Promise<string>} resolve hash if transfer success
   * @memberof JCCExchange
   */
  public static setBrokerage(platformAccount: string, platformSecret: string, feeAccount: string, rateNum: number, rateDen: number, token: string, issuer = "jGa9J9TkqtBcUoHe2zqhVFFbgUVED6o9or"): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        const tx = serializeBrokerage(platformAccount, feeAccount, rateNum, rateDen, token, issuer);
        const inst = exchangeInstance.init(JCCExchange.urls);
        const hash = await JCCExchange.submit(platformSecret, tx, inst.setBrokerage.bind(inst));
        swtcSequence.rise(platformAccount);
        return resolve(hash);
      } catch (error) {
        swtcSequence.reset(platformAccount);
        return reject(error);
      }
    });
  }

  /**
   * submit transaction
   *
   * @protected
   * @static
   * @param {string} secret
   * @param {(ICancelExchange | ICreateExchange | IPayExchange) | IBrokerageExchange} tx
   * @param {(signature: string) => Promise<any>} callback
   * @returns {Promise<string>}
   * @memberof JCCExchange
   */
  protected static async submit(secret: string, tx: ICancelExchange | ICreateExchange | IPayExchange | IBrokerageExchange, callback: (signature: string) => Promise<any>): Promise<string> {
    let hash;
    let retry = JCCExchange.retry;
    const { nativeToken } = chainConfig.getDefaultConfig();
    while (!hash) {
      // copy transaction because signature action will change origin transaction
      const copyTx = Object.assign({}, tx);
      const sequence = await swtcSequence.get(JCCExchange.getSequence, tx.Account);
      copyTx.Sequence = sequence;
      const sign = jingtumSignTx(copyTx, { seed: secret }, nativeToken);
      const res = await callback(sign);
      const engine_result = res.result.engine_result;
      if (engine_result === "tesSUCCESS") {
        hash = res.result.tx_json.hash;
      } else {
        if (engine_result !== "terPRE_SEQ" && engine_result !== "tefPAST_SEQ") {
          throw new Error(res.result.engine_result_message);
        }
        retry = retry - 1;
        swtcSequence.reset(tx.Account);
        if (retry < 0) {
          throw new Error(res.result.engine_result_message);
        }
      }
    }
    return hash;
  }
}

export default JCCExchange;
export { JCCExchange };
