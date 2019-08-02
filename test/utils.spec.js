const exchangeInstance = require("../lib/util").exchangeInstance;
const chai = require('chai');
const expect = chai.expect;
const JcExchange = require("jcc_rpc").JcExchange;

describe("test exchangeInstance", function() {
  const exchangeInstanceAPI = exchangeInstance();
  const hosts = ["localhost"];
  const port = 80;
  const https = false;

  describe("test destroy", function() {
    it("destroy should be a function", function() {
      expect(typeof exchangeInstanceAPI.destroy).to.equal("function");
    })
  })

  describe("test init", function() {
    it("init should be a function", function() {
      expect(typeof exchangeInstanceAPI.init).to.equal("function");
    })

    it("should return instance of JcExchange", function() {
      const inst = exchangeInstanceAPI.init(hosts, port, https);
      expect(inst instanceof JcExchange).to.true;
    })

    it("should init once if inst isn't null and host、port & https is not changed", function() {
      const inst = exchangeInstanceAPI.init(hosts, port, https);
      expect(inst instanceof JcExchange).to.true;

      const inst2 = exchangeInstanceAPI.init(hosts, port, https);
      expect(inst).to.equal(inst2);
    });

    it("should init twice if inst is destroyed", function() {
      const inst = exchangeInstanceAPI.init(hosts, port, https);
      expect(inst instanceof JcExchange).to.true;
      exchangeInstanceAPI.destroy();
      const inst2 = exchangeInstanceAPI.init(hosts, port, https);
      expect(inst).to.not.equal(inst2);
    });

    it("should init twice if hosts is changed", function() {
      const inst = exchangeInstanceAPI.init(hosts, port, https);
      expect(inst instanceof JcExchange).to.true;
      const inst2 = exchangeInstanceAPI.init([], port, https);
      expect(inst).to.not.equal(inst2);
    });

    it("should init twice if port is changed", function() {
      const inst = exchangeInstanceAPI.init(hosts, port, https);
      expect(inst instanceof JcExchange).to.true;
      const inst2 = exchangeInstanceAPI.init(hosts, 443, https);
      expect(inst).to.not.equal(inst2);
    });

    it("should init twice if https is changed", function() {
      const inst = exchangeInstanceAPI.init(hosts, port, https);
      expect(inst instanceof JcExchange).to.true;
      const inst2 = exchangeInstanceAPI.init(hosts, port, true);
      expect(inst).to.not.equal(inst2);
    });
  })
})