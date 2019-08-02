
import assert = require("assert");
import { JcExchange } from "jcc_rpc";

export const exchangeInstance = () => {
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
};
