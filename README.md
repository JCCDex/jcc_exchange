# jcc_exchange

![npm](https://img.shields.io/npm/v/jcc_exchange.svg)
[![Build Status](https://travis-ci.com/JCCDex/jcc_exchange.svg?branch=master)](https://travis-ci.com/JCCDex/jcc_exchange)
[![Coverage Status](https://coveralls.io/repos/github/JCCDex/jcc_exchange/badge.svg?branch=master)](https://coveralls.io/github/JCCDex/jcc_exchange?branch=master)
[![npm downloads](https://img.shields.io/npm/dm/jcc_exchange.svg)](http://npm-stat.com/charts.html?package=jcc_exchange)

## preface

[jcc_exchange](https://github.com/JCCDex/jcc_exchange) 可以提交订单和转账两种交易，而且都是在本地签名后发送到井通节点。

[jcc_exchange](https://github.com/JCCDex/jcc_exchange) is toolkit for submit order/payment transaction to Jingtum node after local signature.

* 支持浏览器 Support running in browsers

井畅应用交流群: 557524730

JCCDex Tech support QQ group ID: 557524730

## Installtion

```shell
npm install jcc_exchange
```

## Usage

Breaking changes since v2.0.0, if you used v1.0.9 see [v1.0.9](https://github.com/JCCDex/jcc_exchange/blob/master/docs/v1.0.9.md).

```javascript
import JCCExchange from "jcc_exchange";

// example
const hosts = ["localhost"];
const port = 80;
const https = false;
const retry = 3; // default value

// init value of hosts、port、https & retry
JCCExchange.init(hosts, port, https, retry);

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
const issuer; // the default value is "jGa9J9TkqtBcUoHe2zqhVFFbgUVED6o9or"
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

```
