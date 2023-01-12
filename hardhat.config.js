require('dotenv').config()
require("@tenderly/hardhat-tenderly")

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: '0.8.17',
  networks: {
    hardhat: {
      forking: {
        url: process.env.MAINNET_ALCHEMY_API,
      },
    },
    tenderly: {
      chainId: 3,
      // url: `https://rpc.tenderly.co/fork/e2c69c29-fcf3-4724-9ac4-f5c3543736a2`,
      url: process.env.TENDERLY_FORK_URL,
    },
    local: {
      url: 'http://127.0.0.1:8545'
    },
  },
	tenderly: {
		username: "edward-index",
		project: "fork/e2c69c29-fcf3-4724-9ac4-f5c3543736a2"
	},
}
