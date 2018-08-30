const jingtumSignTx = require('jingtum-lib/src/local_sign');
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
            return resolve();
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
            return resolve();
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
            return resolve();
        }
        return reject(new Error(res.msg));
    })
}

exports = module.exports = {
    createOrder,
    cancelOrder,
    transferAccount
}