require('dotenv').config()

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: '0.8.17',
  networks: {
    hardhat: {
      chainId: 8453,
      forking: {
        url: process.env.ARBITRUM_ALCHEMY_API,
      },
    },
  },
}
