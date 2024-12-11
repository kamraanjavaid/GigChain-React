import Web3 from "web3";
import FreelanceEscrow from "../contracts/FreelanceEscrow.json";

class BlockchainService {
  constructor() {
    this.web3 = null;
    this.contract = null;
    this.contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
  }

  async init() {
    if (window.ethereum) {
      this.web3 = new Web3(window.ethereum);
      await window.ethereum.enable();

      this.contract = new this.web3.eth.Contract(
        FreelanceEscrow.abi,
        this.contractAddress
      );
    } else {
      throw new Error("Please install MetaMask");
    }
  }

  async createProject(projectId, freelancerAddress, deadline, amount) {
    try {
      const accounts = await this.web3.eth.getAccounts();
      const amountInWei = this.web3.utils.toWei(amount, "ether");

      return this.contract.methods
        .createProject(projectId, freelancerAddress, deadline)
        .send({
          from: accounts[0],
          value: amountInWei,
        });
    } catch (error) {
      console.error("Error creating project in blockchain", error);
      throw error;
    }
  }
}

export default new BlockchainService();
