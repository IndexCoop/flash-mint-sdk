require('dotenv').config()

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: '0.8.17',
    settings: {
      evmVersion: 'cancun',
    },
  },
  networks: {
    hardhat: {
      chainId: 1,
      forking: {
        url: process.env.MAINNET_ALCHEMY_API,
        blockNumber: 20983000,
      },
    },
  },
}
