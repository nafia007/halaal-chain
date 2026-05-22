import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying HalaalToken with account:", deployer.address);
  console.log("Account balance:", ethers.utils.formatEther(await ethers.provider.getBalance(deployer.address)));

  const tokenName = process.env.TOKEN_NAME || "Halaal Certification";
  const tokenSymbol = process.env.TOKEN_SYMBOL || "HCT";

  const HalaalTokenFactory = await ethers.getContractFactory("HalaalToken");
  const token: any = await HalaalTokenFactory.deploy(tokenName, tokenSymbol);
  const address: string = token.address;
  const MAX_SUPPLY = await token.MAX_SUPPLY();
  const owner = await token.owner();

  console.log("\n✅ HalaalToken deployed");
  console.log("  Address:          ", address);
  console.log("  Token name:       ", tokenName);
  console.log("  Token symbol:     ", tokenSymbol);
  console.log("  Max supply:       ", ethers.utils.formatUnits(MAX_SUPPLY));
  console.log("  Owner:            ", owner);
  console.log("\nSave HALAAL_TOKEN_ADDRESS=" + address + "  to .env");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
