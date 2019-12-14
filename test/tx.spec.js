const { serializeBrokerage, serializeCreateOrder, serializeCancelOrder, serializePayment } = require("../lib/tx");
const chai = require("chai");
const expect = chai.expect;
const testAddress = "jpgWGpfHz8GxqUjz5nb6ej8eZJQtiF6KhH";
const issuer = "jGa9J9TkqtBcUoHe2zqhVFFbgUVED6o9or";

describe("test tx", function() {
  describe("test serializeCreateOrder", function() {
    it("use cny to buy swt", function() {
      const tx = serializeCreateOrder(testAddress, "1", "swt", "cny", "0.03", "buy", undefined, issuer);
      expect(tx).to.deep.equal({
        Flags: 0,
        Fee: 0.00001,
        Account: "jpgWGpfHz8GxqUjz5nb6ej8eZJQtiF6KhH",
        TransactionType: "OfferCreate",
        TakerGets: {
          value: "0.03",
          currency: "CNY",
          issuer: "jGa9J9TkqtBcUoHe2zqhVFFbgUVED6o9or"
        },
        TakerPays: "1",
        Platform: "jDXCeSHSpZ9LiX6ihckWaYDeDt5hFrdTto"
      });
    });

    it("use swt to buy jjcc", function() {
      const tx = serializeCreateOrder(testAddress, "1", "jjcc", "swt", "0.5", "buy", testAddress);
      expect(tx).to.deep.equal({
        Flags: 0,
        Fee: 0.00001,
        Account: "jpgWGpfHz8GxqUjz5nb6ej8eZJQtiF6KhH",
        TransactionType: "OfferCreate",
        TakerGets: "0.5",
        TakerPays: {
          value: "1",
          currency: "JJCC",
          issuer: "jGa9J9TkqtBcUoHe2zqhVFFbgUVED6o9or"
        },
        Platform: testAddress
      });
    });

    it("sell swt to get cny", function() {
      const tx = serializeCreateOrder(testAddress, "1", "swt", "cny", "0.03", "sell", null, issuer);
      expect(tx).to.deep.equal({
        Flags: 524288,
        Fee: 0.00001,
        Account: "jpgWGpfHz8GxqUjz5nb6ej8eZJQtiF6KhH",
        TransactionType: "OfferCreate",
        TakerGets: "1",
        TakerPays: {
          value: "0.03",
          currency: "CNY",
          issuer: "jGa9J9TkqtBcUoHe2zqhVFFbgUVED6o9or"
        },
        Platform: "jDXCeSHSpZ9LiX6ihckWaYDeDt5hFrdTto"
      });
    });

    it("sell jjcc to get swt", function() {
      const tx = serializeCreateOrder(testAddress, "1", "jjcc", "swt", "0.4", "sell");
      expect(tx).to.deep.equal({
        Flags: 524288,
        Fee: 0.00001,
        Account: "jpgWGpfHz8GxqUjz5nb6ej8eZJQtiF6KhH",
        TransactionType: "OfferCreate",
        TakerGets: {
          value: "1",
          currency: "JJCC",
          issuer: "jGa9J9TkqtBcUoHe2zqhVFFbgUVED6o9or"
        },
        TakerPays: "0.4",
        Platform: "jDXCeSHSpZ9LiX6ihckWaYDeDt5hFrdTto"
      });
    });

    it("if the type is not sell and buy", function() {
      expect(() => serializeCreateOrder(testAddress, "1", "jjcc", "swt", "0.4", "")).to.throw("The type of creating order should be one of 'buy' and 'sell'");
    });
  });

  describe("test serializeCancelOrder", function() {
    it("format correctly", function() {
      let tx = serializeCancelOrder(testAddress, 1);
      expect(tx).to.deep.equal({
        Flags: 0,
        Fee: 0.00001,
        Account: "jpgWGpfHz8GxqUjz5nb6ej8eZJQtiF6KhH",
        TransactionType: "OfferCancel",
        OfferSequence: 1
      });
    });
  });

  describe("test serializePayment", function() {
    it("transfer swt", function() {
      const tx = serializePayment(testAddress, "1", "123456", "swt", "test", issuer);
      expect(tx).to.deep.equal({
        Flags: 0,
        Account: "jpgWGpfHz8GxqUjz5nb6ej8eZJQtiF6KhH",
        TransactionType: "Payment",
        Destination: "123456",
        Memos: [
          {
            Memo: {
              MemoType: "string",
              MemoData: "test"
            }
          }
        ],
        Fee: 0.00001,
        Amount: "1"
      });
    });

    it("transfer cny", function() {
      const tx = serializePayment(testAddress, "1", "123456", "cny", [
        {
          Memo: {
            MemoType: "string",
            MemoData: "test"
          }
        }
      ]);
      expect(tx).to.deep.equal({
        Flags: 0,
        Account: "jpgWGpfHz8GxqUjz5nb6ej8eZJQtiF6KhH",
        TransactionType: "Payment",
        Destination: "123456",
        Memos: [
          {
            Memo: {
              MemoType: "string",
              MemoData: "test"
            }
          }
        ],
        Fee: 0.00001,
        Amount: {
          value: "1",
          currency: "CNY",
          issuer: "jGa9J9TkqtBcUoHe2zqhVFFbgUVED6o9or"
        }
      });
    });
  });

  describe("test serializeBrokerage", function() {
    it("format correctly", function() {
      let tx = serializeBrokerage(testAddress, testAddress, 1, 1000, "xxx");
      expect(tx).to.deep.equal({
        Account: testAddress,
        Amount: {
          currency: "XXX",
          issuer: "jGa9J9TkqtBcUoHe2zqhVFFbgUVED6o9or",
          value: "0"
        },
        Fee: 10 / 1000000,
        FeeAccountID: testAddress,
        OfferFeeRateDen: 1000,
        OfferFeeRateNum: 1,
        TransactionType: "Brokerage"
      });
    });
  });
});
