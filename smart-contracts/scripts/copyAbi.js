const fs = require("fs");
const path = require("path");

async function copyAbi() {
  const artifact = require("../artifacts/contracts/FreelanceMarketplace.sol/FreelanceMarketplace.json");

  const abi = artifact.abi;

  const targetDir = "../frontend/src/contracts/abis";
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(targetDir, "FreelanceMarketplace.json"),
    JSON.stringify(abi, null, 2)
  );
}

copyAbi()
  .then(() => console.log("ABI copied successfully"))
  .catch(console.error);
