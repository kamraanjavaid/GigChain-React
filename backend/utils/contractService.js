const { ethers } = require("ethers");
const path = require("path");
const fs = require("fs");

class ContractService {
  constructor() {
    if (!process.env.INFURA_RPC_URL) {
      throw new Error("INFURA_RPC_URL is not defined in environment variables");
    }
    if (!process.env.PRIVATE_KEY) {
      throw new Error("PRIVATE_KEY is not defined in environment variables");
    }

    try {
      this.provider = new ethers.JsonRpcProvider(process.env.INFURA_RPC_URL);
      this.wallet = new ethers.Wallet(process.env.PRIVATE_KEY, this.provider);

      const contractPath = path.join(
        __dirname,
        "../../smart-contracts/artifacts/contracts/Escrow.sol/Escrow.json"
      );

      if (!fs.existsSync(contractPath)) {
        throw new Error(`Contract artifact not found at ${contractPath}`);
      }

      this.contractJson = JSON.parse(fs.readFileSync(contractPath, "utf8"));

      if (!this.contractJson.abi || !this.contractJson.bytecode) {
        throw new Error("Invalid contract artifact: missing ABI or bytecode");
      }

      this.contractABI = this.contractJson.abi;
    } catch (error) {
      console.error("ContractService initialization error:", error);
      throw error;
    }
  }

  async deployEscrow(freelancerAddress, amount) {
    try {
      if (!ethers.isAddress(freelancerAddress)) {
        throw new Error("Invalid freelancer address");
      }

      if (typeof amount !== "number" || amount <= 0) {
        throw new Error("Invalid amount");
      }

      const factory = new ethers.ContractFactory(
        this.contractABI,
        this.contractJson.bytecode,
        this.wallet
      );

      const contract = await factory.deploy(freelancerAddress, {
        value: ethers.parseEther(amount.toString()),
      });

      await contract.waitForDeployment();

      return {
        contractAddress: await contract.getAddress(),
        transactionHash: contract.deploymentTransaction().hash,
      };
    } catch (error) {
      console.error("Contract deployment error:", error);
      throw error;
    }
  }

  async getContract(contractAddress) {
    try {
      return new ethers.Contract(
        contractAddress,
        this.contractABI,
        this.wallet
      );
    } catch (error) {
      console.error("Get contract instance error:", error);
      throw error;
    }
  }
}

module.exports = new ContractService();
