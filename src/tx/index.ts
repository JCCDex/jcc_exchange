/// <reference path = "../types/index.ts" />

import { chainConfig } from "../util/config";

export const serializeCreateOrder = (address: string, amount: string, base: string | IToken, counter: string | IToken, sum: string, type: ExchangeType, platform: string, issuer = "jGa9J9TkqtBcUoHe2zqhVFFbgUVED6o9or"): ICreateExchange => {
  const account = address;
  const { minGas, nativeToken } = chainConfig.getDefaultConfig();
  const fee = minGas / 1000000;
  let takerGets;
  let takerPays;
  let flags;
  let baseName: string;
  let baseIssuer: string;
  let counterName: string;
  let counterIssuer: string;
  if (typeof base === "object") {
    baseName = base.name;
    baseIssuer = base.issuer || issuer;
  } else {
    baseName = base;
    baseIssuer = issuer;
  }
  if (typeof counter === "object") {
    counterName = counter.name;
    counterIssuer = counter.issuer || issuer;
  } else {
    counterName = counter;
    counterIssuer = issuer;
  }
  if (type === "buy") {
    flags = 0;
    if (baseName.toUpperCase() === nativeToken) {
      takerPays = amount;
    } else {
      takerPays = {
        currency: baseName.toUpperCase(),
        issuer: baseIssuer,
        value: amount
      };
    }

    if (counterName.toUpperCase() === nativeToken) {
      takerGets = sum;
    } else {
      takerGets = {
        currency: counterName.toUpperCase(),
        issuer: counterIssuer,
        value: sum
      };
    }
  } else if (type === "sell") {
    flags = 0x00080000;

    if (counterName.toUpperCase() === nativeToken) {
      takerPays = sum;
    } else {
      takerPays = {
        currency: counterName.toUpperCase(),
        issuer: counterIssuer,
        value: sum
      };
    }

    if (baseName.toUpperCase() === nativeToken) {
      takerGets = amount;
    } else {
      takerGets = {
        currency: baseName.toUpperCase(),
        issuer: baseIssuer,
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

export const serializeSignerList = (account: string, signerQuorum: number, signerEntries?: ISignerEntry[]): ISignerListSet => {
  const { minGas } = chainConfig.getDefaultConfig();

  const tx = signerQuorum
    ? {
        Account: account,
        SignerQuorum: signerQuorum,
        SignerEntries: signerEntries,
        Fee: minGas / 1000000,
        TransactionType: "SignerListSet"
      }
    : {
        Account: account,
        SignerQuorum: 0,
        Fee: minGas / 1000000,
        TransactionType: "SignerListSet"
      };

  return tx;
};

export const serializeSetAccount = (account: string, disable: boolean): IAccountSet => {
  const { minGas } = chainConfig.getDefaultConfig();

  const tx = disable
    ? {
        Account: account,
        SetFlag: 4,
        Fee: minGas / 1000000,
        TransactionType: "AccountSet"
      }
    : {
        Account: account,
        ClearFlag: 4,
        Fee: minGas / 1000000,
        TransactionType: "AccountSet"
      };

  return tx;
};

export const serializeSetBlackList = (manager: string, account: string, memo: string | IMemo[]): IBlackList => {
  const { minGas } = chainConfig.getDefaultConfig();

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
    Account: manager,
    BlackListAccountID: account,
    Fee: minGas / 1000000,
    Flags: 0,
    Memos: memos,
    TransactionType: "SetBlackList"
  };

  return tx;
};

export const serializeRemoveBlackList = (manager: string, account: string, memo: string | IMemo[]): IBlackList => {
  const { minGas } = chainConfig.getDefaultConfig();

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
    Account: manager,
    BlackListAccountID: account,
    Fee: minGas / 1000000,
    Flags: 0,
    Memos: memos,
    TransactionType: "RemoveBlackList"
  };

  return tx;
};

export const serializeManageIssuer = (manager: string, account: string, memo: string | IMemo[]): IManageIssuer => {
  const { minGas } = chainConfig.getDefaultConfig();

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
    Account: manager,
    IssuerAccountID: account,
    Fee: minGas / 1000000,
    Flags: 0,
    Memos: memos,
    TransactionType: "ManageIssuer"
  };

  return tx;
};

export const serializeIssueSet = (manager: string, amount: string, token: string, memo: string | IMemo[], issuer: string): IIssueSet => {
  let _amount: IAmount | string;
  const { minGas } = chainConfig.getDefaultConfig();

  let memos: IMemo[];

  _amount = {
    currency: token.toUpperCase(),
    issuer,
    value: amount
  };

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
    Account: manager,
    TotalAmount: _amount,
    Fee: minGas / 1000000,
    Flags: 0,
    Memos: memos,
    TransactionType: "IssueSet"
  };

  return tx;
};
