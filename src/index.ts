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
import { ExchangeType, IMemo } from "./model";
import { serializeCancelOrder, serializeCreateOrder, serializePayment } from "./tx";
import { exchangeInstance } from "./util";

class JCCExchange {

    private static hosts: string[];
    private static port: number;
    private static https: boolean;

    /**
     * init value of hosts、port & https
     *
     * @static
     * @param {string[]} hosts
     * @param {number} port
     * @param {boolean} https
     * @memberof JCCExchange
     */
    public static init(hosts: string[], port: number, https: boolean) {
        JCCExchange.hosts = hosts;
        JCCExchange.port = port;
        JCCExchange.https = https;
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
     * @param {string} [issuer="jGa9J9TkqtBcUoHe2zqhVFFbgUVED6o9or"] issuer address of token, the default address is "jGa9J9TkqtBcUoHe2zqhVFFbgUVED6o9or"
     * @returns {Promise<string>} resolve hash if create success
     * @memberof JCCExchange
     */
    public static createOrder(address: string, secret: string, amount: string, base: string, counter: string, sum: string, type: ExchangeType, issuer = "jGa9J9TkqtBcUoHe2zqhVFFbgUVED6o9or"): Promise<string> {
        return new Promise(async (resolve, reject) => {
            try {
                const tx = serializeCreateOrder(address, amount, base, counter, sum, type, issuer);
                const inst = exchangeInstance.init(JCCExchange.hosts, JCCExchange.port, JCCExchange.https);
                let res = await inst.getSequence(address);
                if (!res.result) {
                    return reject(new Error(res.msg));
                }
                tx.Sequence = res.data.sequence;
                const sign = jingtumSignTx(tx, { seed: secret });
                res = await inst.createOrder(sign);
                if (res.result) {
                    return resolve(res.data.hash);
                }
                return reject(new Error(res.msg));
            } catch (error) {
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
                let res = await inst.getSequence(address);
                if (!res.result) {
                    return reject(new Error(res.msg));
                }
                tx.Sequence = res.data.sequence;
                const sign = jingtumSignTx(tx, { seed: secret });
                res = await inst.deleteOrder(sign);
                if (res.result) {
                    return resolve(res.data.hash);
                }
                return reject(new Error(res.msg));
            } catch (error) {
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
                let res = await inst.getSequence(address);
                if (!res.result) {
                    return reject(new Error(res.msg));
                }
                tx.Sequence = res.data.sequence;
                const sign = jingtumSignTx(tx, { seed: secret });
                res = await inst.transferAccount(sign);
                if (res.result) {
                    return resolve(res.data.hash);
                }
                return reject(new Error(res.msg));
            } catch (error) {
                return reject(error);
            }
        });
    }
}

export default JCCExchange;
export { JCCExchange };
