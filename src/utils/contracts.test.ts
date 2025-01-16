import { getTokenByChainAndSymbol } from '@indexcoop/tokenlists'

import { ChainId } from 'constants/chains'
import {
  Contracts,
  ExchangeIssuanceLeveragedMainnetAddress,
  ExchangeIssuanceLeveragedPolygonAddress,
  ExchangeIssuanceZeroExMainnetAddress,
  ExchangeIssuanceZeroExPolygonAddress,
  FlashMintLeveragedAddress,
  FlashMintLeveragedForCompoundAddress,
} from 'constants/contracts'
import {
  IndexCoopEthereum2xIndex,
  IndexCoopEthereum3xIndex,
  IndexCoopInverseBitcoinIndex,
  IndexCoopInverseEthereumIndex,
  InterestCompoundingETHIndex,
} from 'constants/tokens'

import {
  getExchangeIssuanceLeveragedContractAddress,
  getExchangeIssuanceZeroExContractAddress,
  getFlashMintHyEthContract,
  getFlashMintLeveragedContract,
  getFlashMintLeveragedContractForToken,
  getFlashMintLeveragedForCompoundContract,
  getFlashMintNavContract,
  getFlashMintWrappedContract,
  getFlashMintZeroExContract,
  getFlashMintZeroExContractForToken,
} from './contracts'

describe('getExchangeIssuanceLeveragedContractAddress()', () => {
  test('return correct address for polygon', async () => {
    const expectedAddress = ExchangeIssuanceLeveragedPolygonAddress
    const address = getExchangeIssuanceLeveragedContractAddress(137)
    expect(address).toEqual(expectedAddress)
  })

  test('return correct address for mainnet', async () => {
    const expectedAddress = ExchangeIssuanceLeveragedMainnetAddress
    const address = getExchangeIssuanceLeveragedContractAddress(1)
    expect(address).toEqual(expectedAddress)
  })

  test('returns mainnet by default', async () => {
    const expectedAddress = ExchangeIssuanceLeveragedMainnetAddress
    const address = getExchangeIssuanceLeveragedContractAddress()
    expect(address).toEqual(expectedAddress)
  })
})

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

describe('getFlashMintLeveragedContract()', () => {
  test('return correct address for polygon', async () => {
    const expectedAddress = ExchangeIssuanceLeveragedPolygonAddress
    const contract = getFlashMintLeveragedContract(undefined, 137)
    expect(contract.address).toEqual(expectedAddress)
    expect(contract.functions.getLeveragedTokenData).toBeDefined()
    expect(contract.functions.issueExactSetFromERC20).toBeDefined()
    expect(contract.functions.issueExactSetFromETH).toBeDefined()
    expect(contract.functions.redeemExactSetForERC20).toBeDefined()
    expect(contract.functions.redeemExactSetForETH).toBeDefined()
  })

  test('return correct address for mainnet', async () => {
    const expectedAddress = ExchangeIssuanceLeveragedMainnetAddress
    const contract = getFlashMintLeveragedContract(undefined, 1)
    expect(contract.address).toEqual(expectedAddress)
    expect(contract.functions.getLeveragedTokenData).toBeDefined()
    expect(contract.functions.issueExactSetFromERC20).toBeDefined()
    expect(contract.functions.issueExactSetFromETH).toBeDefined()
    expect(contract.functions.redeemExactSetForERC20).toBeDefined()
    expect(contract.functions.redeemExactSetForETH).toBeDefined()
  })

  test('returns mainnet by default', async () => {
    const expectedAddress = ExchangeIssuanceLeveragedPolygonAddress
    const contract = getFlashMintLeveragedContract(undefined)
    expect(contract.address).toEqual(expectedAddress)
  })
})

