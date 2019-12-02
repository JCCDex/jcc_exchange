interface ITakerGets {
    currency: string,
    issuer: string,
    value: string
}

interface ITakerPays {
    currency: string,
    issuer: string,
    value: string
}

export interface IAmount {
    currency: string,
    issuer: string,
    value: string
}

export type ExchangeType = "buy" | "sell";

export interface IMemo {
    Memo: {
        MemoType: string,
        MemoData: string
    }
}

export interface ICreateExchange {
    Account: string,
    Fee: number,
    Flags: number,
    Sequence?: number,
    TakerGets: string | ITakerGets,
    TakerPays: string | ITakerPays,
    TransactionType: string,
}

export interface ICancelExchange {
    Account: string,
    Fee: number,
    Flags: number,
    OfferSequence: number,
    Sequence?: number,
    TransactionType: string
}

export interface IPayExchange {
    Account: string,
    Amount: string | IAmount,
    Destination: string,
    Fee: number,
    Flags: number,
    Sequence?: number,
    TransactionType: string,
    Memos: IMemo[]
}

export interface IBrokerageExchange {
    Account: string,
    Amount: string | IAmount
    Fee: number,
    FeeAccountID: string,
    OfferFeeRateDen: number,
    OfferFeeRateNum: number,
    Sequence?: number,
    TransactionType: string
}
