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

const platformAccount = "jJSEWTMsB3WFsZyoGGi977wQdTqTmkBFwV";
const platformSecret = "snJ7ufPZ3LGTfz6V7yLNWABYneLAL";
const feeAccount = "j98XXLZUCqvP4x7rgFeeYekNgZCotffBH5";
const testIssuer1 = "jPpTx4EXLUcXWrVbS98FX6TXea4EuQyyU6"

const swtcSequence = require("../lib/util").swtcSequence;

describe('test jc exchange', () => {

  const hosts = [];
  const port = 80;
  const https = false;

  describe("test init", () => {
    it("init should be a function", () => {
      expect(typeof JCCExchange.init).to.equal("function");
    });

    it("call init", () => {
      JCCExchange.init(hosts, port, https);
      expect(JCCExchange.hosts).to.deep.equal([]);
      expect(JCCExchange.port).to.equal(80);
      expect(JCCExchange.https).to.equal(false);
      expect(JCCExchange.retry).to.equal(3);
    })
  })

  describe("test destroy", () => {
    it("destroy should be a function", () => {
      expect(typeof JCCExchange.destroy).to.equal("function");
    });

    it("destroy should be called once", () => {
      const spy = sandbox.spy(exchangeInstance, "destroy");
      JCCExchange.destroy();
      expect(spy.calledOnce).to.true;
      sandbox.restore();
    })
  })

  describe('test createOrder', () => {

    before(() => {
      JCCExchange.init(hosts, port, https, 1);
    })

    afterEach(() => {
      sandbox.restore();
      swtcSequence.reset();
    })


    it('create order successfully', async () => {

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

      const hash = await JCCExchange.createOrder(testAddress, testSecret, "1", "jjcc", "cny", "1", "buy");
      expect(hash).to.equal("111");
      expect(spy.calledOnceWith(testAddress)).to.true;
      expect(spy1.calledOnceWith("120007220000000024000000C864D4838D7EA4C6800000000000000000000000004A4A43430000000000A582E432BFC48EEDEF852C814EC57F3CD2D4159665D4838D7EA4C68000000000000000000000000000434E590000000000A582E432BFC48EEDEF852C814EC57F3CD2D4159668400000000000000A732102C13075B18C87A032226CE383AEFD748D7BB719E02CD7F5A8C1F2C7562DE7C12A7446304402204BAE7257177ECB10E43FBD06C8158F1AC2290A44081B796C9BD47725536A9B9902200D9D86C1479F482D207BF9CEAC66FD9D7BE9498110A566EC69A713AAB0D3E95281141270C5BE503A3A22B506457C0FEC97633B44F7DD8D14896E3F7353697ECE52645D9C502F08BB2EDC5717")).to.true;
      expect(await swtcSequence.get()).to.equal(201);
    })

    it('if the type is wrong', async () => {
      try {
        await JCCExchange.createOrder(testAddress, testSecret, "1", "jjcc", "cny", "1", "", "", testIssuer);
      } catch (error) {
        expect(error.message).to.equal("The type of creating order should be one of 'buy' and 'sell'");
      }
    })

    it('get sequence failed', async () => {
      mock.onGet(/^\/exchange\/sequence\//).reply(200, {
        code: '109',
        msg: 'account is invalid'
      }, {
        date: new Date()
      })
      try {
        await JCCExchange.createOrder(testAddress, testSecret, "1", "jjcc", "cny", "1", "buy", testIssuer);
      } catch (error) {
        expect(error.message).to.equal('account is invalid');
      }
    })

    it('local singature failed', async () => {
      mock.onGet(/^\/exchange\/sequence\//).reply(200, {
        code: '0',
        data: {
          sequence: 200
        }
      }, {
        date: new Date()
      })
      try {
        await JCCExchange.createOrder(testAddress, "", "1", "jjcc", "cny", "1", "buy", testIssuer);
      } catch (error) {
        expect(error.message).to.equal('Unknown datatype. (SigningPubKey)');
      }
    })

    it('create order failed: temBAD_OFFER', async () => {
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
        code: '100',
        msg: 'Malformed: Bad offer.',
        data: {
          result: "temBAD_OFFER"
        }
      }, {
        date: new Date()
      });
      try {
        await JCCExchange.createOrder(testAddress, testSecret, "1", "jjcc", "cny", "1", "buy", testIssuer);
      } catch (error) {
        expect(error.message).to.equal('Malformed: Bad offer.');
      } finally {
        expect(spy.calledOnce).to.true;
        expect(spy1.calledOnce).to.true;
      }
    })

    it('create order failed: terPRE_SEQ', async () => {
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
        code: '100',
        msg: 'Missing/inapplicable prior transaction.',
        data: {
          result: "terPRE_SEQ"
        }
      }, {
        date: new Date()
      });
      try {
        await JCCExchange.createOrder(testAddress, testSecret, "1", "jjcc", "cny", "1", "buy");
      } catch (error) {
        expect(error.message).to.equal('Missing/inapplicable prior transaction.');
      } finally {
        expect(spy.calledTwice).to.true;
        expect(spy1.calledTwice).to.true;
        expect(spy1.firstCall.args[0]).to.equal("120007220000000024000000C864D4838D7EA4C6800000000000000000000000004A4A43430000000000A582E432BFC48EEDEF852C814EC57F3CD2D4159665D4838D7EA4C68000000000000000000000000000434E590000000000A582E432BFC48EEDEF852C814EC57F3CD2D4159668400000000000000A732102C13075B18C87A032226CE383AEFD748D7BB719E02CD7F5A8C1F2C7562DE7C12A7446304402204BAE7257177ECB10E43FBD06C8158F1AC2290A44081B796C9BD47725536A9B9902200D9D86C1479F482D207BF9CEAC66FD9D7BE9498110A566EC69A713AAB0D3E95281141270C5BE503A3A22B506457C0FEC97633B44F7DD8D14896E3F7353697ECE52645D9C502F08BB2EDC5717")
        expect(spy1.secondCall.args[0]).to.equal("120007220000000024000000C864D4838D7EA4C6800000000000000000000000004A4A43430000000000A582E432BFC48EEDEF852C814EC57F3CD2D4159665D4838D7EA4C68000000000000000000000000000434E590000000000A582E432BFC48EEDEF852C814EC57F3CD2D4159668400000000000000A732102C13075B18C87A032226CE383AEFD748D7BB719E02CD7F5A8C1F2C7562DE7C12A7446304402204BAE7257177ECB10E43FBD06C8158F1AC2290A44081B796C9BD47725536A9B9902200D9D86C1479F482D207BF9CEAC66FD9D7BE9498110A566EC69A713AAB0D3E95281141270C5BE503A3A22B506457C0FEC97633B44F7DD8D14896E3F7353697ECE52645D9C502F08BB2EDC5717")
      }
    })

    it('create order failed: tefPAST_SEQ', async () => {
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
        code: '100',
        msg: 'This sequence number has already past.',
        data: {
          result: "tefPAST_SEQ"
        }
      }, {
        date: new Date()
      });
      try {
        await JCCExchange.createOrder(testAddress, testSecret, "1", "jjcc", "cny", "1", "buy");
      } catch (error) {
        expect(error.message).to.equal('This sequence number has already past.');
      } finally {
        expect(spy.calledTwice).to.true;
        expect(spy1.calledTwice).to.true;
        expect(spy1.firstCall.args[0]).to.equal("120007220000000024000000C864D4838D7EA4C6800000000000000000000000004A4A43430000000000A582E432BFC48EEDEF852C814EC57F3CD2D4159665D4838D7EA4C68000000000000000000000000000434E590000000000A582E432BFC48EEDEF852C814EC57F3CD2D4159668400000000000000A732102C13075B18C87A032226CE383AEFD748D7BB719E02CD7F5A8C1F2C7562DE7C12A7446304402204BAE7257177ECB10E43FBD06C8158F1AC2290A44081B796C9BD47725536A9B9902200D9D86C1479F482D207BF9CEAC66FD9D7BE9498110A566EC69A713AAB0D3E95281141270C5BE503A3A22B506457C0FEC97633B44F7DD8D14896E3F7353697ECE52645D9C502F08BB2EDC5717")
        expect(spy1.secondCall.args[0]).to.equal("120007220000000024000000C864D4838D7EA4C6800000000000000000000000004A4A43430000000000A582E432BFC48EEDEF852C814EC57F3CD2D4159665D4838D7EA4C68000000000000000000000000000434E590000000000A582E432BFC48EEDEF852C814EC57F3CD2D4159668400000000000000A732102C13075B18C87A032226CE383AEFD748D7BB719E02CD7F5A8C1F2C7562DE7C12A7446304402204BAE7257177ECB10E43FBD06C8158F1AC2290A44081B796C9BD47725536A9B9902200D9D86C1479F482D207BF9CEAC66FD9D7BE9498110A566EC69A713AAB0D3E95281141270C5BE503A3A22B506457C0FEC97633B44F7DD8D14896E3F7353697ECE52645D9C502F08BB2EDC5717")
      }
    })
  })

  describe('test cancelOrder', () => {
    before(() => {
      JCCExchange.init(hosts, port, https, 2);
    })

    afterEach(() => {
      sandbox.restore();
      swtcSequence.reset();
    })

    it('cancel order successfully', async () => {
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

      const hash = await JCCExchange.cancelOrder(testAddress, testSecret, 200);
      expect(hash).to.equal("1111");
      expect(spy.calledOnceWith(testAddress)).to.true;
      expect(spy1.calledOnceWith("120008220000000024000000C82019000000C868400000000000000A732102C13075B18C87A032226CE383AEFD748D7BB719E02CD7F5A8C1F2C7562DE7C12A74473045022100C13F2C789E428CC41DC0579471EB826A1089A13DE9B85293D1879718AA03BAF102203E1A013FBEFD8F497DE5AB5890EBEA3E013BD71B38852D9B2A552EC2F3971CB781141270C5BE503A3A22B506457C0FEC97633B44F7DD")).to.true;
      expect(await swtcSequence.get()).to.equal(201);
    })

    it('get sequence failed', async () => {
      mock.onGet(/^\/exchange\/sequence\//).reply(200, {
        code: '109',
        msg: 'account is invalid'
      }, {
        date: new Date()
      })

      try {
        await JCCExchange.cancelOrder(testAddress, testSecret, 200);
      } catch (error) {
        expect(error.message).to.equal('account is invalid');
      }
    })

    it('local singature failed', async () => {
      mock.onGet(/^\/exchange\/sequence\//).reply(200, {
        code: '0',
        data: {
          sequence: '200'
        }
      }, {
        date: new Date()
      })

      try {
        await JCCExchange.cancelOrder(testAddress, testSecret, 200);
      } catch (error) {
        expect(error.message).to.equal('Value is not a number (Sequence)');
      }
    })

    it('cancel order failed: temBAD_OFFER', async () => {
      const spy = sandbox.spy(JcExchange.prototype, "getSequence");
      const spy1 = sandbox.spy(JcExchange.prototype, "deleteOrder");
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
        msg: 'Malformed: Bad offer.',
        data: {
          result: "temBAD_OFFER"
        }
      }, {
        date: new Date()
      });

      try {
        await JCCExchange.cancelOrder(testAddress, testSecret, 200, testIssuer);
      } catch (error) {
        expect(error.message).to.equal('Malformed: Bad offer.');
      } finally {
        expect(spy.calledOnce).to.true;
        expect(spy1.calledOnce).to.true;
      }
    })

    it('cancel order failed: terPRE_SEQ', async () => {
      const spy = sandbox.spy(JcExchange.prototype, "getSequence");
      const spy1 = sandbox.spy(JcExchange.prototype, "deleteOrder");

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
        msg: 'Missing/inapplicable prior transaction.',
        data: {
          result: "terPRE_SEQ"
        }
      }, {
        date: new Date()
      });

      try {
        await JCCExchange.cancelOrder(testAddress, testSecret, 200, testIssuer);
      } catch (error) {
        expect(error.message).to.equal('Missing/inapplicable prior transaction.');
      } finally {
        expect(spy.calledThrice).to.true;
        expect(spy1.calledThrice).to.true;
        expect(spy1.firstCall.args[0]).to.equal("120008220000000024000000C82019000000C868400000000000000A732102C13075B18C87A032226CE383AEFD748D7BB719E02CD7F5A8C1F2C7562DE7C12A74473045022100C13F2C789E428CC41DC0579471EB826A1089A13DE9B85293D1879718AA03BAF102203E1A013FBEFD8F497DE5AB5890EBEA3E013BD71B38852D9B2A552EC2F3971CB781141270C5BE503A3A22B506457C0FEC97633B44F7DD")
        expect(spy1.secondCall.args[0]).to.equal("120008220000000024000000C82019000000C868400000000000000A732102C13075B18C87A032226CE383AEFD748D7BB719E02CD7F5A8C1F2C7562DE7C12A74473045022100C13F2C789E428CC41DC0579471EB826A1089A13DE9B85293D1879718AA03BAF102203E1A013FBEFD8F497DE5AB5890EBEA3E013BD71B38852D9B2A552EC2F3971CB781141270C5BE503A3A22B506457C0FEC97633B44F7DD")
      }
    })

    it('cancel order failed: tefPAST_SEQ', async () => {
      const spy = sandbox.spy(JcExchange.prototype, "getSequence");
      const spy1 = sandbox.spy(JcExchange.prototype, "deleteOrder");

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
        msg: 'This sequence number has already past.',
        data: {
          result: "tefPAST_SEQ"
        }
      }, {
        date: new Date()
      });
      try {
        await JCCExchange.cancelOrder(testAddress, testSecret, 200, testIssuer);
      } catch (error) {
        expect(error.message).to.equal('This sequence number has already past.');
      } finally {
        expect(spy.calledThrice).to.true;
        expect(spy1.calledThrice).to.true;
        expect(spy1.firstCall.args[0]).to.equal("120008220000000024000000C82019000000C868400000000000000A732102C13075B18C87A032226CE383AEFD748D7BB719E02CD7F5A8C1F2C7562DE7C12A74473045022100C13F2C789E428CC41DC0579471EB826A1089A13DE9B85293D1879718AA03BAF102203E1A013FBEFD8F497DE5AB5890EBEA3E013BD71B38852D9B2A552EC2F3971CB781141270C5BE503A3A22B506457C0FEC97633B44F7DD")
        expect(spy1.secondCall.args[0]).to.equal("120008220000000024000000C82019000000C868400000000000000A732102C13075B18C87A032226CE383AEFD748D7BB719E02CD7F5A8C1F2C7562DE7C12A74473045022100C13F2C789E428CC41DC0579471EB826A1089A13DE9B85293D1879718AA03BAF102203E1A013FBEFD8F497DE5AB5890EBEA3E013BD71B38852D9B2A552EC2F3971CB781141270C5BE503A3A22B506457C0FEC97633B44F7DD")
      }
    })

  })

  describe('test transferAccount', () => {

    const to = "jEaAWgAxr8fcVSNNeKprbD7UK4JUxnCn9C";

    before(() => {
      JCCExchange.init(hosts, port, https, 1);
    })

    afterEach(() => {
      sandbox.restore();
      swtcSequence.reset();
    })

    it('transfer account successfully', async () => {
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
      const hash = await JCCExchange.transfer(testAddress, testSecret, "1", "test", to, "swt");
      expect(hash).to.equal("111111");
      expect(spy.calledOnce).to.true;
      expect(spy1.calledOnce).to.true;
      expect(spy.calledOnceWith(testAddress)).to.true;
      expect(spy1.calledOnceWith("120000220000000024000000C86140000000000F424068400000000000000A732102C13075B18C87A032226CE383AEFD748D7BB719E02CD7F5A8C1F2C7562DE7C12A7446304402202EFB141373DFB76D87C24BEBE0EAD89E145A1965894D43D6B49BE4D0D96E90E102203F660D691022F4F862CF42D2DCB0F08F51DA5A90D746CB24B435B7026D6F8BF481141270C5BE503A3A22B506457C0FEC97633B44F7DD83149AB1585226C7771B968141D07AE1F524384B61EEF9EA7C06737472696E677D0474657374E1F1")).to.true;
      expect(await swtcSequence.get()).to.equal(201);
      swtcSequence.reset();
    })

    it('get sequence failed', async () => {
      mock.onGet(/^\/exchange\/sequence\//).reply(200, {
        code: '109',
        msg: 'account is invalid'
      }, {
        date: new Date()
      })
      try {
        await JCCExchange.transfer(testAddress, testSecret, "1", "test", to, "swt");
      } catch (error) {
        expect(error.message).to.equal('account is invalid');
      }
    })

    it('local singature failed', async () => {
      mock.onGet(/^\/exchange\/sequence\//).reply(200, {
        code: '0',
        data: {
          sequence: '200'
        }
      }, {
        date: new Date()
      })
      try {
        await JCCExchange.transfer(testAddress, testSecret, "1", "test", to, "swt");
      } catch (error) {
        expect(error.message).to.equal('Value is not a number (Sequence)');
      }
    })

    it('transfer account failed: temBAD_OFFER', async () => {
      const spy = sandbox.spy(JcExchange.prototype, "getSequence");
      const spy1 = sandbox.spy(JcExchange.prototype, "transferAccount");
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
        msg: 'Malformed: Bad offer.',
        data: {
          result: "temBAD_OFFER"
        }
      }, {
        date: new Date()
      });

      try {
        await JCCExchange.transfer(testAddress, testSecret, "1", "test", to, "swt", testIssuer);
      } catch (error) {
        expect(error.message).to.equal('Malformed: Bad offer.');
      } finally {
        expect(spy.calledOnce).to.true;
        expect(spy1.calledOnce).to.true;
      }
    })

    it('transfer account failed: terPRE_SEQ', async () => {
      const spy = sandbox.spy(JcExchange.prototype, "getSequence");
      const spy1 = sandbox.spy(JcExchange.prototype, "transferAccount");

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
        msg: 'Missing/inapplicable prior transaction.',
        data: {
          result: "terPRE_SEQ"
        }
      }, {
        date: new Date()
      });

      try {
        await JCCExchange.transfer(testAddress, testSecret, "1", "test", to, "swt", testIssuer);
      } catch (error) {
        expect(error.message).to.equal('Missing/inapplicable prior transaction.');
      } finally {
        expect(spy.calledTwice).to.true;
        expect(spy1.calledTwice).to.true;
        expect(spy1.firstCall.args[0]).to.equal("120000220000000024000000C86140000000000F424068400000000000000A732102C13075B18C87A032226CE383AEFD748D7BB719E02CD7F5A8C1F2C7562DE7C12A7446304402202EFB141373DFB76D87C24BEBE0EAD89E145A1965894D43D6B49BE4D0D96E90E102203F660D691022F4F862CF42D2DCB0F08F51DA5A90D746CB24B435B7026D6F8BF481141270C5BE503A3A22B506457C0FEC97633B44F7DD83149AB1585226C7771B968141D07AE1F524384B61EEF9EA7C06737472696E677D0474657374E1F1")
        expect(spy1.secondCall.args[0]).to.equal("120000220000000024000000C86140000000000F424068400000000000000A732102C13075B18C87A032226CE383AEFD748D7BB719E02CD7F5A8C1F2C7562DE7C12A7446304402202EFB141373DFB76D87C24BEBE0EAD89E145A1965894D43D6B49BE4D0D96E90E102203F660D691022F4F862CF42D2DCB0F08F51DA5A90D746CB24B435B7026D6F8BF481141270C5BE503A3A22B506457C0FEC97633B44F7DD83149AB1585226C7771B968141D07AE1F524384B61EEF9EA7C06737472696E677D0474657374E1F1")
      }
    })

    it('transfer account failed: tefPAST_SEQ', async () => {
      const spy = sandbox.spy(JcExchange.prototype, "getSequence");
      const spy1 = sandbox.spy(JcExchange.prototype, "transferAccount");

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
        msg: 'This sequence number has already past.',
        data: {
          result: "tefPAST_SEQ"
        }
      }, {
        date: new Date()
      });
      try {
        await JCCExchange.transfer(testAddress, testSecret, "1", "test", to, "swt", testIssuer);
      } catch (error) {
        expect(error.message).to.equal('This sequence number has already past.');
      } finally {
        expect(spy.calledTwice).to.true;
        expect(spy1.calledTwice).to.true;
        expect(spy1.firstCall.args[0]).to.equal("120000220000000024000000C86140000000000F424068400000000000000A732102C13075B18C87A032226CE383AEFD748D7BB719E02CD7F5A8C1F2C7562DE7C12A7446304402202EFB141373DFB76D87C24BEBE0EAD89E145A1965894D43D6B49BE4D0D96E90E102203F660D691022F4F862CF42D2DCB0F08F51DA5A90D746CB24B435B7026D6F8BF481141270C5BE503A3A22B506457C0FEC97633B44F7DD83149AB1585226C7771B968141D07AE1F524384B61EEF9EA7C06737472696E677D0474657374E1F1")
        expect(spy1.secondCall.args[0]).to.equal("120000220000000024000000C86140000000000F424068400000000000000A732102C13075B18C87A032226CE383AEFD748D7BB719E02CD7F5A8C1F2C7562DE7C12A7446304402202EFB141373DFB76D87C24BEBE0EAD89E145A1965894D43D6B49BE4D0D96E90E102203F660D691022F4F862CF42D2DCB0F08F51DA5A90D746CB24B435B7026D6F8BF481141270C5BE503A3A22B506457C0FEC97633B44F7DD83149AB1585226C7771B968141D07AE1F524384B61EEF9EA7C06737472696E677D0474657374E1F1")
      }
    })
  })

  describe('test setBrokerage', () => {

    before(() => {
      JCCExchange.init(hosts, port, https, 1);
    })

    afterEach(() => {
      sandbox.restore();
      swtcSequence.reset();
    })

    it('transfer account successfully', async () => {
      mock.onGet(/^\/exchange\/sequence\//).reply(200, {
        code: '0',
        data: {
          sequence: 10
        }
      }, {
        date: new Date()
      })
      mock.onPost('/exchange/brokerage').reply(200, {
        code: '0',
        data: {
          hash: '95A3F55A7DD81695D511CF7F257A9B86FA9DF391B000517A38A8AE303A0CB200'
        }
      }, {
        date: new Date()
      });
      const spy = sandbox.spy(JcExchange.prototype, "getSequence");
      const spy1 = sandbox.spy(JcExchange.prototype, "setBrokerage");
      const hash = await JCCExchange.setBrokerage(platformAccount, platformSecret, feeAccount, 15, 1000, 'XXX', testIssuer1);
      expect(hash).to.equal("95A3F55A7DD81695D511CF7F257A9B86FA9DF391B000517A38A8AE303A0CB200");
      expect(spy.calledOnce).to.true
      expect(spy1.calledOnce).to.true;
      expect(spy.calledOnceWith(platformAccount)).to.true;
      expect(spy1.calledOnceWith("1200CD240000000A39000000000000000F3A00000000000003E86180000000000000000000000000000000000000005858580000000000F199AF0B483183023A9FD63FFA75AD1DFAE90CEE68400000000000000A732103EF0740D1367F37C9491063BEA541E04D18C8054CDD6DAD0BB2FBF9143810D045744630440220448DFB9E340D8C0284013E8D63A3C033E3B5E7741B346A09060A206AA13672FE0220607337AD45B39D4B7C4B0B48554F49D602EE43C5B31E65A01184BDD5D08255778114BF40A5DC91EF5047D81C041839104965F3DC23698914605D3433AC480BD784E51FC7B731258A04518D1F")).to.true;
      expect(await swtcSequence.get()).to.equal(11);
      swtcSequence.reset();
    })

    it('get sequence failed', async () => {
      mock.onGet(/^\/exchange\/sequence\//).reply(200, {
        code: '109',
        msg: 'account is invalid'
      }, {
        date: new Date()
      })
      try {
        await JCCExchange.setBrokerage(platformAccount, platformSecret, feeAccount, 0, 1000, 'XXX', testIssuer1);
      } catch (error) {
        expect(error.message).to.equal('account is invalid');
      }
    })

    it('local singature failed', async () => {
      mock.onGet(/^\/exchange\/sequence\//).reply(200, {
        code: '0',
        data: {
          sequence: '200'
        }
      }, {
        date: new Date()
      })
      try {
        await JCCExchange.setBrokerage(platformAccount, platformSecret, feeAccount, 0, 1000, 'XXX', testIssuer1);
      } catch (error) {
        expect(error.message).to.equal('Value is not a number (Sequence)');
      }
    })

  })
})