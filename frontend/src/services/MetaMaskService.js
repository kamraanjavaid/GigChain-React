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

    try {
      const web3 = new Web3(provider);
      const accounts = await web3.eth.getAccounts();
      const walletAddress = accounts[0];
      return walletAddress;
    } catch (error) {
      throw error;
    }
  } catch (error) {
    throw error;
  }
};
