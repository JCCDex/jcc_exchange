/**
MIT License

Copyright (c) 2018 JCC Dex

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
 */
/**
 * @author https://github.com/GinMu
 */

const jingtumSignTx = require('jcc_jingtum_lib/src/local_sign');
const JcExchange = require('jcc_rpc').JcExchange;
const {
    formatCreate,
    formatCancel,
    formatTransfer
} = require('./tx');

/**
 * create order
 * @param {object}
 * @returns {Promise}
 */
const createOrder = ({
    counter,
    base,
    issuer,
    address,
    type,
    amount,
    sum,
    secret,
    hosts,
    port,
    https
}) => {
    return new Promise(async (resolve, reject) => {
        let tx = formatCreate(type, base, counter, issuer, address, amount, sum);
        if (tx === null) {
            return reject(new Error('exchange type error'));
        }
        let inst = new JcExchange(hosts, port, https);
        let res = await inst.getSequence(address);
        if (!res.result) {
            return reject(new Error(res.msg));
        }
        let w = {};
        w.seed = secret;
        tx.Sequence = res.data.sequence;
        let sign;
        try {
            sign = jingtumSignTx(tx, w);
        } catch (error) {
            return reject(new Error('local signature failed'))
        }

        res = await inst.createOrder(sign);
        if (res.result) {
            return resolve(res.data.hash);
        }
        return reject(new Error(res.msg));
    })
}

/**
 * cancel order
 * @param {object}
 * @returns {promise}
 */
const cancelOrder = ({
    address,
    offerSequence,
    secret,
    hosts,
    port,
    https
}) => {
    return new Promise(async (resolve, reject) => {
        let inst = new JcExchange(hosts, port, https);
        let tx = formatCancel(address, offerSequence);
        let res = await inst.getSequence(address);
        if (!res.result) {
            return reject(new Error(res.msg));
        }
        tx.Sequence = res.data.sequence;
        let w = {};
        w.seed = secret;
        let sign;
        try {
            sign = jingtumSignTx(tx, w);
        } catch (error) {
            return reject(new Error('local signature failed'))
        }
        res = await inst.deleteOrder(sign);
        if (res.result) {
            return resolve(res.data.hash);
        }
        return reject(new Error(res.msg));
    })
}

/**
 * transfer account
 * @param {object}
 * @returns {promise}
 */
const transferAccount = ({
    currency,
    amount,
    address,
    secret,
    to,
    issuer,
    memo,
    hosts,
    port,
    https
}) => {
    return new Promise(async (resolve, reject) => {
        let inst = new JcExchange(hosts, port, https);
        let tx = formatTransfer(currency, amount, address, to, issuer, memo);
        let res = await inst.getSequence(address);
        if (!res.result) {
            return reject(new Error(res.msg));
        }
        tx.Sequence = res.data.sequence;
        let w = {};
        w.seed = secret;
        let sign;
        try {
            sign = jingtumSignTx(tx, w);
        } catch (error) {
            return reject(new Error('local signature failed'))
        }
        res = await inst.transferAccount(sign);
        if (res.result) {
            return resolve(res.data.hash);
        }
        return reject(new Error(res.msg));
    })
}

exports = module.exports = {
    createOrder,
    cancelOrder,
    transferAccount
}