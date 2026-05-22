const hre = require("hardhat");
const fs = require("fs");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying HalaalToken with account:", deployer.address);
  console.log("Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString());

  const tokenName = process.env.TOKEN_NAME || "Halaal Certification";
  const tokenSymbol = process.env.TOKEN_SYMBOL || "HCT";

  const HalaalTokenFactory = await hre.ethers.getContractFactory("HalaalToken");
  const token = await HalaalTokenFactory.deploy(tokenName, tokenSymbol);
  await token.deployed(); // For ethers v5, we need to wait for deployment

  const address = token.address;
  const MAX_SUPPLY = await token.MAX_SUPPLY();
  const owner = await token.owner();

  console.log("\n✅ HalaalToken deployed");
  console.log("  Address:          ", address);
  console.log("  Token name:       ", tokenName);
  console.log("  Token symbol:     ", tokenSymbol);
  console.log("  Max supply:       ", hre.ethers.utils.formatUnits(MAX_SUPPLY));
  console.log("  Owner:            ", owner);
  console.log("\nSave HALAAL_TOKEN_ADDRESS=" + address + "  to .env");

  // Save the address to a file for frontend/backend use
  fs.writeFileSync("./deployed-address.txt", address);
  console.log("Contract address saved to ./deployed-address.txt");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });