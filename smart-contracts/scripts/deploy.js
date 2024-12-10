const { ethers } = require("hardhat");
const { updateAddresses } = require("./updateAddresses");

async function main(freelancerAddress, amount) {
  if (!freelancerAddress) {
    throw new Error("Freelancer address is required");
  }

  if (!amount) {
    throw new Error("Amount is required");
  }

  const network = await ethers.provider.getNetwork();

  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Freelancer address:", freelancerAddress);
  console.log("Initial amount:", amount, "ETH");

  const Escrow = await ethers.getContractFactory("Escrow");

  const escrow = await Escrow.deploy(freelancerAddress, {
    value: ethers.parseEther(amount.toString()),
  });

  await escrow.waitForDeployment();
  const escrowAddress = await escrow.getAddress();

  await updateAddresses(network, escrowAddress);

  console.log("Escrow deployed to:", escrowAddress);
  console.log("Network:", network.name);

  if (network.name !== "localhost" && network.name !== "hardhat") {
    console.log("Waiting for block confirmations...");
    await escrow.deployTransaction.wait(6);

    try {
      await run("verify:verify", {
        address: escrowAddress,
        constructorArguments: [freelancerAddress],
      });
    } catch (error) {
      console.log("Verification error:", error);
    }
  }

  return escrow;
}

if (require.main === module) {
  const [, , freelancerAddress, amount] = process.argv;

  if (!freelancerAddress || !amount) {
    console.error("Usage: node deploy.js <freelancerAddress> <amount>");
    process.exit(1);
  }

  main(freelancerAddress, amount)
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { main };
