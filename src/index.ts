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
/// <reference path = "./types/index.ts" />

import { serializeSetAccount, serializeSignerList, serializeBrokerage, serializeCancelOrder, serializeCreateOrder, serializePayment } from "./tx";
import { exchangeInstance, swtcSequence } from "./util";
import { chainConfig } from "./util/config";
import { sign, multiSign } from "./util/sign";

import * as Tx from "./tx";
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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
    JCCExchange.retry = JCCExchange.urls.length > 0 ? JCCExchange.urls.length : retry || 3;
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
   * create order and check
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
  public static createOrderWithCheck(address: string, secret: string, amount: string, base: string, counter: string, sum: string, type: ExchangeType, platform: string, issuer = "jGa9J9TkqtBcUoHe2zqhVFFbgUVED6o9or"): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        const chain = chainConfig.getDefaultChain();
        const tx = serializeCreateOrder(address, amount, base, counter, sum, type, platform, issuer);
        const inst = exchangeInstance.init(JCCExchange.urls);
        const copyTx = Object.assign({}, tx);
        const sequence = await swtcSequence.get(JCCExchange.getSequence, tx.Account);
        copyTx.Sequence = sequence;
        const signed = sign(copyTx, secret, chain);
        const hash = await JCCExchange.submitBlob(signed, inst.createOrder.bind(inst));
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
   * transfer token and check
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
  public static transferWithCheck(address: string, secret: string, amount: string, memo: string | IMemo[], to: string, token: string, issuer = "jGa9J9TkqtBcUoHe2zqhVFFbgUVED6o9or"): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        const chain = chainConfig.getDefaultChain();
        const tx = serializePayment(address, amount, to, token, memo, issuer);
        const inst = exchangeInstance.init(JCCExchange.urls);
        const copyTx = Object.assign({}, tx);
        const sequence = await swtcSequence.get(JCCExchange.getSequence, tx.Account);
        copyTx.Sequence = sequence;
        const signed = sign(copyTx, secret, chain);
        const hash = await JCCExchange.submitBlob(signed, inst.createOrder.bind(inst));
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
   * add blackList
   *
   * @static
   * @param {string} address manager wallet address
   * @param {string} secret manager wallet secret
   * @param {string} account to be frozen wallet address
   * @param {(string | IMemo[])} memo transfer memo
   * @returns {Promise<string>} resolve hash if transfer success
   * @memberof JCCExchange
   */
  public static addBlackList(address: string, secret: string, account: string, memo: string | IMemo[]): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        const tx = Tx.serializeSetBlackList(address, account, memo);
        const inst = exchangeInstance.init(JCCExchange.urls);
        const hash = await JCCExchange.submit(secret, tx, inst.addBlackList.bind(inst));
        swtcSequence.rise(address);
        return resolve(hash);
      } catch (error) {
        swtcSequence.reset(address);
        return reject(error);
      }
    });
  }

  /**
   * remove blackList
   *
   * @static
   * @param {string} address manager wallet address
   * @param {string} secret manager wallet secret
   * @param {string} account to be frozen wallet address
   * @param {(string | IMemo[])} memo transfer memo
   * @returns {Promise<string>} resolve hash if transfer success
   * @memberof JCCExchange
   */
  public static removeBlackList(address: string, secret: string, account: string, memo: string | IMemo[]): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        const tx = Tx.serializeRemoveBlackList(address, account, memo);
        const inst = exchangeInstance.init(JCCExchange.urls);
        const hash = await JCCExchange.submit(secret, tx, inst.removeBlackList.bind(inst));
        swtcSequence.rise(address);
        return resolve(hash);
      } catch (error) {
        swtcSequence.reset(address);
        return reject(error);
      }
    });
  }

  /**
   * remove blackList
   *
   * @static
   * @param {string} address manager wallet address
   * @param {string} secret manager wallet secret
   * @param {string} account new issuer wallet address
   * @param {(string | IMemo[])} memo transfer memo
   * @returns {Promise<string>} resolve hash if transfer success
   * @memberof JCCExchange
   */
  public static setManageIssuer(address: string, secret: string, account: string, memo: string | IMemo[]): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        const tx = Tx.serializeManageIssuer(address, account, memo);
        const inst = exchangeInstance.init(JCCExchange.urls);
        const hash = await JCCExchange.submit(secret, tx, inst.setManageIssuer.bind(inst));
        swtcSequence.rise(address);
        return resolve(hash);
      } catch (error) {
        swtcSequence.reset(address);
        return reject(error);
      }
    });
  }

  /**
   * issueSet pre issue new token
   *
   * @static
   * @param {string} address manager wallet address
   * @param {string} secret manager wallet secret
   * @param {string} amount the max amount with pre issue
   * @param {(string | IMemo[])} memo transfer memo
   * @param {string} token token name
   * @param {string} issuer issuer address of token
   * @returns {Promise<string>} resolve hash if transfer success
   * @memberof JCCExchange
   */
  public static issueSet(address: string, secret: string, amount: string, memo: string | IMemo[], token: string, issuer): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        const tx = Tx.serializeIssueSet(address, amount, token, memo, issuer);
        const inst = exchangeInstance.init(JCCExchange.urls);
        const hash = await JCCExchange.submit(secret, tx, inst.issueSet.bind(inst));
        swtcSequence.rise(address);
        return resolve(hash);
      } catch (error) {
        swtcSequence.reset(address);
        return reject(error);
      }
    });
  }

  /**
   * enable/disable multi-sign account, signerQuorum is zero means disable
   *
   * @static
   * @param {string} address multi-sign jingtum wallet
   * @param {string} secret secret of your jingtum wallet
   * @param {number} signerQuorum threshold of voting
   * @param {ISignerEntry[]} signerEntries list of signer account and weight
   * @returns {Promise<string>} resolve hash if transfer success
   * @memberof JCCExchange
   */
  public static setSignerList(address: string, secret: string, signerQuorum: number, signerEntries?: ISignerEntry[]): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        const tx = serializeSignerList(address, signerQuorum, signerEntries);
        const inst = exchangeInstance.init(JCCExchange.urls);
        const hash = await JCCExchange.submit(secret, tx, inst.setSignerList.bind(inst));
        swtcSequence.rise(address);
        return resolve(hash);
      } catch (error) {
        swtcSequence.reset(address);
        return reject(error);
      }
    });
  }

  /**
   * enable/disable account master key
   *
   * @static
   * @param {string} address multi-sign jingtum wallet
   * @param {string} secret secret of your jingtum wallet
   * @param {number} signerQuorum threshold of voting
   * @param {ISignerEntry[]} signerEntries list of signer account and weight
   * @returns {Promise<string>} resolve hash if transfer success
   * @memberof JCCExchange
   */
  public static setAccount(address: string, secret: string, disable: boolean): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        const tx = serializeSetAccount(address, disable);
        const inst = exchangeInstance.init(JCCExchange.urls);
        const hash = await JCCExchange.submit(secret, tx, inst.setAccount.bind(inst));
        swtcSequence.rise(address);
        return resolve(hash);
      } catch (error) {
        swtcSequence.reset(address);
        return reject(error);
      }
    });
  }

  /**
   * send raw transaction
   *
   * @protected
   * @static
   * @param {string} blob
   * @param {(signature: string) => Promise<any>} [callback]
   * @returns {Promise<string>}
   * @memberof JCCExchange
   */
  public static async sendRawTransaction(blob: string, callback?: (signature: string) => Promise<any>): Promise<string> {
    if (!callback) {
      const inst = exchangeInstance.init(JCCExchange.urls);
      callback = inst.sendRawTransaction.bind(inst);
    }
    const res = await callback(blob);
    const engine_result = res.result.engine_result;
    if (engine_result !== "tesSUCCESS") {
      throw new Error(res.result.engine_result_message || res.result.error_exception || res.result.error_message);
    }
    return res.result.tx_json.hash;
  }
  /**
   * submit transaction
   *
   * @protected
   * @static
   * @param {string} secret
   * @param {(ICancelExchange | ICreateExchange | IPayExchange) | IBrokerageExchange | ISignerListSet | IAccountSet} tx
   * @param {(signature: string) => Promise<any>} callback
   * @returns {Promise<string>}
   * @memberof JCCExchange
   */
  protected static async submit(secret: string, tx: ICancelExchange | ICreateExchange | IPayExchange | IBrokerageExchange | ISignerListSet | IAccountSet, callback: (signature: string) => Promise<any>): Promise<string> {
    let hash;
    let retry = JCCExchange.retry;
    const chain = chainConfig.getDefaultChain();
    while (!hash) {
      // copy transaction because signature action will change origin transaction
      const copyTx = Object.assign({}, tx);
      const sequence = await swtcSequence.get(JCCExchange.getSequence, tx.Account);
      copyTx.Sequence = sequence;
      const signed = sign(copyTx, secret, chain);
      const res = await callback(signed);
      const engine_result = res.result.engine_result;
      if (engine_result === "tesSUCCESS") {
        hash = res.result.tx_json.hash;
      } else {
        if (engine_result !== "terPRE_SEQ" && engine_result !== "tefPAST_SEQ") {
          throw new Error(res.result.engine_result_message || res.result.error_exception || res.result.error_message);
        }
        retry = retry - 1;
        swtcSequence.reset(tx.Account);
        if (retry < 0) {
          throw new Error(res.result.engine_result_message || res.result.error_exception || res.result.error_message);
        }
      }
    }
    return hash;
  }

  protected static async submitBlob(blob: string, callback: (signature: string) => Promise<any>): Promise<string> {
    let hash: string;
    let res;
    let resTx: string = "";
    let retry = JCCExchange.retry;
    const inst = exchangeInstance.init(JCCExchange.urls);
    do {
      retry--;
      res = await callback(blob);
      const engine_result = res.result.engine_result;
      if (engine_result === "tesSUCCESS") {
        await delay(5000);
        hash = res.result.tx_json.hash;
        resTx = await inst.requestTransaction(hash);
        if (resTx.length !== 0) break;
      }
      if (retry < 0) {
        throw new Error(res.result.engine_result_message || res.result.error_exception || res.result.error_message);
      }
    } while (retry > 0);

    if (resTx.length !== 0) {
      return hash;
    } else {
      throw new Error(res.result.engine_result_message || res.result.error_exception || res.result.error_message);
    }
  }
}

export default JCCExchange;
export { JCCExchange, Tx, sign, multiSign, exchangeInstance, swtcSequence };
