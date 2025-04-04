import { ChainId } from 'constants/chains'
import { Contracts } from 'constants/contracts'

import {
  getFlashMintHyEthContract,
  getFlashMintZeroExContract,
  getFlashMintZeroExContractForToken,
} from './contracts'

describe('getFlashMintHyEthContract()', () => {
  test('return correct contract', async () => {
    const chainId = ChainId.Mainnet
    const expectedAddress = Contracts[chainId].FlashMintHyEthV3
    const contract = getFlashMintHyEthContract(undefined)
    expect(contract.address).toEqual(expectedAddress)
    expect(contract.functions.issueExactSetFromERC20).toBeDefined()
    expect(contract.functions.issueExactSetFromETH).toBeDefined()
    expect(contract.functions.redeemExactSetForERC20).toBeDefined()
    expect(contract.functions.redeemExactSetForETH).toBeDefined()
  })
})

describe('getFlashMintZeroExContract()', () => {
  test('return correct contract for mainnet', async () => {
    const expectedAddress = Contracts[ChainId.Mainnet].ExchangeIssuanceZeroEx
    const contract = getFlashMintZeroExContract(undefined)
    expect(contract.address).toEqual(expectedAddress)
    expect(contract.functions.getRequiredIssuanceComponents).toBeDefined()
    expect(contract.functions.getRequiredRedemptionComponents).toBeDefined()
    expect(contract.functions.issueExactSetFromETH).toBeDefined()
    expect(contract.functions.issueExactSetFromToken).toBeDefined()
    expect(contract.functions.redeemExactSetForETH).toBeDefined()
    expect(contract.functions.redeemExactSetForToken).toBeDefined()
  })
})

describe('getFlashMintZeroExContractForToken()', () => {
  test('returns Set Protocol contract as default', async () => {
    const expectedAddress = Contracts[ChainId.Mainnet].ExchangeIssuanceZeroEx
    const contract = getFlashMintZeroExContractForToken('', undefined)
    expect(contract.address).toEqual(expectedAddress)
    expect(contract.functions.getRequiredIssuanceComponents).toBeDefined()
    expect(contract.functions.getRequiredRedemptionComponents).toBeDefined()
    expect(contract.functions.issueExactSetFromETH).toBeDefined()
    expect(contract.functions.issueExactSetFromToken).toBeDefined()
    expect(contract.functions.redeemExactSetForETH).toBeDefined()
    expect(contract.functions.redeemExactSetForToken).toBeDefined()
  })
})
