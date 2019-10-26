const JCCExchange = require('../lib').JCCExchange;
const chai = require('chai');
const expect = chai.expect;
const fetch = require('jcc_rpc/lib/fetch');
const MockAdapter = require('axios-mock-adapter');
const sinon = require("sinon");
const sandbox = sinon.createSandbox();
const mock = new MockAdapter(fetch);
const JcExchange = require("jcc_rpc").JcExchange;
const exchangeInstance = require("../lib/util").exchangeInstance;
const testAddress = 'jpgWGpfHz8GxqUjz5nb6ej8eZJQtiF6KhH';
const testSecret = 'snfXQMEVbbZng84CcfdKDASFRi4Hf';
const testIssuer = "jGa9J9TkqtBcUoHe2zqhVFFbgUVED6o9or";
const swtcSequence = require("../lib/util").swtcSequence;

describe('test jc exchange', function() {

  const hosts = [];
  const port = 80;
  const https = false;

  describe("test init", function() {
    it("init should be a function", function() {
      expect(typeof JCCExchange.init).to.equal("function");
    });

    it("call init", function() {
      JCCExchange.init(hosts, port, https);
      expect(JCCExchange.hosts).to.deep.equal([]);
      expect(JCCExchange.port).to.equal(80);
      expect(JCCExchange.https).to.equal(false);
    })
  })

  describe("test destroy", function() {
    it("destroy should be a function", function() {
      expect(typeof JCCExchange.destroy).to.equal("function");
    });

    it("destroy should be called once", function() {
      const spy = sandbox.spy(exchangeInstance, "destroy");
      JCCExchange.destroy();
      expect(spy.calledOnce).to.true;
      sandbox.restore();
    })
  })

  describe('test createOrder', function() {

    it('create order successfully', function(done) {

      const spy = sandbox.spy(JcExchange.prototype, "getSequence");
      const spy1 = sandbox.spy(JcExchange.prototype, "createOrder");

      mock.onGet(/^\/exchange\/sequence\//).reply(200, {
        code: '0',
        data: {
          sequence: 200
        }
      }, {
        date: new Date()
      })
      mock.onPost('/exchange/sign_order').reply(200, {
        code: '0',
        data: {
          hash: "111"
        }
      }, {
        date: new Date()
      });

      JCCExchange.createOrder(testAddress, testSecret, "1", "jjcc", "cny", "1", "buy").then(async hash => {
        expect(hash).to.equal("111");
        expect(spy.calledOnceWith(testAddress)).to.true;
        expect(spy1.calledOnceWith("120007220000000024000000C864D4838D7EA4C6800000000000000000000000004A4A43430000000000A582E432BFC48EEDEF852C814EC57F3CD2D4159665D4838D7EA4C68000000000000000000000000000434E590000000000A582E432BFC48EEDEF852C814EC57F3CD2D4159668400000000000000A732102C13075B18C87A032226CE383AEFD748D7BB719E02CD7F5A8C1F2C7562DE7C12A7446304402204BAE7257177ECB10E43FBD06C8158F1AC2290A44081B796C9BD47725536A9B9902200D9D86C1479F482D207BF9CEAC66FD9D7BE9498110A566EC69A713AAB0D3E95281141270C5BE503A3A22B506457C0FEC97633B44F7DD8D14896E3F7353697ECE52645D9C502F08BB2EDC5717")).to.true;
        sandbox.restore();
        expect(await swtcSequence.get()).to.equal(201);
        swtcSequence.reset();
        done()
      })
    })

    it('if the type is wrong', function(done) {
      JCCExchange.createOrder(testAddress, testSecret, "1", "jjcc", "cny", "1", "", "", testIssuer).catch(error => {
        expect(error.message).to.equal("The type of creating order should be one of 'buy' and 'sell'");
        done()
      })
    })

    it('get sequence wrongly', function(done) {
      mock.onGet(/^\/exchange\/sequence\//).reply(200, {
        code: '109',
        msg: 'account is invalid'
      }, {
        date: new Date()
      })
      JCCExchange.createOrder(testAddress, testSecret, "1", "jjcc", "cny", "1", "buy", testIssuer).catch(error => {
        expect(error.message).to.equal('account is invalid');
        done()
      })
    })

    it('local singature failed', function(done) {
      mock.onGet(/^\/exchange\/sequence\//).reply(200, {
        code: '0',
        data: {
          sequence: 200
        }
      }, {
        date: new Date()
      })
      JCCExchange.createOrder(testAddress, "", "1", "jjcc", "cny", "1", "buy", testIssuer).catch(error => {
        expect(error.message).to.equal('Unknown datatype. (SigningPubKey)');
        done()
      })
    })

    it('create order failed', function(done) {
      mock.onGet(/^\/exchange\/sequence\//).reply(200, {
        code: '0',
        data: {
          sequence: 200
        }
      }, {
        date: new Date()
      })
      mock.onPost('/exchange/sign_order').reply(200, {
        code: '100',
        msg: 'balance is not enough'
      }, {
        date: new Date()
      });
      JCCExchange.createOrder(testAddress, testSecret, "1", "jjcc", "cny", "1", "buy", testIssuer).catch(error => {
        expect(error.message).to.equal('balance is not enough');
        done()
      })
    })
  })

  describe('test cancelOrder', function() {

    it('cancel order successfully', function(done) {
      mock.onGet(/^\/exchange\/sequence\//).reply(200, {
        code: '0',
        data: {
          sequence: 200
        }
      }, {
        date: new Date()
      })
      mock.onDelete('/exchange/sign_cancel_order').reply(200, {
        code: '0',
        data: {
          hash: "1111"
        }
      }, {
        date: new Date()
      });

      const spy = sandbox.spy(JcExchange.prototype, "getSequence");
      const spy1 = sandbox.spy(JcExchange.prototype, "deleteOrder");

      JCCExchange.cancelOrder(testAddress, testSecret, 200).then(async hash => {
        expect(hash).to.equal("1111");
        expect(spy.calledOnceWith(testAddress)).to.true;
        expect(spy1.calledOnceWith("120008220000000024000000C82019000000C868400000000000000A732102C13075B18C87A032226CE383AEFD748D7BB719E02CD7F5A8C1F2C7562DE7C12A74473045022100C13F2C789E428CC41DC0579471EB826A1089A13DE9B85293D1879718AA03BAF102203E1A013FBEFD8F497DE5AB5890EBEA3E013BD71B38852D9B2A552EC2F3971CB781141270C5BE503A3A22B506457C0FEC97633B44F7DD")).to.true;
        sandbox.restore();
        expect(await swtcSequence.get()).to.equal(201);
        swtcSequence.reset();
        done()
      })
    })

    it('get sequence wrongly', function(done) {
      mock.onGet(/^\/exchange\/sequence\//).reply(200, {
        code: '109',
        msg: 'account is invalid'
      }, {
        date: new Date()
      })
      JCCExchange.cancelOrder(testAddress, testSecret, 200).catch(error => {
        expect(error.message).to.equal('account is invalid');
        done()
      })
    })

    it('local singature failed', function(done) {
      mock.onGet(/^\/exchange\/sequence\//).reply(200, {
        code: '0',
        data: {
          sequence: '200'
        }
      }, {
        date: new Date()
      })
      JCCExchange.cancelOrder(testAddress, testSecret, 200).catch(error => {
        expect(error.message).to.equal('Value is not a number (Sequence)');
        done()
      })
    })

    it('cancel order failed', function(done) {
      mock.onGet(/^\/exchange\/sequence\//).reply(200, {
        code: '0',
        data: {
          sequence: 200
        }
      }, {
        date: new Date()
      })
      mock.onDelete('/exchange/sign_cancel_order').reply(200, {
        code: '100',
        msg: 'failed'
      }, {
        date: new Date()
      });
      JCCExchange.cancelOrder(testAddress, testSecret, 200, testIssuer).catch(error => {
        expect(error.message).to.equal('failed');
        done()
      })
    })
  })

  describe('test transferAccount', function() {

    const to = "jEaAWgAxr8fcVSNNeKprbD7UK4JUxnCn9C";

    it('transfer account successfully', function(done) {
      mock.onGet(/^\/exchange\/sequence\//).reply(200, {
        code: '0',
        data: {
          sequence: 200
        }
      }, {
        date: new Date()
      })
      mock.onPost('/exchange/sign_payment').reply(200, {
        code: '0',
        data: {
          hash: '111111'
        }
      }, {
        date: new Date()
      });
      const spy = sandbox.spy(JcExchange.prototype, "getSequence");
      const spy1 = sandbox.spy(JcExchange.prototype, "transferAccount");
      JCCExchange.transfer(testAddress, testSecret, "1", "test", to, "swt").then(async res => {
        expect(res).to.equal("111111");
        expect(spy.calledOnceWith(testAddress)).to.true;
        expect(spy1.calledOnceWith("120000220000000024000000C86140000000000F424068400000000000000A732102C13075B18C87A032226CE383AEFD748D7BB719E02CD7F5A8C1F2C7562DE7C12A7446304402202EFB141373DFB76D87C24BEBE0EAD89E145A1965894D43D6B49BE4D0D96E90E102203F660D691022F4F862CF42D2DCB0F08F51DA5A90D746CB24B435B7026D6F8BF481141270C5BE503A3A22B506457C0FEC97633B44F7DD83149AB1585226C7771B968141D07AE1F524384B61EEF9EA7C06737472696E677D0474657374E1F1")).to.true;
        sandbox.restore();
        expect(await swtcSequence.get()).to.equal(201);
        swtcSequence.reset();
        done()
      })
    })

    it('get sequence wrongly', function(done) {
      mock.onGet(/^\/exchange\/sequence\//).reply(200, {
        code: '109',
        msg: 'account is invalid'
      }, {
        date: new Date()
      })
      JCCExchange.transfer(testAddress, testSecret, "1", "test", to, "swt").catch(error => {
        expect(error.message).to.equal('account is invalid');
        done()
      })
    })

    it('local singature failed', function(done) {
      mock.onGet(/^\/exchange\/sequence\//).reply(200, {
        code: '0',
        data: {
          sequence: '200'
        }
      }, {
        date: new Date()
      })
      JCCExchange.transfer(testAddress, testSecret, "1", "test", to, "swt").catch(error => {
        expect(error.message).to.equal('Value is not a number (Sequence)');
        done()
      })
    })

    it('transfer account failed', function(done) {
      mock.onGet(/^\/exchange\/sequence\//).reply(200, {
        code: '0',
        data: {
          sequence: 200
        }
      }, {
        date: new Date()
      })
      mock.onPost('/exchange/sign_payment').reply(200, {
        code: '100',
        msg: 'balance is not enough'
      }, {
        date: new Date()
      });
      JCCExchange.transfer(testAddress, testSecret, "1", "test", to, "swt", testIssuer).catch(error => {
        expect(error.message).to.equal('balance is not enough');
        done()
      })
    })
  })
})