describe('getFlashMintLeveragedForCompoundContract()', () => {
  test('returns correct contract', async () => {
    const expectedAddress = FlashMintLeveragedForCompoundAddress
    const contract = getFlashMintLeveragedForCompoundContract(undefined)
    expect(contract.address).toEqual(expectedAddress)
    expect(contract.functions.getLeveragedTokenData).toBeDefined()
    expect(contract.functions.issueExactSetFromERC20).toBeDefined()
    expect(contract.functions.issueExactSetFromETH).toBeDefined()
    expect(contract.functions.redeemExactSetForERC20).toBeDefined()
    expect(contract.functions.redeemExactSetForETH).toBeDefined()
  })
})

describe('getFlashMintLeveragedContractForToken()', () => {
  test('returns the regular FlashMintLeveraged contract by default (polygon)', async () => {
    const expectedAddress = ExchangeIssuanceLeveragedPolygonAddress
    const contract = getFlashMintLeveragedContractForToken(
      InterestCompoundingETHIndex.symbol,
      undefined,
    )
    expect(contract.address).toEqual(expectedAddress)
    expect(contract.functions.getLeveragedTokenData).toBeDefined()
    expect(contract.functions.issueExactSetFromERC20).toBeDefined()
    expect(contract.functions.issueExactSetFromETH).toBeDefined()
    expect(contract.functions.redeemExactSetForERC20).toBeDefined()
    expect(contract.functions.redeemExactSetForETH).toBeDefined()
  })

  test('returns the old FlashMintLeveraged contract (mainnet)', async () => {
    const expectedAddress = ExchangeIssuanceLeveragedMainnetAddress
    const contract = getFlashMintLeveragedContractForToken(
      InterestCompoundingETHIndex.symbol,
      undefined,
      1,
    )
    expect(contract.address).toEqual(expectedAddress)
    expect(contract.functions.getLeveragedTokenData).toBeDefined()
    expect(contract.functions.issueExactSetFromERC20).toBeDefined()
    expect(contract.functions.issueExactSetFromETH).toBeDefined()
    expect(contract.functions.redeemExactSetForERC20).toBeDefined()
    expect(contract.functions.redeemExactSetForETH).toBeDefined()
  })
})

describe('getFlashMintNavContract()', () => {
  test('returns correct contract', async () => {
    const expectedAddress = Contracts[ChainId.Mainnet].FlashMintNav
    const contract = getFlashMintNavContract(undefined)
    expect(contract.address).toEqual(expectedAddress)
    expect(contract.functions.getIssueAmount).toBeDefined()
    expect(contract.functions.getRedeemAmountOut).toBeDefined()
    expect(contract.functions.issueSetFromExactERC20).toBeDefined()
    expect(contract.functions.issueSetFromExactETH).toBeDefined()
    expect(contract.functions.redeemExactSetForERC20).toBeDefined()
    expect(contract.functions.redeemExactSetForETH).toBeDefined()
  })
})

describe('getFlashMintWrappedContract()', () => {
  test('returns correct contract', async () => {
    const expectedAddress = Contracts[ChainId.Mainnet].FlashMintWrapped
    const contract = getFlashMintWrappedContract(undefined)
    expect(contract.address).toEqual(expectedAddress)
    expect(contract.functions.getIssueExactSet).toBeDefined()
    expect(contract.functions.getRedeemExactSet).toBeDefined()
    expect(contract.functions.issueExactSetFromERC20).toBeDefined()
    expect(contract.functions.issueExactSetFromETH).toBeDefined()
    expect(contract.functions.redeemExactSetForERC20).toBeDefined()
    expect(contract.functions.redeemExactSetForETH).toBeDefined()
  })

  test('returns correct contract for Base', async () => {
    const expectedAddress = Contracts[ChainId.Base].FlashMintWrapped
    const contract = getFlashMintWrappedContract(undefined, ChainId.Base)
    expect(contract.address).toEqual(expectedAddress)
    expect(contract.functions.getIssueExactSet).toBeDefined()
    expect(contract.functions.getRedeemExactSet).toBeDefined()
    expect(contract.functions.issueExactSetFromERC20).toBeDefined()
    expect(contract.functions.issueExactSetFromETH).toBeDefined()
    expect(contract.functions.redeemExactSetForERC20).toBeDefined()
    expect(contract.functions.redeemExactSetForETH).toBeDefined()
  })
})

