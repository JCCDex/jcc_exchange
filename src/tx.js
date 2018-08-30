const formatCreate = (type, base, counter, issuer, account, amount, sum) => {
    let Account = account;
    let Fee = 10 / 1000000;
    let TakerGets;
    let TakerPays;
    let Flags;
    base = base.toUpperCase();
    counter = counter.toUpperCase();
    if (type === 0) {
        // buy
        Flags = 0;
        if (base === 'SWT') {
            TakerPays = amount;
        } else {
            TakerPays = {
                value: amount,
                currency: base,
                issuer
            }
        }

        if (counter === 'SWT') {
            TakerGets = sum;
        } else {
            TakerGets = {
                value: sum,
                currency: counter,
                issuer
            }
        }
    } else if (type === 1) {
        // sell
        Flags = 0x00080000;

        if (counter === 'SWT') {
            TakerPays = sum;
        } else {
            TakerPays = {
                value: sum,
                currency: counter,
                issuer
            }
        }

        if (base === 'SWT') {
            TakerGets = amount;
        } else {
            TakerGets = {
                value: amount,
                currency: base,
                issuer
            }
        }
    } else {
        return null;
    }
    let tx = {
        Flags,
        Fee,
        Account,
        TransactionType: 'OfferCreate',
        TakerGets,
        TakerPays
    }
    return tx
}

const formatCancel = (address, sequence) => {
    let tx = {}
    tx.Flags = 0;
    tx.Fee = 10 / 1000000;
    tx.Account = address;
    tx.TransactionType = 'OfferCancel';
    tx.OfferSequence = sequence;
    return tx;
}

const formatTransfer = (currency, amount, address, to, issuer, memo) => {
    let tx = {
        Flags: 0,
        Account: address,
        TransactionType: 'Payment',
        Destination: to,
        Memos: [{
            Memo: {
                MemoType: 'string',
                MemoData: memo
            }
        }],
        Fee: 10 / 1000000
    }
    if (currency.toUpperCase() === 'SWT') {
        tx.Amount = amount
    } else {
        tx.Amount = {
            value: amount,
            currency: currency.toUpperCase(),
            issuer
        }
    }
    return tx;
}

module.exports = {
    formatCreate,
    formatCancel,
    formatTransfer
}