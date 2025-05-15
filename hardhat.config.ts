import { HardhatUserConfig } from "hardhat/config";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-waffle";
import * as dotenv from "dotenv";
// This adds support for typescript paths mappings
import "tsconfig-paths/register";

dotenv.config();

const config: HardhatUserConfig = {
    solidity: "0.8.17",
    mocha: { timeout: 100000 },
};

export default config;
