const JCCExchange = require("../lib").JCCExchange;
const chai = require("chai");
const expect = chai.expect;
const sinon = require("sinon");
const sandbox = sinon.createSandbox();
const JcNodeRpc = require("jcc_rpc").JcNodeRpc;
const exchangeInstance = require("../lib/util").exchangeInstance;
const testAddress = "jpgWGpfHz8GxqUjz5nb6ej8eZJQtiF6KhH";
const testSecret = "snfXQMEVbbZng84CcfdKDASFRi4Hf";
const testIssuer = "jGa9J9TkqtBcUoHe2zqhVFFbgUVED6o9or";

const platformAccount = "jJSEWTMsB3WFsZyoGGi977wQdTqTmkBFwV";
const platformSecret = "snJ7ufPZ3LGTfz6V7yLNWABYneLAL";
const feeAccount = "j98XXLZUCqvP4x7rgFeeYekNgZCotffBH5";
const testIssuer1 = "jPpTx4EXLUcXWrVbS98FX6TXea4EuQyyU6";

const swtcSequence = require("../lib/util").swtcSequence;

describe("test jc exchange", () => {
  describe("test init", () => {
    it("init should be a function", () => {
      expect(typeof JCCExchange.init).to.equal("function");
    });

    it("call init", () => {
      JCCExchange.init([]);
      expect(JCCExchange.urls).to.deep.equal([]);
      expect(JCCExchange.retry).to.equal(3);
      JCCExchange.init([], 2);
      expect(JCCExchange.urls).to.deep.equal([]);
      expect(JCCExchange.retry).to.equal(2);
      JCCExchange.init(["localhost"], 80, false, 2);
      expect(JCCExchange.urls).to.deep.equal(["http://localhost:80"]);
      expect(JCCExchange.retry).to.equal(2);
      JCCExchange.init(["localhost"], 443, true);
      expect(JCCExchange.urls).to.deep.equal(["https://localhost:443"]);
      expect(JCCExchange.retry).to.equal(3);
      expect(() => JCCExchange.init(["localhost"], 443, true, 4, 5)).throws("arguments does not match");
    });
  });

  describe("test destroy", () => {
    it("destroy should be a function", () => {
      expect(typeof JCCExchange.destroy).to.equal("function");
    });

    it("destroy should be called once", () => {
      const spy = sandbox.spy(exchangeInstance, "destroy");
      JCCExchange.destroy();
      expect(spy.calledOnce).to.true;
      sandbox.restore();
    });
  });

  describe("test createOrder", () => {
    before(() => {
      JCCExchange.init([], 1);
    });

    afterEach(() => {
      sandbox.restore();
      swtcSequence.clear();
    });

    it("create order successfully", async () => {
      const stub = sandbox.stub(JcNodeRpc.prototype, "getSequence");
      stub.resolves(200);
      const stub1 = sandbox.stub(JcNodeRpc.prototype, "createOrder");
      stub1.resolves({
        result: {
          engine_result: "tesSUCCESS",
          tx_json: {
            hash: "111"
          }
        }
      });
      const hash = await JCCExchange.createOrder(testAddress, testSecret, "1", "jjcc", "cny", "1", "buy");
      expect(hash).to.equal("111");
      expect(stub.calledOnceWithExactly(testAddress)).to.true;
      expect(
        stub1.calledOnceWithExactly(
          "120007220000000024000000C864D4838D7EA4C6800000000000000000000000004A4A43430000000000A582E432BFC48EEDEF852C814EC57F3CD2D4159665D4838D7EA4C68000000000000000000000000000434E590000000000A582E432BFC48EEDEF852C814EC57F3CD2D4159668400000000000000A732102C13075B18C87A032226CE383AEFD748D7BB719E02CD7F5A8C1F2C7562DE7C12A7446304402204BAE7257177ECB10E43FBD06C8158F1AC2290A44081B796C9BD47725536A9B9902200D9D86C1479F482D207BF9CEAC66FD9D7BE9498110A566EC69A713AAB0D3E95281141270C5BE503A3A22B506457C0FEC97633B44F7DD8D14896E3F7353697ECE52645D9C502F08BB2EDC5717"
        )
      ).to.true;
      expect(await swtcSequence.get(null, testAddress)).to.equal(201);
    });

    it("if the type is wrong", async () => {
      try {
        await JCCExchange.createOrder(testAddress, testSecret, "1", "jjcc", "cny", "1", "", "", testIssuer);
      } catch (error) {
        expect(error.message).to.equal("The type of creating order should be one of 'buy' and 'sell'");
      }
    });

    it("get sequence failed", async () => {
      const stub = sandbox.stub(JcNodeRpc.prototype, "getSequence");
      stub.rejects(new Error("account is invalid"));
      try {
        await JCCExchange.createOrder(testAddress, testSecret, "1", "jjcc", "cny", "1", "buy", testIssuer);
      } catch (error) {
        expect(error.message).to.equal("account is invalid");
      }
    });

    it("local singature failed", async () => {
      const stub = sandbox.stub(JcNodeRpc.prototype, "getSequence");
      stub.resolves(200);
      try {
        await JCCExchange.createOrder(testAddress, "", "1", "jjcc", "cny", "1", "buy", testIssuer);
      } catch (error) {
        expect(error.message).to.equal("Unknown datatype. (SigningPubKey)");
      }
    });

    it("create order failed: temBAD_OFFER", async () => {
      const stub = sandbox.stub(JcNodeRpc.prototype, "getSequence");
      stub.resolves(200);
      const stub1 = sandbox.stub(JcNodeRpc.prototype, "createOrder");
      stub1.resolves({
        result: {
          engine_result: "temBAD_OFFER",
          engine_result_message: "Malformed: Bad offer.",
          status: "success"
        }
      });
      try {
        await JCCExchange.createOrder(testAddress, testSecret, "1", "jjcc", "cny", "1", "buy", testIssuer);
      } catch (error) {
        expect(error.message).to.equal("Malformed: Bad offer.");
      } finally {
        expect(stub.calledOnce).to.true;
        expect(stub1.calledOnce).to.true;
      }
    });

    it("create order failed: terPRE_SEQ", async () => {
      const stub = sandbox.stub(JcNodeRpc.prototype, "getSequence");
      stub.resolves(200);
      const stub1 = sandbox.stub(JcNodeRpc.prototype, "createOrder");
      stub1.resolves({
        result: {
          engine_result: "terPRE_SEQ",
          engine_result_message: "Missing/inapplicable prior transaction.",
          status: "success"
        }
      });
      try {
        await JCCExchange.createOrder(testAddress, testSecret, "1", "jjcc", "cny", "1", "buy");
      } catch (error) {
        expect(error.message).to.equal("Missing/inapplicable prior transaction.");
      } finally {
        expect(stub.calledTwice).to.true;
        expect(stub1.calledTwice).to.true;
        expect(stub1.firstCall.args[0]).to.equal(
          "120007220000000024000000C864D4838D7EA4C6800000000000000000000000004A4A43430000000000A582E432BFC48EEDEF852C814EC57F3CD2D4159665D4838D7EA4C68000000000000000000000000000434E590000000000A582E432BFC48EEDEF852C814EC57F3CD2D4159668400000000000000A732102C13075B18C87A032226CE383AEFD748D7BB719E02CD7F5A8C1F2C7562DE7C12A7446304402204BAE7257177ECB10E43FBD06C8158F1AC2290A44081B796C9BD47725536A9B9902200D9D86C1479F482D207BF9CEAC66FD9D7BE9498110A566EC69A713AAB0D3E95281141270C5BE503A3A22B506457C0FEC97633B44F7DD8D14896E3F7353697ECE52645D9C502F08BB2EDC5717"
        );
        expect(stub1.secondCall.args[0]).to.equal(
          "120007220000000024000000C864D4838D7EA4C6800000000000000000000000004A4A43430000000000A582E432BFC48EEDEF852C814EC57F3CD2D4159665D4838D7EA4C68000000000000000000000000000434E590000000000A582E432BFC48EEDEF852C814EC57F3CD2D4159668400000000000000A732102C13075B18C87A032226CE383AEFD748D7BB719E02CD7F5A8C1F2C7562DE7C12A7446304402204BAE7257177ECB10E43FBD06C8158F1AC2290A44081B796C9BD47725536A9B9902200D9D86C1479F482D207BF9CEAC66FD9D7BE9498110A566EC69A713AAB0D3E95281141270C5BE503A3A22B506457C0FEC97633B44F7DD8D14896E3F7353697ECE52645D9C502F08BB2EDC5717"
        );
      }
    });

    it("create order failed: tefPAST_SEQ", async () => {
      const stub = sandbox.stub(JcNodeRpc.prototype, "getSequence");
      stub.resolves(200);
      const stub1 = sandbox.stub(JcNodeRpc.prototype, "createOrder");
      stub1.resolves({
        result: {
          engine_result: "tefPAST_SEQ",
          engine_result_message: "This sequence number has already past.",
          status: "success"
        }
      });
      try {
        await JCCExchange.createOrder(testAddress, testSecret, "1", "jjcc", "cny", "1", "buy");
      } catch (error) {
        expect(error.message).to.equal("This sequence number has already past.");
      } finally {
        expect(stub.calledTwice).to.true;
        expect(stub1.calledTwice).to.true;
        expect(stub1.firstCall.args[0]).to.equal(
          "120007220000000024000000C864D4838D7EA4C6800000000000000000000000004A4A43430000000000A582E432BFC48EEDEF852C814EC57F3CD2D4159665D4838D7EA4C68000000000000000000000000000434E590000000000A582E432BFC48EEDEF852C814EC57F3CD2D4159668400000000000000A732102C13075B18C87A032226CE383AEFD748D7BB719E02CD7F5A8C1F2C7562DE7C12A7446304402204BAE7257177ECB10E43FBD06C8158F1AC2290A44081B796C9BD47725536A9B9902200D9D86C1479F482D207BF9CEAC66FD9D7BE9498110A566EC69A713AAB0D3E95281141270C5BE503A3A22B506457C0FEC97633B44F7DD8D14896E3F7353697ECE52645D9C502F08BB2EDC5717"
        );
        expect(stub1.secondCall.args[0]).to.equal(
          "120007220000000024000000C864D4838D7EA4C6800000000000000000000000004A4A43430000000000A582E432BFC48EEDEF852C814EC57F3CD2D4159665D4838D7EA4C68000000000000000000000000000434E590000000000A582E432BFC48EEDEF852C814EC57F3CD2D4159668400000000000000A732102C13075B18C87A032226CE383AEFD748D7BB719E02CD7F5A8C1F2C7562DE7C12A7446304402204BAE7257177ECB10E43FBD06C8158F1AC2290A44081B796C9BD47725536A9B9902200D9D86C1479F482D207BF9CEAC66FD9D7BE9498110A566EC69A713AAB0D3E95281141270C5BE503A3A22B506457C0FEC97633B44F7DD8D14896E3F7353697ECE52645D9C502F08BB2EDC5717"
        );
      }
    });
  });

  describe("test cancelOrder", () => {
    before(() => {
      JCCExchange.init([], 2);
    });

    afterEach(() => {
      sandbox.restore();
      swtcSequence.clear();
    });

    it("cancel order successfully", async () => {
      const stub = sandbox.stub(JcNodeRpc.prototype, "getSequence");
      stub.resolves(200);
      const stub1 = sandbox.stub(JcNodeRpc.prototype, "cancelOrder");
      stub1.resolves({
        result: {
          engine_result: "tesSUCCESS",
          tx_json: {
            hash: "1111"
          }
        }
      });

      const hash = await JCCExchange.cancelOrder(testAddress, testSecret, 200);
      expect(hash).to.equal("1111");
      expect(stub.calledOnceWithExactly(testAddress)).to.true;
      expect(
        stub1.calledOnceWithExactly("120008220000000024000000C82019000000C868400000000000000A732102C13075B18C87A032226CE383AEFD748D7BB719E02CD7F5A8C1F2C7562DE7C12A74473045022100C13F2C789E428CC41DC0579471EB826A1089A13DE9B85293D1879718AA03BAF102203E1A013FBEFD8F497DE5AB5890EBEA3E013BD71B38852D9B2A552EC2F3971CB781141270C5BE503A3A22B506457C0FEC97633B44F7DD")
      ).to.true;
      expect(await swtcSequence.get(null, testAddress)).to.equal(201);
    });

    it("get sequence failed", async () => {
      const stub = sandbox.stub(JcNodeRpc.prototype, "getSequence");
      stub.rejects(new Error("account is invalid"));

      try {
        await JCCExchange.cancelOrder(testAddress, testSecret, 200);
      } catch (error) {
        expect(error.message).to.equal("account is invalid");
      }
    });

    it("local singature failed", async () => {
      const stub = sandbox.stub(JcNodeRpc.prototype, "getSequence");
      stub.resolves("200");

      try {
        await JCCExchange.cancelOrder(testAddress, testSecret, 200);
      } catch (error) {
        expect(error.message).to.equal("Value is not a number (Sequence)");
      }
    });

    it("cancel order failed: temBAD_OFFER", async () => {
      const stub = sandbox.stub(JcNodeRpc.prototype, "getSequence");
      stub.resolves(200);
      const stub1 = sandbox.stub(JcNodeRpc.prototype, "cancelOrder");
      stub1.resolves({
        result: {
          engine_result: "temBAD_OFFER",
          engine_result_message: "Malformed: Bad offer.",
          status: "success"
        }
      });

      try {
        await JCCExchange.cancelOrder(testAddress, testSecret, 200, testIssuer);
      } catch (error) {
        expect(error.message).to.equal("Malformed: Bad offer.");
      } finally {
        expect(stub.calledOnce).to.true;
        expect(stub1.calledOnce).to.true;
      }
    });

    it("cancel order failed: terPRE_SEQ", async () => {
      const stub = sandbox.stub(JcNodeRpc.prototype, "getSequence");
      stub.resolves(200);
      const stub1 = sandbox.stub(JcNodeRpc.prototype, "cancelOrder");
      stub1.resolves({
        result: {
          engine_result: "terPRE_SEQ",
          engine_result_message: "Missing/inapplicable prior transaction.",
          status: "success"
        }
      });

      try {
        await JCCExchange.cancelOrder(testAddress, testSecret, 200, testIssuer);
      } catch (error) {
        expect(error.message).to.equal("Missing/inapplicable prior transaction.");
      } finally {
        expect(stub.calledThrice).to.true;
        expect(stub1.calledThrice).to.true;
        expect(stub1.firstCall.args[0]).to.equal(
          "120008220000000024000000C82019000000C868400000000000000A732102C13075B18C87A032226CE383AEFD748D7BB719E02CD7F5A8C1F2C7562DE7C12A74473045022100C13F2C789E428CC41DC0579471EB826A1089A13DE9B85293D1879718AA03BAF102203E1A013FBEFD8F497DE5AB5890EBEA3E013BD71B38852D9B2A552EC2F3971CB781141270C5BE503A3A22B506457C0FEC97633B44F7DD"
        );
        expect(stub1.secondCall.args[0]).to.equal(
          "120008220000000024000000C82019000000C868400000000000000A732102C13075B18C87A032226CE383AEFD748D7BB719E02CD7F5A8C1F2C7562DE7C12A74473045022100C13F2C789E428CC41DC0579471EB826A1089A13DE9B85293D1879718AA03BAF102203E1A013FBEFD8F497DE5AB5890EBEA3E013BD71B38852D9B2A552EC2F3971CB781141270C5BE503A3A22B506457C0FEC97633B44F7DD"
        );
      }
    });

    it("cancel order failed: tefPAST_SEQ", async () => {
      const stub = sandbox.stub(JcNodeRpc.prototype, "getSequence");
      stub.resolves(200);
      const stub1 = sandbox.stub(JcNodeRpc.prototype, "cancelOrder");
      stub1.resolves({
        result: {
          engine_result: "tefPAST_SEQ",
          engine_result_message: "This sequence number has already past.",
          status: "success"
        }
      });
      try {
        await JCCExchange.cancelOrder(testAddress, testSecret, 200, testIssuer);
      } catch (error) {
        expect(error.message).to.equal("This sequence number has already past.");
      } finally {
        expect(stub.calledThrice).to.true;
        expect(stub1.calledThrice).to.true;
        expect(stub1.firstCall.args[0]).to.equal(
          "120008220000000024000000C82019000000C868400000000000000A732102C13075B18C87A032226CE383AEFD748D7BB719E02CD7F5A8C1F2C7562DE7C12A74473045022100C13F2C789E428CC41DC0579471EB826A1089A13DE9B85293D1879718AA03BAF102203E1A013FBEFD8F497DE5AB5890EBEA3E013BD71B38852D9B2A552EC2F3971CB781141270C5BE503A3A22B506457C0FEC97633B44F7DD"
        );
        expect(stub1.secondCall.args[0]).to.equal(
          "120008220000000024000000C82019000000C868400000000000000A732102C13075B18C87A032226CE383AEFD748D7BB719E02CD7F5A8C1F2C7562DE7C12A74473045022100C13F2C789E428CC41DC0579471EB826A1089A13DE9B85293D1879718AA03BAF102203E1A013FBEFD8F497DE5AB5890EBEA3E013BD71B38852D9B2A552EC2F3971CB781141270C5BE503A3A22B506457C0FEC97633B44F7DD"
        );
      }
    });
  });

  describe("test transfer", () => {
    const to = "jEaAWgAxr8fcVSNNeKprbD7UK4JUxnCn9C";

    before(() => {
      JCCExchange.init([], 1);
    });

    afterEach(() => {
      sandbox.restore();
      swtcSequence.clear();
    });

    it("transfer account successfully", async () => {
      const stub = sandbox.stub(JcNodeRpc.prototype, "getSequence");
      stub.resolves(200);
      const stub1 = sandbox.stub(JcNodeRpc.prototype, "transfer");
      stub1.resolves({
        result: {
          engine_result: "tesSUCCESS",
          tx_json: {
            hash: "111111"
          }
        }
      });
      const hash = await JCCExchange.transfer(testAddress, testSecret, "1", "test", to, "swt");
      expect(hash).to.equal("111111");
      expect(stub.calledOnce).to.true;
      expect(stub1.calledOnce).to.true;
      expect(stub.calledOnceWithExactly(testAddress)).to.true;
      expect(
        stub1.calledOnceWithExactly(
          "120000220000000024000000C86140000000000F424068400000000000000A732102C13075B18C87A032226CE383AEFD748D7BB719E02CD7F5A8C1F2C7562DE7C12A7446304402202EFB141373DFB76D87C24BEBE0EAD89E145A1965894D43D6B49BE4D0D96E90E102203F660D691022F4F862CF42D2DCB0F08F51DA5A90D746CB24B435B7026D6F8BF481141270C5BE503A3A22B506457C0FEC97633B44F7DD83149AB1585226C7771B968141D07AE1F524384B61EEF9EA7C06737472696E677D0474657374E1F1"
        )
      ).to.true;
      expect(await swtcSequence.get(null, testAddress)).to.equal(201);
    });

    it("get sequence failed", async () => {
      const stub = sandbox.stub(JcNodeRpc.prototype, "getSequence");
      stub.rejects(new Error("account is invalid"));

      try {
        await JCCExchange.transfer(testAddress, testSecret, "1", "test", to, "swt");
      } catch (error) {
        expect(error.message).to.equal("account is invalid");
      }
    });

    it("local singature failed", async () => {
      const stub = sandbox.stub(JcNodeRpc.prototype, "getSequence");
      stub.resolves("200");

      try {
        await JCCExchange.transfer(testAddress, testSecret, "1", "test", to, "swt");
      } catch (error) {
        expect(error.message).to.equal("Value is not a number (Sequence)");
      }
    });

    it("transfer account failed: temBAD_OFFER", async () => {
      const stub = sandbox.stub(JcNodeRpc.prototype, "getSequence");
      stub.resolves(200);
      const stub1 = sandbox.stub(JcNodeRpc.prototype, "transfer");
      stub1.resolves({
        result: {
          engine_result: "temBAD_OFFER",
          engine_result_message: "Malformed: Bad offer.",
          status: "success"
        }
      });
      try {
        await JCCExchange.transfer(testAddress, testSecret, "1", "test", to, "swt", testIssuer);
      } catch (error) {
        expect(error.message).to.equal("Malformed: Bad offer.");
      } finally {
        expect(stub.calledOnce).to.true;
        expect(stub1.calledOnce).to.true;
      }
    });

    it("transfer account failed: terPRE_SEQ", async () => {
      const stub = sandbox.stub(JcNodeRpc.prototype, "getSequence");
      stub.resolves(200);
      const stub1 = sandbox.stub(JcNodeRpc.prototype, "transfer");
      stub1.resolves({
        result: {
          engine_result: "terPRE_SEQ",
          engine_result_message: "Missing/inapplicable prior transaction.",
          status: "success"
        }
      });

      try {
        await JCCExchange.transfer(testAddress, testSecret, "1", "test", to, "swt", testIssuer);
      } catch (error) {
        expect(error.message).to.equal("Missing/inapplicable prior transaction.");
      } finally {
        expect(stub.calledTwice).to.true;
        expect(stub1.calledTwice).to.true;
        expect(stub1.firstCall.args[0]).to.equal(
          "120000220000000024000000C86140000000000F424068400000000000000A732102C13075B18C87A032226CE383AEFD748D7BB719E02CD7F5A8C1F2C7562DE7C12A7446304402202EFB141373DFB76D87C24BEBE0EAD89E145A1965894D43D6B49BE4D0D96E90E102203F660D691022F4F862CF42D2DCB0F08F51DA5A90D746CB24B435B7026D6F8BF481141270C5BE503A3A22B506457C0FEC97633B44F7DD83149AB1585226C7771B968141D07AE1F524384B61EEF9EA7C06737472696E677D0474657374E1F1"
        );
        expect(stub1.secondCall.args[0]).to.equal(
          "120000220000000024000000C86140000000000F424068400000000000000A732102C13075B18C87A032226CE383AEFD748D7BB719E02CD7F5A8C1F2C7562DE7C12A7446304402202EFB141373DFB76D87C24BEBE0EAD89E145A1965894D43D6B49BE4D0D96E90E102203F660D691022F4F862CF42D2DCB0F08F51DA5A90D746CB24B435B7026D6F8BF481141270C5BE503A3A22B506457C0FEC97633B44F7DD83149AB1585226C7771B968141D07AE1F524384B61EEF9EA7C06737472696E677D0474657374E1F1"
        );
      }
    });

    it("transfer account failed: tefPAST_SEQ", async () => {
      const stub = sandbox.stub(JcNodeRpc.prototype, "getSequence");
      stub.resolves(200);
      const stub1 = sandbox.stub(JcNodeRpc.prototype, "transfer");
      stub1.resolves({
        result: {
          engine_result: "tefPAST_SEQ",
          engine_result_message: "This sequence number has already past.",
          status: "success"
        }
      });
      try {
        await JCCExchange.transfer(testAddress, testSecret, "1", "test", to, "swt", testIssuer);
      } catch (error) {
        expect(error.message).to.equal("This sequence number has already past.");
      } finally {
        expect(stub.calledTwice).to.true;
        expect(stub1.calledTwice).to.true;
        expect(stub1.firstCall.args[0]).to.equal(
          "120000220000000024000000C86140000000000F424068400000000000000A732102C13075B18C87A032226CE383AEFD748D7BB719E02CD7F5A8C1F2C7562DE7C12A7446304402202EFB141373DFB76D87C24BEBE0EAD89E145A1965894D43D6B49BE4D0D96E90E102203F660D691022F4F862CF42D2DCB0F08F51DA5A90D746CB24B435B7026D6F8BF481141270C5BE503A3A22B506457C0FEC97633B44F7DD83149AB1585226C7771B968141D07AE1F524384B61EEF9EA7C06737472696E677D0474657374E1F1"
        );
        expect(stub1.secondCall.args[0]).to.equal(
          "120000220000000024000000C86140000000000F424068400000000000000A732102C13075B18C87A032226CE383AEFD748D7BB719E02CD7F5A8C1F2C7562DE7C12A7446304402202EFB141373DFB76D87C24BEBE0EAD89E145A1965894D43D6B49BE4D0D96E90E102203F660D691022F4F862CF42D2DCB0F08F51DA5A90D746CB24B435B7026D6F8BF481141270C5BE503A3A22B506457C0FEC97633B44F7DD83149AB1585226C7771B968141D07AE1F524384B61EEF9EA7C06737472696E677D0474657374E1F1"
        );
      }
    });
  });

  describe("test setBrokerage", () => {
    before(() => {
      JCCExchange.init([], 1);
    });

    afterEach(() => {
      sandbox.restore();
      swtcSequence.clear();
    });

    it("set brokerage successfully", async () => {
      const stub = sandbox.stub(JcNodeRpc.prototype, "getSequence");
      stub.resolves(10);
      const stub1 = sandbox.stub(JcNodeRpc.prototype, "setBrokerage");
      stub1.resolves({
        result: {
          engine_result: "tesSUCCESS",
          tx_json: {
            hash: "95A3F55A7DD81695D511CF7F257A9B86FA9DF391B000517A38A8AE303A0CB200"
          }
        }
      });
      const hash = await JCCExchange.setBrokerage(platformAccount, platformSecret, feeAccount, 15, 1000, "XXX");
      expect(hash).to.equal("95A3F55A7DD81695D511CF7F257A9B86FA9DF391B000517A38A8AE303A0CB200");
      expect(stub.calledOnce).to.true;
      expect(stub1.calledOnce).to.true;
      expect(stub.calledOnceWithExactly(platformAccount)).to.true;
      expect(
        stub1.calledOnceWithExactly(
          "1200CD240000000A39000000000000000F3A00000000000003E86180000000000000000000000000000000000000005858580000000000A582E432BFC48EEDEF852C814EC57F3CD2D4159668400000000000000A732103EF0740D1367F37C9491063BEA541E04D18C8054CDD6DAD0BB2FBF9143810D04574473045022100D2F9C3341B0CD666D6A78DE5296AAB8C3462FD8B59AD3888D8A202DAC2974E5602205E4435D2D1148ACBF608679ACB3ACE7944BA2CE3CC50463CAF4701D200CEFBA88114BF40A5DC91EF5047D81C041839104965F3DC23698914605D3433AC480BD784E51FC7B731258A04518D1F"
        )
      ).to.true;
      expect(await swtcSequence.get(null, platformAccount)).to.equal(11);
    });

    it("get sequence failed", async () => {
      const stub = sandbox.stub(JcNodeRpc.prototype, "getSequence");
      stub.rejects(new Error("account is invalid"));

      try {
        await JCCExchange.setBrokerage(platformAccount, platformSecret, feeAccount, 0, 1000, "XXX", testIssuer1);
      } catch (error) {
        expect(error.message).to.equal("account is invalid");
      }
    });

    it("local singature failed", async () => {
      const stub = sandbox.stub(JcNodeRpc.prototype, "getSequence");
      stub.resolves("200");
      try {
        await JCCExchange.setBrokerage(platformAccount, platformSecret, feeAccount, 0, 1000, "XXX", testIssuer1);
      } catch (error) {
        expect(error.message).to.equal("Value is not a number (Sequence)");
      }
    });
  });
});
