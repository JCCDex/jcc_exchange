interface ITakerGets {
  currency: string;
  issuer: string;
  value: string;
}

interface ITakerPays {
  currency: string;
  issuer: string;
  value: string;
}

declare interface IAmount {
  currency: string;
  issuer: string;
  value: string;
}

declare type ExchangeType = "buy" | "sell";

declare interface IMemo {
  Memo: {
    MemoType: string;
    MemoData: string;
  };
}

declare interface ISignerEntry {
  SignerEntry: {
    Account: string;
    SignerWeight: number;
  };
}

declare interface ICreateExchange {
  Account: string;
  Fee: number;
  Flags: number;
  Platform: string;
  Sequence?: number;
  TakerGets: string | ITakerGets;
  TakerPays: string | ITakerPays;
  TransactionType: string;
}

declare interface ICancelExchange {
  Account: string;
  Fee: number;
  Flags: number;
  OfferSequence: number;
  Sequence?: number;
  TransactionType: string;
}

declare interface IPayExchange {
  Account: string;
  Amount: string | IAmount;
  Destination: string;
  Fee: number;
  Flags: number;
  Sequence?: number;
  TransactionType: string;
  Memos: IMemo[];
}

declare interface ISignerListSet {
  Account: string;
  SignerQuorum: number;
  SignerEntries?: ISignerEntry[];
  Fee: number;
  Sequence?: number;
  TransactionType: string;
}

declare interface IAccountSet {
  Account: string;
  SetFlag?: number;
  ClearFlag?: number;
  Fee: number;
  Sequence?: number;
  TransactionType: string;
}

declare interface IBrokerageExchange {
  Account: string;
  Amount: string | IAmount;
  Fee: number;
  FeeAccountID: string;
  OfferFeeRateDen: number;
  OfferFeeRateNum: number;
  Sequence?: number;
  TransactionType: string;
}

declare type ISupportChain = "jingtum" | "bizain" | "seaaps";

declare interface IChainConfig {
  nativeToken: string;
  minGas: number;
}

declare interface IToken {
  name: string;
  issuer: string;
}
