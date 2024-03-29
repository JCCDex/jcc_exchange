const exchangeInstance = require("../lib/util").exchangeInstance;
const chai = require("chai");
const expect = chai.expect;
const JcNodeRpc = require("jcc_rpc").JcNodeRpc;

describe("test exchangeInstance", function () {
  const urls = ["http://localhost"];

  describe("test destroy", function () {
    it("destroy should be a function", function () {
      expect(typeof exchangeInstance.destroy).to.equal("function");
    });
  });

  describe("test init", function () {
    it("init should be a function", function () {
      expect(typeof exchangeInstance.init).to.equal("function");
    });

    it("should return instance of JcNodeRpc", function () {
      const inst = exchangeInstance.init(urls);
      expect(inst instanceof JcNodeRpc).to.true;
    });

    it("should init once if inst isn't null", function () {
      const inst = exchangeInstance.init(urls);
      expect(inst instanceof JcNodeRpc).to.true;

      const inst2 = exchangeInstance.init(urls);
      expect(inst).to.equal(inst2);
    });

    it("should init twice if inst is destroyed", function () {
      const inst = exchangeInstance.init(urls);
      expect(inst instanceof JcNodeRpc).to.true;
      exchangeInstance.destroy();
      const inst2 = exchangeInstance.init(urls);
      expect(inst).to.not.equal(inst2);
    });

    it("should init once and urls should be changed if urls is changed", function () {
      const inst = exchangeInstance.init(["http://localhost:80"]);
      expect(inst instanceof JcNodeRpc).to.true;
      expect(inst.urls).to.deep.equal(["http://localhost:80"]);
      const inst2 = exchangeInstance.init([]);
      expect(inst).to.equal(inst2);
      expect(inst2.urls).to.deep.equal([]);
    });
  });
});
