/// <reference path = "../types/index.ts" />

import { chainConfig } from "../util/config";

export const serializeCreateOrder = (address: string, amount: string, base: string, counter: string, sum: string, type: ExchangeType, platform: string, issuer = "jGa9J9TkqtBcUoHe2zqhVFFbgUVED6o9or"): ICreateExchange => {
  const account = address;
  const { minGas, nativeToken } = chainConfig.getDefaultConfig();
  const fee = minGas / 1000000;
  let takerGets;
  let takerPays;
  let flags;
  if (type === "buy") {
    flags = 0;
    if (base.toUpperCase() === nativeToken) {
      takerPays = amount;
    } else {
      takerPays = {
        currency: base.toUpperCase(),
        issuer,
        value: amount
      };
    }

    if (counter.toUpperCase() === nativeToken) {
      takerGets = sum;
    } else {
      takerGets = {
        currency: counter.toUpperCase(),
        issuer,
        value: sum
      };
    }
  } else if (type === "sell") {
    flags = 0x00080000;

    if (counter.toUpperCase() === nativeToken) {
      takerPays = sum;
    } else {
      takerPays = {
        currency: counter.toUpperCase(),
        issuer,
        value: sum
      };
    }

    if (base.toUpperCase() === nativeToken) {
      takerGets = amount;
    } else {
      takerGets = {
        currency: base.toUpperCase(),
        issuer,
        value: amount
      };
    }
  } else {
    throw new Error("The type of creating order should be one of 'buy' and 'sell'");
  }
  const tx = {
    Account: account,
    Fee: fee,
    Flags: flags,
    Platform: platform || "jDXCeSHSpZ9LiX6ihckWaYDeDt5hFrdTto",
    TakerGets: takerGets,
    TakerPays: takerPays,
    TransactionType: "OfferCreate"
  };
  return tx;
};

export const serializeCancelOrder = (address: string, sequence: number): ICancelExchange => {
  const { minGas } = chainConfig.getDefaultConfig();
  const tx = {
    Account: address,
    Fee: minGas / 1000000,
    Flags: 0,
    OfferSequence: sequence,
    TransactionType: "OfferCancel"
  };
  return tx;
};

export const serializePayment = (address: string, amount: string, to: string, token: string, memo: string | IMemo[], issuer = "jGa9J9TkqtBcUoHe2zqhVFFbgUVED6o9or"): IPayExchange => {
  let _amount: IAmount | string;
  const { minGas, nativeToken } = chainConfig.getDefaultConfig();

  if (token.toUpperCase() === nativeToken) {
    _amount = amount;
  } else {
    _amount = {
      currency: token.toUpperCase(),
      issuer,
      value: amount
    };
  }

  let memos: IMemo[];

  if (typeof memo === "string") {
    memos = [
      {
        Memo: {
          MemoData: memo,
          MemoType: "string"
        }
      }
    ];
  } else {
    memos = memo;
  }

  const tx = {
    Account: address,
    Amount: _amount,
    Destination: to,
    Fee: minGas / 1000000,
    Flags: 0,
    Memos: memos,
    TransactionType: "Payment"
  };

  return tx;
};

export const serializeBrokerage = (platformAccount: string, feeAccount: string, rateNum: number, rateDen: number, token: string, issuer = "jGa9J9TkqtBcUoHe2zqhVFFbgUVED6o9or"): IBrokerageExchange => {
  let _amount: IAmount | string;
  const { minGas } = chainConfig.getDefaultConfig();

  _amount = {
    currency: token.toUpperCase(),
    issuer,
    value: "0"
  };

  const tx = {
    Account: platformAccount,
    Amount: _amount,
    Fee: minGas / 1000000,
    FeeAccountID: feeAccount,
    OfferFeeRateDen: rateDen,
    OfferFeeRateNum: rateNum,
    TransactionType: "Brokerage"
  };

  return tx;
};
