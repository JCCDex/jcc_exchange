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
const chainConfig = require("../lib/util/config").chainConfig;

const platformAccount = "jJSEWTMsB3WFsZyoGGi977wQdTqTmkBFwV";
const platformSecret = "snJ7ufPZ3LGTfz6V7yLNWABYneLAL";
const feeAccount = "j98XXLZUCqvP4x7rgFeeYekNgZCotffBH5";
const testIssuer1 = "jPpTx4EXLUcXWrVbS98FX6TXea4EuQyyU6";

const ed25519Secret = "sEd7qWKPgDpdSGPdPwDnYB6k7KJx1zs";
const ed25519Address = "jwhzx39pNqwSwnij3F9haQv1Y56EzWvDWJ";

const multiSignAddress1 = "jhX4p7P6B5u3NummfT243QxbCGaDsZtHF4";
// const multiSignSecret1 = "spogi3d9UdoUC3Yq5Nyn9Pd7WMkW6";
const multiSignAddress2 = "jEvBVzUXM9Lg4CbuXZ3MeSRYdrKtXZi4c";
// const multiSignSecret2 = "ssEpQ3zoWjm5bCzz5L3FfEMbhdNYE";
const multiSignAddress3 = "jqqznoU8kkAaF3tCnsLPQ8AZwDQ2cexgh";
// const multiSignSecret3 = "shX7ytb9bsVBwevyDdXBKVMvErGto";

