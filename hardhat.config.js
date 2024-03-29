require('dotenv').config()

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: '0.8.17',
  networks: {
    hardhat: {
      chainId: 1,
      forking: {
        url: process.env.MAINNET_ALCHEMY_API,
      },
    },
  },
}
