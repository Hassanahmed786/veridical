import pkg from 'hardhat';
const { ethers } = pkg;

async function main() {
  const [deployer] = await ethers.getSigners();
  if (!deployer) {
    throw new Error('No deployer account available. Set PRIVATE_KEY in .env before deploying.');
  }

  console.log('Deploying with:', deployer.address);

  const VeridicalRegistry = await ethers.getContractFactory('VeridicalRegistry');
  const veridicalRegistry = await VeridicalRegistry.deploy();

  await veridicalRegistry.waitForDeployment();

  console.log('VeridicalRegistry deployed to:', await veridicalRegistry.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});