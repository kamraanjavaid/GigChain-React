import { createContext, useContext, useState, useEffect } from "react";
import { ethers } from "ethers";
const Web3Context = createContext();
import FreelanceMarketplaceABI from "../contracts/abis/FreelanceMarketplace.json";

import {
  getContractAddress,
  isSupportedNetwork,
  getNetworkName,
} from "../contracts/addresses";

export function Web3Provider({ children }) {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        throw new Error("Please install MetaMask!");
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(provider);

      const accounts = await window.ethereum.request({ 
        method: "eth_requestAccounts" 
      });
      setAccount(accounts[0]);

      const signer = provider.getSigner();

      const network = await provider.getNetwork();
      const chainId = network.chainId;

      if (!isSupportedNetwork(chainId)) {
        throw new Error(
          `Please connect to a supported network. Current network: ${getNetworkName(chainId)}`
        );
      }

      const contractAddress = getContractAddress(chainId);
      const contractInstance = new ethers.Contract(
        contractAddress,
        FreelanceMarketplaceABI,
        signer
      );

      setContract(contractInstance);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        if (window.ethereum) {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          setProvider(provider);

          const accounts = await provider.listAccounts();
          if (accounts.length > 0) {
            setAccount(accounts[0]);
            await connectWallet();
          }

          window.ethereum.on("accountsChanged", (accounts) => {
            setAccount(accounts[0] || null);
          });

          window.ethereum.on("chainChanged", () => {
            window.location.reload();
          });
        }
      } catch (error) {
        console.error("Initialization error:", error);
      } finally {
        setLoading(false);
      }
    };

    init();

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener("accountsChanged", () => {});
        window.ethereum.removeListener("chainChanged", () => {});
      }
    };
  }, []);

  return (
    <Web3Context.Provider
      value={{
        account,
        provider,
        contract,
        loading,
        connectWallet,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
}

export function useWeb3() {
  return useContext(Web3Context);
}
