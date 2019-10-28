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
import { ExchangeType, ICancelExchange, ICreateExchange, IMemo, IPayExchange } from "./model";
import { serializeCancelOrder, serializeCreateOrder, serializePayment } from "./tx";
import { exchangeInstance, swtcSequence } from "./util";

class JCCExchange {

    private static hosts: string[];
    private static port: number;
    private static https: boolean;
    private static retry: number;

    /**
     * init value of hosts、port、https & retry
     *
     * @static
     * @param {string[]} hosts
     * @param {number} port
     * @param {boolean} https
     * @param {number} [retry=3]
     * @memberof JCCExchange
     */
    public static init(hosts: string[], port: number, https: boolean, retry: number = 3) {
        JCCExchange.hosts = hosts;
        JCCExchange.port = port;
        JCCExchange.https = https;
        JCCExchange.retry = retry;
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

    public static async getSequence(address): Promise<number> {
        const inst = exchangeInstance.init(JCCExchange.hosts, JCCExchange.port, JCCExchange.https);
        const res = await inst.getSequence(address);
        if (!res.result) {
            throw new Error(res.msg);
        }
        return res.data.sequence;
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
                const inst = exchangeInstance.init(JCCExchange.hosts, JCCExchange.port, JCCExchange.https);
                const hash = await JCCExchange.submit(secret, tx, inst.createOrder.bind(inst));
                swtcSequence.rise();
                return resolve(hash);
            } catch (error) {
                swtcSequence.reset();
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
                const inst = exchangeInstance.init(JCCExchange.hosts, JCCExchange.port, JCCExchange.https);
                const hash = await JCCExchange.submit(secret, tx, inst.deleteOrder.bind(inst));
                swtcSequence.rise();
                return resolve(hash);
            } catch (error) {
                swtcSequence.reset();
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
                const inst = exchangeInstance.init(JCCExchange.hosts, JCCExchange.port, JCCExchange.https);
                const hash = await JCCExchange.submit(secret, tx, inst.transferAccount.bind(inst));
                swtcSequence.rise();
                return resolve(hash);
            } catch (error) {
                swtcSequence.reset();
                return reject(error);
            }
        });
    }
    protected static async submit(secret: string, tx: ICancelExchange | ICreateExchange | IPayExchange, callback: (signature: string) => Promise<any>): Promise<string> {
        let hash;
        let retry = JCCExchange.retry;
        while (!hash) {
            const copyTx = Object.assign({}, tx);
            const sequence = await swtcSequence.get(JCCExchange.getSequence, tx.Account);
            copyTx.Sequence = sequence;
            const sign = jingtumSignTx(copyTx, { seed: secret });
            const res = await callback(sign);
            if (res.result) {
                hash = res.data.hash;
            } else {
                const resultCode = res.data && res.data.result;
                if (resultCode !== "terPRE_SEQ" && resultCode !== "tefPAST_SEQ") {
                    throw new Error(res.msg);
                }
                retry = retry - 1;
                swtcSequence.reset();
                if (retry < 0) {
                    throw new Error(res.msg);
                }
            }
        }
        return hash;
    }
}

export default JCCExchange;
export { JCCExchange };
