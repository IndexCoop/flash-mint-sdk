require('dotenv').config()

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: '0.8.17',
  networks: {
    hardhat: {
      chainId: 42161,
      forking: {
        url: process.env.ARBITRUM_ALCHEMY_API,
      },
    },
  },
}