const signEntries = [
  {
    SignerEntry: {
      Account: multiSignAddress1,
      SignerWeight: 1
    }
  },
  {
    SignerEntry: {
      Account: multiSignAddress2,
      SignerWeight: 1
    }
  },
  {
    SignerEntry: {
      Account: multiSignAddress3,
      SignerWeight: 1
    }
  }
];
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
      expect(JCCExchange.retry).to.equal(1);
      JCCExchange.init(["localhost"], 443, true);
      expect(JCCExchange.urls).to.deep.equal(["https://localhost:443"]);
      expect(JCCExchange.retry).to.equal(1);
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

  describe("test setDefaultChain", () => {
    after(() => {
      JCCExchange.setDefaultChain("jingtum");
    });
    it("setDefaultChain should be a function", () => {
      expect(typeof JCCExchange.setDefaultChain).to.equal("function");
    });

    it("need change default config of chain", () => {
      let config = chainConfig.getDefaultConfig();
      expect(config).to.deep.equal({ nativeToken: "SWT", minGas: 10 });
      JCCExchange.setDefaultChain("bizain");
      config = chainConfig.getDefaultConfig();
      expect(config).to.deep.equal({ nativeToken: "BWT", minGas: 10 });
      JCCExchange.setDefaultChain("seaaps");
      config = chainConfig.getDefaultConfig();
      expect(config).to.deep.equal({ nativeToken: "SEAA", minGas: 10000 });
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

    it("create order successfully when wallet's type is secp256k1", async () => {
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

    it("create order successfully when wallet's type is ed25519", async () => {
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
      const hash = await JCCExchange.createOrder(ed25519Address, ed25519Secret, "1", "jjcc", "cny", "1", "buy");
      expect(hash).to.equal("111");
      expect(stub.calledOnceWithExactly(ed25519Address)).to.true;
      expect(
        stub1.calledOnceWithExactly(
          "120007220000000024000000C864D4838D7EA4C6800000000000000000000000004A4A43430000000000A582E432BFC48EEDEF852C814EC57F3CD2D4159665D4838D7EA4C68000000000000000000000000000434E590000000000A582E432BFC48EEDEF852C814EC57F3CD2D4159668400000000000000A7321ED215352EE2DEC2816E3AC33785269762C1690ABAB037DC585461A33A748E090D2744053CD660981CD2C4CABB55644458A33B2A1DF1A9BB0BE5C4482DB36FA2AF5DBCF2E00B2791E8FC1E1713FAB7AF03904D0607D00B32D5A8EFFB2C81120E27521028114637AC1269B71499D3E752ECADD1D50FF0BEE27BE8D14896E3F7353697ECE52645D9C502F08BB2EDC5717"
        )
      ).to.true;
      expect(await swtcSequence.get(null, ed25519Address)).to.equal(201);
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

    it("local signature failed", async () => {
      const stub = sandbox.stub(JcNodeRpc.prototype, "getSequence");
      stub.resolves("4");
      try {
        await JCCExchange.createOrder(testAddress, testSecret, "1", "jjcc", "cny", "1", "buy", testIssuer);
      } catch (error) {
        expect(error.message).to.equal("Value is not a number 4 (Sequence)");
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

    it("cancel order successfully when wallet's type is secp256k1", async () => {
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

    it("cancel order successfully when wallet's type is ed25519", async () => {
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

      const hash = await JCCExchange.cancelOrder(ed25519Address, ed25519Secret, 200);
      expect(hash).to.equal("1111");
      expect(stub.calledOnceWithExactly(ed25519Address)).to.true;
      expect(stub1.calledOnceWithExactly("120008220000000024000000C82019000000C868400000000000000A7321ED215352EE2DEC2816E3AC33785269762C1690ABAB037DC585461A33A748E090D2744021E7277887D3EFABB59FF154BB26B959627BA0E1D58CBD22CD8A5725ADF14DBA56A28808E5C3401DFF1C7C20F19BD1B398C9F3C69AB8293A0A672EC1B7186A008114637AC1269B71499D3E752ECADD1D50FF0BEE27BE")).to.true;
      expect(await swtcSequence.get(null, ed25519Address)).to.equal(201);
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
        expect(error.message).to.equal("Value is not a number 4 (Sequence)");
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

    it("transfer account successfully when wallet's type is secp256k1", async () => {
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

    it("transfer account successfully when wallet's type is ed25519", async () => {
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
      const hash = await JCCExchange.transfer(ed25519Address, ed25519Secret, "1", "test", to, "swt");
      expect(hash).to.equal("111111");
      expect(stub.calledOnce).to.true;
      expect(stub1.calledOnce).to.true;
      expect(stub.calledOnceWithExactly(ed25519Address)).to.true;
      expect(
        stub1.calledOnceWithExactly(
          "120000220000000024000000C86140000000000F424068400000000000000A7321ED215352EE2DEC2816E3AC33785269762C1690ABAB037DC585461A33A748E090D274407872A3711FCC8D68D3C5E93A89642A1A27EF15727050B0395B5A7929DB1E2C1995EEC56BD29EF7059140F4DFA7A0307EC872B93959EBA1E54254E7B9BBD5380F8114637AC1269B71499D3E752ECADD1D50FF0BEE27BE83149AB1585226C7771B968141D07AE1F524384B61EEF9EA7C06737472696E677D0474657374E1F1"
        )
      ).to.true;
      expect(await swtcSequence.get(null, ed25519Address)).to.equal(201);
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
        expect(error.message).to.equal("Value is not a number 4 (Sequence)");
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

    it("set brokerage successfully when wallet's type is secp256k1", async () => {
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

    it("set brokerage successfully when wallet's type is ed25519", async () => {
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
      const hash = await JCCExchange.setBrokerage(ed25519Address, ed25519Secret, feeAccount, 15, 1000, "XXX");
      expect(hash).to.equal("95A3F55A7DD81695D511CF7F257A9B86FA9DF391B000517A38A8AE303A0CB200");
      expect(stub.calledOnce).to.true;
      expect(stub1.calledOnce).to.true;
      expect(stub.calledOnceWithExactly(ed25519Address)).to.true;
      expect(
        stub1.calledOnceWithExactly(
          "1200CD240000000A39000000000000000F3A00000000000003E86180000000000000000000000000000000000000005858580000000000A582E432BFC48EEDEF852C814EC57F3CD2D4159668400000000000000A7321ED215352EE2DEC2816E3AC33785269762C1690ABAB037DC585461A33A748E090D27440124AC99FFB33372982D09FF8848E172EAC79BD2E63393CFA645BB06160CA661DBBD135BE0B439505974179E5DF60208B13E21E8838C98F9F0E12101420A0350C8114637AC1269B71499D3E752ECADD1D50FF0BEE27BE8914605D3433AC480BD784E51FC7B731258A04518D1F"
        )
      ).to.true;
      expect(await swtcSequence.get(null, ed25519Address)).to.equal(11);
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
        expect(error.message).to.equal("Value is not a number 4 (Sequence)");
      }
    });
  });

  describe("test setSignerList", () => {
    before(() => {
      JCCExchange.init([], 1);
    });

    afterEach(() => {
      sandbox.restore();
      swtcSequence.clear();
    });

    it("set signer list successfully when wallet's type is secp256k1", async () => {
      const stub = sandbox.stub(JcNodeRpc.prototype, "getSequence");
      stub.resolves(10);
      const stub1 = sandbox.stub(JcNodeRpc.prototype, "setSignerList");
      stub1.resolves({
        result: {
          engine_result: "tesSUCCESS",
          tx_json: {
            hash: "95A3F55A7DD81695D511CF7F257A9B86FA9DF391B000517A38A8AE303A0CB200"
          }
        }
      });

      const hash = await JCCExchange.setSignerList(platformAccount, platformSecret, 2, signEntries);
      expect(hash).to.equal("95A3F55A7DD81695D511CF7F257A9B86FA9DF391B000517A38A8AE303A0CB200");
      expect(stub.calledOnce).to.true;
      expect(stub1.calledOnce).to.true;
      expect(stub.calledOnceWithExactly(platformAccount)).to.true;
      expect(
        stub1.calledOnceWithExactly(
          "1200CF240000000A20260000000268400000000000000A732103EF0740D1367F37C9491063BEA541E04D18C8054CDD6DAD0BB2FBF9143810D04574473045022100CD50A9D7D9386F9064F12FCE669B75B3C631E1079321864685849FA7EF3BA00F02205A8BB71B1379F0F0DF6CDF00971040C38F2C55C55F8EA53E8E7C1A25BB7C56148114BF40A5DC91EF5047D81C041839104965F3DC2369FBEC130001811426A668459250D62BF47C5B70F4D7AE9D530B131BE1EC130001811402D2377D299513820E655D42689C8BAAD8675143E1EC1300018114093CDB299FE29E3666B6D1D4287C3A775BB394F2E1F1"
        )
      ).to.true;
      expect(await swtcSequence.get(null, platformAccount)).to.equal(11);
    });
  });

  describe("test setAccount", () => {
    before(() => {
      JCCExchange.init([], 1);
    });

    afterEach(() => {
      sandbox.restore();
      swtcSequence.clear();
    });

    it("set account successfully when wallet's type is secp256k1", async () => {
      const stub = sandbox.stub(JcNodeRpc.prototype, "getSequence");
      stub.resolves(10);
      const stub1 = sandbox.stub(JcNodeRpc.prototype, "setAccount");
      stub1.resolves({
        result: {
          engine_result: "tesSUCCESS",
          tx_json: {
            hash: "95A3F55A7DD81695D511CF7F257A9B86FA9DF391B000517A38A8AE303A0CB200"
          }
        }
      });

      const hash = await JCCExchange.setAccount(platformAccount, platformSecret, true);
      expect(hash).to.equal("95A3F55A7DD81695D511CF7F257A9B86FA9DF391B000517A38A8AE303A0CB200");
      expect(stub.calledOnce).to.true;
      expect(stub1.calledOnce).to.true;
      expect(stub.calledOnceWithExactly(platformAccount)).to.true;
      expect(stub1.calledOnceWithExactly("120003240000000A20210000000468400000000000000A732103EF0740D1367F37C9491063BEA541E04D18C8054CDD6DAD0BB2FBF9143810D04574473045022100B1651973CB5806E4071BEFF51E585AA21833CEDCC48BC8E4C140AFCDDE6EE0E302202392AE7D961D103CA2BEBACF1051D280B7EA419BA261FDE8D310ADB1F715D7878114BF40A5DC91EF5047D81C041839104965F3DC2369")).to.true;
      expect(await swtcSequence.get(null, platformAccount)).to.equal(11);
    });
  });

  describe("test transfer when chain is bizain", () => {
    const address = "bMAy4Pu8CSf5apR44HbYyLFKeC9Dbau16Q";
    const secret = "ssySqG4BhxpngV2FjAe1SJYFD4dcm";
    const to = "bPyxKVZUbKQHwkU41oGCGcFRKaVxpCxSDT";

    before(() => {
      JCCExchange.init([], 1);
      JCCExchange.setDefaultChain("bizain");
    });

    afterEach(() => {
      sandbox.restore();
      swtcSequence.clear();
    });

    after(() => {
      JCCExchange.setDefaultChain("jingtum");
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
      const hash = await JCCExchange.transfer(address, secret, "1", "test", to, "bwt");
      expect(hash).to.equal("111111");
      expect(stub.calledOnce).to.true;
      expect(stub1.calledOnce).to.true;
      expect(stub.calledOnceWithExactly(address)).to.true;
      expect(
        stub1.calledOnceWithExactly(
          "120000220000000024000000C86140000000000F424068400000000000000A73210305907425BF03CD414D089EB48FE0AB7898B74985F43B0A42EB06588DA6FFC58E74473045022100D12B9A0CABA5F59C0E909B9C7F2175B829AB99215472BBE6E868B1B90D238C1B02205FFCFA113AB13EC16A955F4232D16EEA1031365D0D3445616588BF8CA3EB1D608114E5C8083009E1C466A7484CF57497009AB5A31AED8314FC183D2B2877F15407300CB0ACC6919529C0E1AEF9EA7C06737472696E677D0474657374E1F1"
        )
      ).to.true;
      expect(await swtcSequence.get(null, address)).to.equal(201);
    });
  });

  describe("test transfer when chain is seaaps", () => {
    const address = "dNv89C8qjHP8hpTohc8knuSdtRnU4omH32";
    const secret = "ssGaiHdMUpyKHsnGCrnijaZnjZ9Hh";
    const to = "dKgJFijXjiutU3GYfur2ktGdNDo3eKckbP";

    before(() => {
      JCCExchange.init([], 1);
      JCCExchange.setDefaultChain("seaaps");
    });

    afterEach(() => {
      sandbox.restore();
      swtcSequence.clear();
    });

    after(() => {
      JCCExchange.setDefaultChain("jingtum");
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
      const hash = await JCCExchange.transfer(address, secret, "1", "test", to, "seaa");
      expect(hash).to.equal("111111");
      expect(stub.calledOnce).to.true;
      expect(stub1.calledOnce).to.true;
      expect(stub.calledOnceWithExactly(address)).to.true;
      expect(
        stub1.calledOnceWithExactly(
          "120000220000000024000000C86140000000000F4240684000000000002710732102665FE69997715DCFD583E9DDD22BF0C7B3AF96D2595D137A8D7FF09400B7B4F17447304502210099901E6F3850BF400EA82FCF61796ED2593B1BFE444D6D1267C71EFA95CB28D702202212B601329B70CB63FE55C939E033DDCE29AE570EE84B6655714FF86E4EFEBE811498C55EBABC4504922BE7ECE40CB4733359B0F5F08314CCE15DC33BEFF06DAB79CEAC9562E517E59ADF0DF9EA7C06737472696E677D0474657374E1F1"
        )
      ).to.true;
      expect(await swtcSequence.get(null, address)).to.equal(201);
    });
  });
});