describe('getExchangeIssuanceZeroExContractAddress()', () => {
  test('return correct address for polygon', async () => {
    const expectedAddress = ExchangeIssuanceZeroExPolygonAddress
    const address = getExchangeIssuanceZeroExContractAddress(137)
    expect(address).toEqual(expectedAddress)
  })

  test('return correct address for mainnet', async () => {
    const expectedAddress = ExchangeIssuanceZeroExMainnetAddress
    const address = getExchangeIssuanceZeroExContractAddress(1)
    expect(address).toEqual(expectedAddress)
  })

  test('returns mainnet by default', async () => {
    const expectedAddress = ExchangeIssuanceZeroExMainnetAddress
    const address = getExchangeIssuanceZeroExContractAddress()
    expect(address).toEqual(expectedAddress)
  })

  test('returns mainnet contract by default', async () => {
    const expectedAddress = ExchangeIssuanceZeroExMainnetAddress
    const contract = getFlashMintZeroExContract(undefined)
    expect(contract.address).toEqual(expectedAddress)
  })
})

describe('getFlashMintZeroExContract()', () => {
  test('return correct contract for polygon', async () => {
    const expectedAddress = ExchangeIssuanceZeroExPolygonAddress
    const contract = getFlashMintZeroExContract(undefined, 137)
    expect(contract.address).toEqual(expectedAddress)
    expect(contract.functions.getRequiredIssuanceComponents).toBeDefined()
    expect(contract.functions.getRequiredRedemptionComponents).toBeDefined()
    expect(contract.functions.issueExactSetFromETH).toBeDefined()
    expect(contract.functions.issueExactSetFromToken).toBeDefined()
    expect(contract.functions.redeemExactSetForETH).toBeDefined()
    expect(contract.functions.redeemExactSetForToken).toBeDefined()
  })

  test('return correct contract for mainnet', async () => {
    const expectedAddress = ExchangeIssuanceZeroExMainnetAddress
    const contract = getFlashMintZeroExContract(undefined, 1)
    expect(contract.address).toEqual(expectedAddress)
    expect(contract.functions.getRequiredIssuanceComponents).toBeDefined()
    expect(contract.functions.getRequiredRedemptionComponents).toBeDefined()
    expect(contract.functions.issueExactSetFromETH).toBeDefined()
    expect(contract.functions.issueExactSetFromToken).toBeDefined()
    expect(contract.functions.redeemExactSetForETH).toBeDefined()
    expect(contract.functions.redeemExactSetForToken).toBeDefined()
  })

  test('returns mainnet contract by default', async () => {
    const expectedAddress = ExchangeIssuanceZeroExMainnetAddress
    const contract = getFlashMintZeroExContract(undefined)
    expect(contract.address).toEqual(expectedAddress)
  })
})

