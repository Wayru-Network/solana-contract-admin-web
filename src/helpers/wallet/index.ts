import { CONSTANTS } from "../../constants";


export const formatWalletAddress = (address: string, slice: number = 6) => {
  return address.slice(0, slice) + '...' + address.slice(-slice);
};


export const viewWalletOnExplorer = (publicKey: string, network: keyof CONSTANTS["NETWORK"]["EXPLORER_ACCOUNT_URL"]) => {
  if (publicKey && network) {
    const url = CONSTANTS.NETWORK.EXPLORER_ACCOUNT_URL[network];
    // replace the replaceme with the public key
    const urlWithPublicKey = url.replace("replaceme", publicKey.toString());
    window.open(urlWithPublicKey, "_blank");
  }
}