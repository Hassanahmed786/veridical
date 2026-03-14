require('dotenv').config();
require('@nomicfoundation/hardhat-toolbox');

/** @type {import('hardhat/config').HardhatUserConfig} */
module.exports = {
  solidity: '0.8.20',
  paths: {
    sources: './src/contracts',
    tests: './test',
    cache: './cache',
    artifacts: './artifacts',
  },
  networks: {
    monadTestnet: {
      url: process.env.MONAD_RPC_URL || 'https://testnet-rpc.monad.xyz',
      chainId: 10143,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },
};