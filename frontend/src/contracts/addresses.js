export const CONTRACT_ADDRESSES = {
  31337: {
    name: "hardhat",
    FreelanceMarketplace: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
  },

  11155111: {
    name: "sepolia",
    FreelanceMarketplace: "0x...",
  },

  1: {
    name: "mainnet",
    FreelanceMarketplace: "0x...",
  },
};

export const getContractAddress = (
  chainId,
  contractName = "FreelanceMarketplace"
) => {
  const network = CONTRACT_ADDRESSES[chainId];
  if (!network) {
    throw new Error(`Unsupported network chain ID: ${chainId}`);
  }

  const address = network[contractName];
  if (!address) {
    throw new Error(
      `Contract ${contractName} not deployed on network ${network.name}`
    );
  }

  return address;
};

export const isSupportedNetwork = (chainId) => {
  return Object.keys(CONTRACT_ADDRESSES).includes(chainId.toString());
};

export const getNetworkName = (chainId) => {
  return CONTRACT_ADDRESSES[chainId]?.name || "unknown";
};

export const getChainId = async (provider) => {
  const network = await provider.getNetwork();
  return network.chainId;
};
