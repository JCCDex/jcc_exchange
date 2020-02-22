# jcc_exchange

![npm](https://img.shields.io/npm/v/jcc_exchange.svg)
[![Build Status](https://travis-ci.com/JCCDex/jcc_exchange.svg?branch=master)](https://travis-ci.com/JCCDex/jcc_exchange)
[![Coverage Status](https://coveralls.io/repos/github/JCCDex/jcc_exchange/badge.svg?branch=master)](https://coveralls.io/github/JCCDex/jcc_exchange?branch=master)
[![npm downloads](https://img.shields.io/npm/dm/jcc_exchange.svg)](http://npm-stat.com/charts.html?package=jcc_exchange)

## preface

[jcc_exchange](https://github.com/JCCDex/jcc_exchange) 可以提交订单和转账两种交易，而且都是在本地签名后发送到井通节点。自动管理 sequence 以提高交易频率。 如果 sequence 失效，支持重试机制（默认 3 次）。

[jcc_exchange](https://github.com/JCCDex/jcc_exchange) is toolkit to submit order/payment transaction to Jingtum node after local signature. Automatically manage sequence to increase transaction frequency. If sequence is ineffective, retry again (default thrice).

- 支持浏览器 Support running in browsers

井畅应用交流群: 557524730

JCCDex Tech support QQ group ID: 557524730

## Installtion

```shell
npm install jcc_exchange
```

## Usage

Since v3.0.0, the transaction is submitted to chain node, see [v3.0.0](https://github.com/JCCDex/jcc_exchange/releases/tag/3.0.0).

Breaking changes since v2.0.0, if you used v1.0.9 see [v1.0.9](https://github.com/JCCDex/jcc_exchange/blob/master/docs/v1.0.9.md).

```javascript

const JCCExchange = require('jcc_exchange').JCCExchange;

// set chain config

// default support jingtum chain
JCCExchange.setDefaultChain("jingtum");

// support bizain chain
JCCExchange.setDefaultChain("bizain");

// support seaaps chain
JCCExchange.setDefaultChain("seaaps");

(async () => {
    // example urls
    const urls = ["http://localhost"];

    const retry = 3; // default value

    // init value of urls & retry
    JCCExchange.init(urls, retry);

    // create an order
    // buy 1 jcc with 1 swt
    const address = "";
    const secret = "";
    const amount = "1";
    const base = "jjcc";
    const counter = "swt";
    const sum = "1";
    const type = "buy"; // if sell 1 jjcc with 1 swt, the value of type is "sell"
    const platform = ""; // swtc address for service charge
    const issuer = "jGa9J9TkqtBcUoHe2zqhVFFbgUVED6o9or"; // the default value is "jGa9J9TkqtBcUoHe2zqhVFFbgUVED6o9or"
    try {
        const hash = await JCCExchange.createOrder(address, secret, amount, base, counter, sum, type, platform, issuer);
        console.log(hash);
    } catch (error) {
        console.log(error);
    }

    // cancel an order
    const address = "";
    const secret = "";
    const orderSequence = 0;
    try {
        const hash = await JCCExchange.cancelOrder(address, secret, orderSequence);
        console.log(hash);
    } catch (error) {
        console.log(error);
    }

    // transfer token
    // transfer 1 jjcc to "jKTtq57iqHoHg3cP7Rryzug9Q2puLX1kHh" from "jpgWGpfHz8GxqUjz5nb6ej8eZJQtiF6KhH"
    const address = "jpgWGpfHz8GxqUjz5nb6ej8eZJQtiF6KhH";
    const secret = "";
    const amount = "1";
    const memo = "test";
    const to = "jKTtq57iqHoHg3cP7Rryzug9Q2puLX1kHh";
    const token = "jjcc";
    const issuer; // the default value is "jGa9J9TkqtBcUoHe2zqhVFFbgUVED6o9or"
    try {
        const hash = await JCCExchange.transfer(address, secret, amount, memo, to, token, issuer);
        console.log(hash);
    } catch (error) {
        console.log(error);
    }
})();

```
