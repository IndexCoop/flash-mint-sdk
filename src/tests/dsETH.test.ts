import { BigNumber } from '@ethersproject/bignumber'

import { EthereumDiversifiedStakingIndex, WETH } from 'constants/tokens'
import { FlashMintZeroEx } from 'flashMint/zeroEx'
import { QuoteToken } from 'quote/quoteToken'
import { getFlashMintZeroExQuote } from 'quote/zeroEx'
import { getFlashMintZeroExContractForToken } from 'utils/contracts'
import { getIssuanceModule } from 'utils/issuanceModules'
import { wei } from 'utils/numbers'
import {
  approveErc20,
  createERC20Contract,
  LocalhostProvider,
  SignerAccount0,
  ZeroExApiSwapQuote,
} from 'tests/utils'

const provider = LocalhostProvider

const dsETH = {
  address: EthereumDiversifiedStakingIndex.address!,
  decimals: 18,
  symbol: EthereumDiversifiedStakingIndex.symbol,
}
const ETH = {
  address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
  decimals: 18,
  symbol: 'ETH',
}

describe('FlashMintZeroEx - ETH-dsETH', () => {
  beforeEach((): void => {
    jest.setTimeout(10000000)
  })

  test('minting with ETH', async () => {
    const inputToken = ETH
    const outputToken = dsETH
    const indexTokenAmount = wei('1')

    await mint(inputToken, outputToken, indexTokenAmount)
  })

  test('redeeming to ETH', async () => {
    const inputToken = dsETH
    const outputToken = ETH
    const indexTokenAmount = wei('1')

    await redeem(inputToken, outputToken, indexTokenAmount)
  })
})

async function mint(
  inputToken: QuoteToken,
  outputToken: QuoteToken,
  indexTokenAmount: BigNumber,
  slippage = 0.5
) {
  const chainId = 1
  const signer = SignerAccount0
  const zeroExApi = ZeroExApiSwapQuote

  const indexToken = outputToken
  const isMinting = true

  const quote = await getFlashMintZeroExQuote(
    inputToken,
    outputToken,
    indexTokenAmount,
    isMinting,
    slippage,
    zeroExApi,
    provider,
    chainId
  )
  expect(quote).toBeDefined()
  if (!quote) fail()
  expect(quote?.componentQuotes.length).toBeGreaterThan(0)
  expect(quote?.inputOutputTokenAmount).toBeDefined()
  expect(quote?.inputOutputTokenAmount).not.toBe(BigNumber.from(0))
  expect(quote?.setTokenAmount).toEqual(indexTokenAmount)

  // Get FlashMintZeroEx contract instance and issuance module (debtV2)
  const contract = getFlashMintZeroExContractForToken(
    indexToken.symbol,
    signer,
    chainId
  )
  const issuanceModule = getIssuanceModule(indexToken.symbol, chainId)

  console.log(contract.address, 'contract')
  console.log(issuanceModule.address, issuanceModule.isDebtIssuance, 'issuance')

  // TODO: if not eth approve erc20 token amount

  const gasEstimate = await contract.estimateGas.issueExactSetFromETH(
    indexToken.address,
    indexTokenAmount,
    quote.componentQuotes,
    issuanceModule.address,
    issuanceModule.isDebtIssuance,
    { value: quote.inputOutputTokenAmount }
  )
  console.log(gasEstimate.toString())

  const flashMint = new FlashMintZeroEx(contract)
  const tx = await flashMint.mintExactSetFromETH(
    indexToken.address,
    indexTokenAmount,
    quote.componentQuotes,
    issuanceModule.address,
    issuanceModule.isDebtIssuance,
    quote.inputOutputTokenAmount,
    { gasLimit: gasEstimate }
  )
  if (!tx) fail()
  tx.wait()
  const indexTokenErc20 = createERC20Contract(indexToken.address, signer)
  const balanceOutputToken: BigNumber = await indexTokenErc20.balanceOf(
    signer.address
  )
  console.log(balanceOutputToken.toString())
  expect(balanceOutputToken.gt(0)).toEqual(true)
}

async function redeem(
  inputToken: QuoteToken,
  outputToken: QuoteToken,
  indexTokenAmount: BigNumber,
  slippage = 0.5
) {
  const chainId = 1
  const signer = SignerAccount0
  const zeroExApi = ZeroExApiSwapQuote

  const indexToken = inputToken
  const isMinting = false

  const quote = await getFlashMintZeroExQuote(
    inputToken,
    outputToken,
    indexTokenAmount,
    isMinting,
    slippage,
    zeroExApi,
    provider,
    chainId
  )
  expect(quote).toBeDefined()
  if (!quote) fail()
  expect(quote?.componentQuotes.length).toBeGreaterThan(0)
  expect(quote?.inputOutputTokenAmount).toBeDefined()
  expect(quote?.inputOutputTokenAmount).not.toBe(BigNumber.from(0))
  expect(quote?.setTokenAmount).toEqual(indexTokenAmount)

  // Get FlashMintZeroEx contract instance and issuance module (debtV2)
  const contract = getFlashMintZeroExContractForToken(
    indexToken.symbol,
    signer,
    chainId
  )
  const issuanceModule = getIssuanceModule(indexToken.symbol, chainId)

  console.log(contract.address, 'contract')
  console.log(issuanceModule.address, issuanceModule.isDebtIssuance, 'issuance')

  await approveErc20(
    indexToken.address,
    contract.address,
    indexTokenAmount,
    signer
  )

  const gasEstimate = await contract.estimateGas.redeemExactSetForETH(
    indexToken.address,
    indexTokenAmount,
    quote.inputOutputTokenAmount,
    quote.componentQuotes,
    issuanceModule.address,
    issuanceModule.isDebtIssuance
  )
  console.log(gasEstimate.toString())

  const indexTokenErc20 = createERC20Contract(indexToken.address, signer)
  const previousBalance: BigNumber = await indexTokenErc20.balanceOf(
    signer.address
  )
  console.log(previousBalance.toString(), 'previous')
  expect(previousBalance.gt(0)).toEqual(true)

  const flashMint = new FlashMintZeroEx(contract)
  const tx = await flashMint.redeemExactSetForETH(
    indexToken.address,
    indexTokenAmount,
    quote.inputOutputTokenAmount,
    quote.componentQuotes,
    issuanceModule.address,
    issuanceModule.isDebtIssuance,
    { gasLimit: gasEstimate }
  )
  if (!tx) fail()
  tx.wait()

  const balance: BigNumber = await indexTokenErc20.balanceOf(signer.address)
  console.log(balance.toString())
  expect(balance.lt(previousBalance)).toEqual(true)
}