describe('getFlashMintZeroExContractForToken()', () => {
  test('returns Set Protocol contract as default', async () => {
    const expectedAddress = ExchangeIssuanceZeroExMainnetAddress
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

describe('BTC2X', () => {
  test('return correct contract for token - mainnet', async () => {
    const expectedAddress = FlashMintLeveragedAddress
    const contract = getFlashMintLeveragedContractForToken(
      getTokenByChainAndSymbol(ChainId.Mainnet, 'BTC2X').symbol,
      undefined,
    )
    expect(contract.address).toEqual(expectedAddress)
    expect(contract.functions.getLeveragedTokenData).toBeDefined()
    expect(contract.functions.issueExactSetFromERC20).toBeDefined()
    expect(contract.functions.issueExactSetFromETH).toBeDefined()
    expect(contract.functions.redeemExactSetForERC20).toBeDefined()
    expect(contract.functions.redeemExactSetForETH).toBeDefined()
  })

  test('return correct contract for token - arbitrum', async () => {
    const chainId = ChainId.Arbitrum
    const contract = getFlashMintLeveragedContractForToken(
      getTokenByChainAndSymbol(chainId, 'BTC2X').symbol,
      undefined,
      chainId,
    )
    const expectedAddress = Contracts[chainId].FlashMintLeveragedExtended
    expect(contract.address).toEqual(expectedAddress)
    expect(contract.functions.getLeveragedTokenData).toBeDefined()
    expect(contract.functions.issueExactSetFromERC20).toBeDefined()
    expect(contract.functions.issueExactSetFromETH).toBeDefined()
    expect(contract.functions.redeemExactSetForERC20).toBeDefined()
    expect(contract.functions.redeemExactSetForETH).toBeDefined()
    // Functions specific to extended contract
    expect(contract.functions.issueExactSetFromERC20).toBeDefined()
    expect(contract.functions.issueExactSetFromETH).toBeDefined()
  })

  test('return correct contract for token - base', async () => {
    const chainId = ChainId.Base
    const contract = getFlashMintLeveragedContractForToken(
      getTokenByChainAndSymbol(chainId, 'BTC2X').symbol,
      undefined,
      chainId,
    )
    const expectedAddress = Contracts[chainId].FlashMintLeveragedAerodrome
    expect(contract.address).toEqual(expectedAddress)
    expect(contract.functions.getLeveragedTokenData).toBeDefined()
    expect(contract.functions.issueExactSetFromERC20).toBeDefined()
    expect(contract.functions.issueExactSetFromETH).toBeDefined()
    expect(contract.functions.redeemExactSetForERC20).toBeDefined()
    expect(contract.functions.redeemExactSetForETH).toBeDefined()
    // Functions specific to extended contract
    expect(contract.functions.issueExactSetFromERC20).toBeDefined()
    expect(contract.functions.issueExactSetFromETH).toBeDefined()
  })
})

describe('BTC2xETH', () => {
  test('return correct contract for token - arbitrum', async () => {
    const chainId = ChainId.Arbitrum
    const contract = getFlashMintLeveragedContractForToken(
      'BTC2xETH',
      undefined,
      chainId,
    )
    const expectedAddress = Contracts[chainId].FlashMintLeveragedExtended
    expect(contract.address).toEqual(expectedAddress)
    expect(contract.functions.getLeveragedTokenData).toBeDefined()
    expect(contract.functions.issueExactSetFromERC20).toBeDefined()
    expect(contract.functions.issueExactSetFromETH).toBeDefined()
    expect(contract.functions.redeemExactSetForERC20).toBeDefined()
    expect(contract.functions.redeemExactSetForETH).toBeDefined()
    // Functions specific to extended contract
    expect(contract.functions.issueExactSetFromERC20).toBeDefined()
    expect(contract.functions.issueExactSetFromETH).toBeDefined()
  })
})

describe('BTC3X', () => {
  test('return correct contract for token - arbitrum', async () => {
    const chainId = ChainId.Arbitrum
    const contract = getFlashMintLeveragedContractForToken(
      getTokenByChainAndSymbol(chainId, 'BTC3X').symbol,
      undefined,
      chainId,
    )
    const expectedAddress = Contracts[chainId].FlashMintLeveragedExtended
    expect(contract.address).toEqual(expectedAddress)
    expect(contract.functions.getLeveragedTokenData).toBeDefined()
    expect(contract.functions.issueExactSetFromERC20).toBeDefined()
    expect(contract.functions.issueExactSetFromETH).toBeDefined()
    expect(contract.functions.redeemExactSetForERC20).toBeDefined()
    expect(contract.functions.redeemExactSetForETH).toBeDefined()
    // Functions specific to extended contract
    expect(contract.functions.issueExactSetFromERC20).toBeDefined()
    expect(contract.functions.issueExactSetFromETH).toBeDefined()
  })

  test('return correct contract for token - base', async () => {
    const chainId = ChainId.Base
    const contract = getFlashMintLeveragedContractForToken(
      getTokenByChainAndSymbol(chainId, 'BTC3X').symbol,
      undefined,
      chainId,
    )
    const expectedAddress = Contracts[chainId].FlashMintLeveragedAerodrome
    expect(contract.address).toEqual(expectedAddress)
    expect(contract.functions.getLeveragedTokenData).toBeDefined()
    expect(contract.functions.issueExactSetFromERC20).toBeDefined()
    expect(contract.functions.issueExactSetFromETH).toBeDefined()
    expect(contract.functions.redeemExactSetForERC20).toBeDefined()
    expect(contract.functions.redeemExactSetForETH).toBeDefined()
    // Functions specific to extended contract
    expect(contract.functions.issueExactSetFromERC20).toBeDefined()
    expect(contract.functions.issueExactSetFromETH).toBeDefined()
  })
})

describe('ETH2X', () => {
  test('return correct contract for token - mainnet', async () => {
    const expectedAddress = FlashMintLeveragedAddress
    const contract = getFlashMintLeveragedContractForToken(
      IndexCoopEthereum2xIndex.symbol,
      undefined,
    )
    expect(contract.address).toEqual(expectedAddress)
    expect(contract.functions.getLeveragedTokenData).toBeDefined()
    expect(contract.functions.issueExactSetFromERC20).toBeDefined()
    expect(contract.functions.issueExactSetFromETH).toBeDefined()
    expect(contract.functions.redeemExactSetForERC20).toBeDefined()
    expect(contract.functions.redeemExactSetForETH).toBeDefined()
  })

  test('return correct contract for token - arbitrum', async () => {
    const chainId = ChainId.Arbitrum
    const contract = getFlashMintLeveragedContractForToken(
      IndexCoopEthereum2xIndex.symbol,
      undefined,
      chainId,
    )
    const expectedAddress = Contracts[chainId].FlashMintLeveragedExtended
    expect(contract.address).toEqual(expectedAddress)
    expect(contract.functions.getLeveragedTokenData).toBeDefined()
    expect(contract.functions.issueExactSetFromERC20).toBeDefined()
    expect(contract.functions.issueExactSetFromETH).toBeDefined()
    expect(contract.functions.redeemExactSetForERC20).toBeDefined()
    expect(contract.functions.redeemExactSetForETH).toBeDefined()
    // Functions specific to extended contract
    expect(contract.functions.issueExactSetFromERC20).toBeDefined()
    expect(contract.functions.issueExactSetFromETH).toBeDefined()
  })

  test('return correct contract for token - base', async () => {
    const chainId = ChainId.Base
    const contract = getFlashMintLeveragedContractForToken(
      IndexCoopEthereum2xIndex.symbol,
      undefined,
      chainId,
    )
    const expectedAddress = Contracts[chainId].FlashMintLeveragedExtended
    expect(contract.address).toEqual(expectedAddress)
    expect(contract.functions.getLeveragedTokenData).toBeDefined()
    expect(contract.functions.issueExactSetFromERC20).toBeDefined()
    expect(contract.functions.issueExactSetFromETH).toBeDefined()
    expect(contract.functions.redeemExactSetForERC20).toBeDefined()
    expect(contract.functions.redeemExactSetForETH).toBeDefined()
    // Functions specific to extended contract
    expect(contract.functions.issueExactSetFromERC20).toBeDefined()
    expect(contract.functions.issueExactSetFromETH).toBeDefined()
  })
})

describe('ETH2xBTC', () => {
  test('return correct contract for token - arbitrum', async () => {
    const chainId = ChainId.Arbitrum
    const contract = getFlashMintLeveragedContractForToken(
      'ETH2xBTC',
      undefined,
      chainId,
    )
    const expectedAddress = Contracts[chainId].FlashMintLeveragedExtended
    expect(contract.address).toEqual(expectedAddress)
    expect(contract.functions.getLeveragedTokenData).toBeDefined()
    expect(contract.functions.issueExactSetFromERC20).toBeDefined()
    expect(contract.functions.issueExactSetFromETH).toBeDefined()
    expect(contract.functions.redeemExactSetForERC20).toBeDefined()
    expect(contract.functions.redeemExactSetForETH).toBeDefined()
    // Functions specific to extended contract
    expect(contract.functions.issueExactSetFromERC20).toBeDefined()
    expect(contract.functions.issueExactSetFromETH).toBeDefined()
  })
})

describe('ETH3X', () => {
  test('return correct contract for token - arbitrum', async () => {
    const chainId = ChainId.Arbitrum
    const contract = getFlashMintLeveragedContractForToken(
      IndexCoopEthereum3xIndex.symbol,
      undefined,
      chainId,
    )
    const expectedAddress = Contracts[chainId].FlashMintLeveragedExtended
    expect(contract.address).toEqual(expectedAddress)
    expect(contract.functions.getLeveragedTokenData).toBeDefined()
    expect(contract.functions.issueExactSetFromERC20).toBeDefined()
    expect(contract.functions.issueExactSetFromETH).toBeDefined()
    expect(contract.functions.redeemExactSetForERC20).toBeDefined()
    expect(contract.functions.redeemExactSetForETH).toBeDefined()
    // Functions specific to extended contract
    expect(contract.functions.issueExactSetFromERC20).toBeDefined()
    expect(contract.functions.issueExactSetFromETH).toBeDefined()
  })

  test('return correct contract for token - base', async () => {
    const chainId = ChainId.Base
    const contract = getFlashMintLeveragedContractForToken(
      IndexCoopEthereum3xIndex.symbol,
      undefined,
      chainId,
    )
    const expectedAddress = Contracts[chainId].FlashMintLeveragedExtended
    expect(contract.address).toEqual(expectedAddress)
    expect(contract.functions.getLeveragedTokenData).toBeDefined()
    expect(contract.functions.issueExactSetFromERC20).toBeDefined()
    expect(contract.functions.issueExactSetFromETH).toBeDefined()
    expect(contract.functions.redeemExactSetForERC20).toBeDefined()
    expect(contract.functions.redeemExactSetForETH).toBeDefined()
    // Functions specific to extended contract
    expect(contract.functions.issueExactSetFromERC20).toBeDefined()
    expect(contract.functions.issueExactSetFromETH).toBeDefined()
  })
})

describe('iBTC1x', () => {
  test('return correct contract for token - arbitrum', async () => {
    const chainId = ChainId.Arbitrum
    const contract = getFlashMintLeveragedContractForToken(
      IndexCoopInverseBitcoinIndex.symbol,
      undefined,
      chainId,
    )
    const expectedAddress = Contracts[chainId].FlashMintLeveragedExtended
    expect(contract.address).toEqual(expectedAddress)
    expect(contract.functions.getLeveragedTokenData).toBeDefined()
    expect(contract.functions.issueExactSetFromERC20).toBeDefined()
    expect(contract.functions.issueExactSetFromETH).toBeDefined()
    expect(contract.functions.redeemExactSetForERC20).toBeDefined()
    expect(contract.functions.redeemExactSetForETH).toBeDefined()
    // Functions specific to extended contract
    expect(contract.functions.issueExactSetFromERC20).toBeDefined()
    expect(contract.functions.issueExactSetFromETH).toBeDefined()
  })
})

describe('iETH1x', () => {
  test('return correct contract for token - arbitrum', async () => {
    const chainId = ChainId.Arbitrum
    const contract = getFlashMintLeveragedContractForToken(
      IndexCoopInverseEthereumIndex.symbol,
      undefined,
      chainId,
    )
    const expectedAddress = Contracts[chainId].FlashMintLeveragedExtended
    expect(contract.address).toEqual(expectedAddress)
    expect(contract.functions.getLeveragedTokenData).toBeDefined()
    expect(contract.functions.issueExactSetFromERC20).toBeDefined()
    expect(contract.functions.issueExactSetFromETH).toBeDefined()
    expect(contract.functions.redeemExactSetForERC20).toBeDefined()
    expect(contract.functions.redeemExactSetForETH).toBeDefined()
    // Functions specific to extended contract
    expect(contract.functions.issueExactSetFromERC20).toBeDefined()
    expect(contract.functions.issueExactSetFromETH).toBeDefined()
  })
})
