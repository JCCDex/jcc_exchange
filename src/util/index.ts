
import assert = require("assert");
import { JcExchange } from "jcc_rpc";

export const exchangeInstance = (() => {
    let inst: JcExchange = null;

    /**
     * init instance of jc exchange
     *
     * @param {string[]} hosts
     * @param {number} port
     * @param {boolean} https
     * @returns {JcExchange}
     */
    const init = (hosts: string[], port: number, https: boolean): JcExchange => {
        if (inst === null) {
            inst = new JcExchange(hosts, port, https);
        } else {
            let isEqual = true;
            try {
                assert.deepStrictEqual(inst.hosts, hosts);
            } catch (error) {
                isEqual = false;
            }
            if (!isEqual || inst.port !== port || inst.https !== https) {
                inst = new JcExchange(hosts, port, https);
            }
        }

        return inst;
    };

    /**
     * destroy instance of jc exchange
     *
     */
    const destroy = () => {
        inst = null;
    };

    return {
        destroy,
        init
    };
})();

export const swtcSequence = (() => {
    // default value
    // the sequence should be not less than 0
    let sequence: number = -1;

    /**
     * get suquence
     *
     * the value is from callback function if the sequence is -1, otherwise is from memory
     *
     * @param {(...args) => Promise<number>} callback
     * @param {*} args
     * @returns {Promise<number>}
     */
    const get = async (callback: (...args) => Promise<number>, ...args): Promise<number> => {
        if (sequence === -1) {
            sequence = await callback.apply(null, args);
        }
        return sequence;
    };

    /**
     * sequence add 1
     *
     */
    const rise = () => {
        sequence = sequence + 1;
    };

    /**
     * reset sequence to -1
     *
     */
    const reset = () => {
        sequence = -1;
    };

    return {
        get,
        reset,
        rise
    };
})();