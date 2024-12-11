// MetaMaskService.js
import detectEthereumProvider from '@metamask/detect-provider';
import Web3 from 'web3';

export const connectWallet = async () => {
  try {
    // Check if MetaMask is installed
    const provider = await detectEthereumProvider();
    
    if (!provider) {
      throw new Error('Please install MetaMask!');
    }

    // Request account access
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts'
    });

    return accounts[0]; // Return the connected account address
  } catch (error) {
    throw error;
  }
};
