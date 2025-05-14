import { HardhatUserConfig } from "hardhat/config";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-waffle";
import * as dotenv from "dotenv";
// This adds support for typescript paths mappings
import "tsconfig-paths/register";

dotenv.config();

const ALCHEMY_KEY = process.env.ALCHEMY_API_KEY;
if (!ALCHEMY_KEY) throw new Error("Missing ALCHEMY_API_KEY");

const BASE_RPC = `https://base-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`;

const config: HardhatUserConfig = {
    solidity: "0.8.17",
    mocha: { timeout: 100000 },
    networks: {
        hardhat: {
            forking: {
                url: BASE_RPC,
                // optional: blockNumber: 12345678
            },
        },
    },
};

export default config;
