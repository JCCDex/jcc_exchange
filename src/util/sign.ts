/// <reference path = "../types/index.ts" />

import { Factory as SerializerFactory } from "@swtc/serializer";
import { Factory as WalletFactory } from "@swtc/wallet";
import { HASHPREFIX } from "@swtc/common";

const createFactory = ((walletFactory, serializerFactory) => {
  let chain: ISupportChain;
  let wallet;
  let serializer;
  return (name: ISupportChain) => {
    if (name !== chain) {
      wallet = walletFactory(name);
      serializer = serializerFactory(wallet);
      chain = name;
    }
    return { Wallet: wallet, Serializer: serializer };
  };
})(WalletFactory, SerializerFactory);

const sign = (tx: any, secret: string, chain: ISupportChain = "jingtum", returnHash: boolean = false): any => {
  const { Wallet, Serializer } = createFactory(chain);
  const wallet = new Wallet(secret);
  const copyTx = Object.assign({}, tx);
  copyTx.SigningPubKey = wallet.getPublicKey();
  const prefix = HASHPREFIX.transactionSig;
  const blob = Serializer.from_json(copyTx);
  let hash: string;
  if (wallet.isEd25519()) {
    hash = `${prefix.toString(16).toUpperCase()}${blob.to_hex()}`;
  } else {
    hash = blob.hash(prefix);
  }
  copyTx.TxnSignature = wallet.signTx(hash);
  const sendBlob = Serializer.from_json(copyTx);
  if (returnHash) {
    return { blob: sendBlob.to_hex(), hash: sendBlob.hash(HASHPREFIX.transactionID), account: wallet.address(), tx: copyTx };
  } else {
    return sendBlob.to_hex();
  }
};

const multiSign = (tx: any, secret: string, chain: ISupportChain = "jingtum"): any => {
  const { Wallet, Serializer } = createFactory(chain);
  const wallet = new Wallet(secret);
  const copyTx = Object.assign({}, tx);
  // 多签的时候SigningPubKey必须有但是保持为空
  copyTx.SigningPubKey = "";
  // Fee按照笔数计算，考虑最大8笔，最高是0.01
  copyTx.Fee = 0.08;

  let blob = Serializer.from_json(copyTx);
  blob = Serializer.adr_json(blob, wallet.address());

  const prefix = HASHPREFIX.transactionMultiSig;
  let hash: string;
  if (wallet.isEd25519()) {
    hash = `${prefix.toString(16).toUpperCase()}${blob.to_hex()}`;
  } else {
    hash = blob.hash(prefix);
  }
  return {
    Signer: {
      Account: wallet.address(),
      SigningPubKey: wallet.getPublicKey(),
      TxnSignature: wallet.signTx(hash)
    }
  };
};

export default sign;
export { sign, multiSign };
