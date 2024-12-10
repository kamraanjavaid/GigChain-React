require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-ethers");
require("dotenv").config();

const INFURA_API_KEY = process.env.INFURA_API_KEY;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

if (!INFURA_API_KEY) {
  throw new Error("Please set your INFURA_API_KEY in a .env file");
}

if (!PRIVATE_KEY) {
  throw new Error("Please set your PRIVATE_KEY in a .env file");
}

function validateAndFormatPrivateKey(key) {
  const cleanKey = key.startsWith("0x") ? key.slice(2) : key;

  if (!/^[0-9a-fA-F]{64}$/.test(cleanKey)) {
    throw new Error("Invalid private key format. Must be 64 characters of hex");
  }

  return cleanKey;
}

const formattedPrivateKey = validateAndFormatPrivateKey(PRIVATE_KEY);

module.exports = {
  paths: {
    sources: "./contracts",
  },
  solidity: {
    version: "0.8.27",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
    },
    hardhat: {
      chainId: 1337,
    },
    sepolia: {
      url: `https://sepolia.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [`0x${formattedPrivateKey}`],
      chainId: 11155111,
    },
    mainnet: {
      url: `https://mainnet.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [`0x${formattedPrivateKey}`],
      chainId: 1,
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};
