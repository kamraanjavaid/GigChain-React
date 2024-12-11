import detectEthereumProvider from "@metamask/detect-provider";
import Web3 from "web3";

export const connectWallet = async () => {
  try {
    const provider = await detectEthereumProvider();

    if (!provider) {
      throw new Error("Please install MetaMask!");
    }

    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    return accounts[0];
  } catch (error) {
    throw error;
  }
};
