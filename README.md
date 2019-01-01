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

## API

### createOrder

```javascript
const createOrder = require('jcc_exchange').createOrder
// import { createOrder } from 'jcc_exchange';
createOrder(obj).then(() => {}).catch(error => {})
```

Parameters

`obj`- `object`

* `counter`- `string`
* `base`- `string`
* `issuer`- `string`
* `address`- `string`
* `type`- `number` -> `0: buy, 1: sell`
* `amount`- `string | number`
* `sum`- `string | number`
* `secret`- `string`
* `hosts`- `array`
* `port`- `number`
* `https`- `boolean`

### cancelOrder

```javascript
const cancelOrder = require('jcc_exchange').cancelOrder
// import { cancelOrder } from 'jcc_exchange';
createOrder(obj).then(() => {}).catch(error => {})
```

Parameters

`obj`- `object`

* `address`- `string`
* `offerSequence`- `number`
* `secret`- `string`
* `hosts`- `array`
* `port`- `number`
* `https`- `boolean`

### transferAccount

```javascript
const transferAccount = require('jcc_exchange').transferAccount
// import { transferAccount } from 'jcc_exchange';
transferAccount(obj).then(() => {}).catch(error => {})
```

Parameters

`obj`- `object`

* `currency`- `string`
* `amount`- `string`
* `address`- `string`
* `secret`- `string`
* `to`- `string`
* `issuer`- `string`
* `memo`- `string`
* `hosts`- `array`
* `port`- `number`
* `https`- `boolean`