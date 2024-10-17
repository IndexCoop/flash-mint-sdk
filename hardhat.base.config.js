require('dotenv').config()

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: '0.8.17',
    networks: {
        hardhat: {
            chainId: 8453,
            forking: {
                url: process.env.BASE_ALCHEMY_API,
            },
        },
        chains: {
            8453: {
                hardforkHistory: {
                    cancun: 0,
                },
            },
        },
    },
}
