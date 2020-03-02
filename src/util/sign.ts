/// <reference path = "../types/index.ts" />

import { Factory as SerializerFactory } from "@swtc/serializer";
import { Factory as WalletFactory } from "@swtc/wallet";

const createFactory = ((WalletFactory, SerializerFactory) => {
  let chain: ISupportChain;
  let Wallet;
  let Serializer;
  return (name: ISupportChain) => {
    if (name !== chain) {
      Wallet = WalletFactory(name);
      Serializer = SerializerFactory(Wallet);
      chain = name;
    }
    return { Wallet, Serializer };
  };
})(WalletFactory, SerializerFactory);

const sign = (tx: any, secret: string, chain: ISupportChain = "jingtum"): string => {
  const { Wallet, Serializer } = createFactory(chain);
  const wallet = new Wallet(secret);
  const copyTx = Object.assign({}, tx);
  copyTx.SigningPubKey = wallet.getPublicKey();
  const prefix = 0x53545800;
  const blob = Serializer.from_json(copyTx);
  let hash: string;
  if (wallet.isEd25519()) {
    hash = `${prefix.toString(16).toUpperCase()}${blob.to_hex()}`;
  } else {
    hash = blob.hash(prefix);
  }
  copyTx.TxnSignature = wallet.signTx(hash);
  return Serializer.from_json(copyTx).to_hex();
};

export default sign;
