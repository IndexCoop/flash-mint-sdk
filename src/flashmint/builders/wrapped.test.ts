import { BigNumber } from '@ethersproject/bignumber'

import { ChainId } from 'constants/chains'
import { Contracts } from 'constants/contracts'
import { getLocalHostProviderUrl } from 'tests/utils'
import { getFlashMintWrappedContract } from 'utils/contracts'
import { wei } from 'utils/numbers'
import { getRpcProvider } from 'utils/rpc-provider'
import { ComponentWrapData } from 'utils/wrap-data'

import {
  FlashMintWrappedBuildRequest,
  WrappedTransactionBuilder,
} from './wrapped'
import { getTokenByChainAndSymbol } from '@indexcoop/tokenlists'

const chainId = ChainId.Base
const rpcUrl = getLocalHostProviderUrl(chainId)

const FlashMintWrappedAddress = Contracts[chainId].FlashMintWrapped
const eth = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
const indexToken = getTokenByChainAndSymbol(chainId, 'icUSD').address
const usdcAddress = getTokenByChainAndSymbol(chainId, 'USDC').address
const ZERO_BYTES = '0x0000000000000000000000000000000000000000'

describe('WrappedTransactionBuilder()', () => {
  test('returns null for invalid request (no index token)', async () => {
    const buildRequest = getDefaultBuildRequest()
    buildRequest.indexToken = ''
    const builder = new WrappedTransactionBuilder(rpcUrl)
    const tx = await builder.build(buildRequest)
    expect(tx).toBeNull()
  })

  test('returns null for invalid request (no input/output token)', async () => {
    const buildRequest = getDefaultBuildRequest()
    buildRequest.inputOutputToken = ''
    const builder = new WrappedTransactionBuilder(rpcUrl)
    const tx = await builder.build(buildRequest)
    expect(tx).toBeNull()
  })

  test('returns null for invalid request (indexTokenAmount = 0)', async () => {
    const buildRequest = getDefaultBuildRequest()
    buildRequest.indexTokenAmount = BigNumber.from(0)
    const builder = new WrappedTransactionBuilder(rpcUrl)
    const tx = await builder.build(buildRequest)
    expect(tx).toBeNull()
  })

  test('returns null for invalid request (inputOutputTokenAmount = 0)', async () => {
    const buildRequest = getDefaultBuildRequest()
    buildRequest.inputOutputTokenAmount = BigNumber.from(0)
    const builder = new WrappedTransactionBuilder(rpcUrl)
    const tx = await builder.build(buildRequest)
    expect(tx).toBeNull()
  })

  test('returns null for invalid request (no component swap data)', async () => {
    const buildRequest = getDefaultBuildRequest()
    buildRequest.componentSwapData = []
    const builder = new WrappedTransactionBuilder(rpcUrl)
    const tx = await builder.build(buildRequest)
    expect(tx).toBeNull()
  })

  test('returns null for invalid request (no wrap data)', async () => {
    const buildRequest = getDefaultBuildRequest()
    buildRequest.componentWrapData = []
    const builder = new WrappedTransactionBuilder(rpcUrl)
    const tx = await builder.build(buildRequest)
    expect(tx).toBeNull()
  })

  test('returns null for invalid request (wrap data and swap data length mismatch)', async () => {
    const buildRequest = getDefaultBuildRequest()
    buildRequest.componentWrapData = buildRequest.componentWrapData.slice(0, -1)
    const builder = new WrappedTransactionBuilder(rpcUrl)
    const tx = await builder.build(buildRequest)
    expect(tx).toBeNull()
  })

  test('returns a tx for icUSD (ERC20)', async () => {
    const buildRequest = getDefaultBuildRequest()
    const provider = getRpcProvider(rpcUrl)
    const contract = getFlashMintWrappedContract(provider)
    const refTx = await contract.populateTransaction.issueExactSetFromERC20(
      buildRequest.indexToken,
      buildRequest.inputOutputToken,
      buildRequest.indexTokenAmount,
      buildRequest.inputOutputTokenAmount,
      buildRequest.componentSwapData,
      buildRequest.componentWrapData
    )
    const builder = new WrappedTransactionBuilder(rpcUrl)
    const tx = await builder.build(buildRequest)
    if (!tx) fail()
    expect(tx.to).toBe(FlashMintWrappedAddress)
    expect(tx.data).toEqual(refTx.data)
  })

  test('returns a tx for minting icUSD (ETH)', async () => {
    const buildRequest = getDefaultBuildRequest(true, eth, 'ETH')
    const provider = getRpcProvider(rpcUrl)
    const contract = getFlashMintWrappedContract(provider)
    const refTx = await contract.populateTransaction.issueExactSetFromETH(
      buildRequest.indexToken,
      buildRequest.indexTokenAmount,
      buildRequest.componentSwapData,
      buildRequest.componentWrapData,
      { value: buildRequest.inputOutputTokenAmount }
    )
    const builder = new WrappedTransactionBuilder(rpcUrl)
    const tx = await builder.build(buildRequest)
    if (!tx) fail()
    expect(tx.to).toBe(FlashMintWrappedAddress)
    expect(tx.data).toEqual(refTx.data)
    expect(tx.value).toEqual(buildRequest.inputOutputTokenAmount)
  })

  test('returns a tx for redeeming icUSD (ERC20)', async () => {
    const buildRequest = getDefaultBuildRequest(false)
    const provider = getRpcProvider(rpcUrl)
    const contract = getFlashMintWrappedContract(provider)
    const refTx = await contract.populateTransaction.redeemExactSetForERC20(
      buildRequest.indexToken,
      buildRequest.inputOutputToken,
      buildRequest.indexTokenAmount,
      buildRequest.inputOutputTokenAmount,
      buildRequest.componentSwapData,
      buildRequest.componentWrapData
    )
    const builder = new WrappedTransactionBuilder(rpcUrl)
    const tx = await builder.build(buildRequest)
    if (!tx) fail()
    expect(tx.to).toBe(FlashMintWrappedAddress)
    expect(tx.data).toEqual(refTx.data)
  })

  test('returns a tx for redeeming icUSD (ETH)', async () => {
    const buildRequest = getDefaultBuildRequest(false, eth, 'ETH')
    const provider = getRpcProvider(rpcUrl)
    const contract = getFlashMintWrappedContract(provider)
    const refTx = await contract.populateTransaction.redeemExactSetForETH(
      buildRequest.indexToken,
      buildRequest.indexTokenAmount,
      buildRequest.inputOutputTokenAmount,
      buildRequest.componentSwapData,
      buildRequest.componentWrapData
    )
    const builder = new WrappedTransactionBuilder(rpcUrl)
    const tx = await builder.build(buildRequest)
    if (!tx) fail()
    expect(tx.to).toBe(FlashMintWrappedAddress)
    expect(tx.data).toEqual(refTx.data)
  })
})

function getDefaultBuildRequest(
  isMinting = true,
  inputOutputToken: string = usdcAddress,
  inputOutputTokenSymbol = 'USDC'
): FlashMintWrappedBuildRequest {
  const wrapData: ComponentWrapData = {
    integrationName: '',
    wrapData: ZERO_BYTES,
  }
  return {
    chainId: ChainId.Base,
    isMinting,
    indexToken,
    inputOutputToken,
    indexTokenAmount: wei(1),
    inputOutputTokenAmount: BigNumber.from('16583822409709138541'),
    inputOutputTokenSymbol,
    componentSwapData: [
      {
        underlyingERC20: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        buyUnderlyingAmount: BigNumber.from('16666666666666666666'),
        dexData: {
          exchange: 3,
          path: [
            '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
            '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
            '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
          ],
          fees: [3000, 3000],
          pool: '0x0000000000000000000000000000000000000000',
          poolIds: [],
        },
      },
      {
        underlyingERC20: '0xdac17f958d2ee523a2206206994597c13d831ec7',
        buyUnderlyingAmount: BigNumber.from('16666666666666666666'),
        dexData: {
          exchange: 3,
          path: [
            '0xdac17f958d2ee523a2206206994597c13d831ec7',
            '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
            '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
          ],
          fees: [3000, 3000],
          pool: '0x0000000000000000000000000000000000000000',
          poolIds: [],
        },
      },
      {
        underlyingERC20: '0xdac17f958d2ee523a2206206994597c13d831ec7',
        buyUnderlyingAmount: BigNumber.from('16666666666666666666'),
        dexData: {
          exchange: 3,
          path: [
            '0xdac17f958d2ee523a2206206994597c13d831ec7',
            '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
            '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
          ],
          fees: [3000, 3000],
          pool: '0x0000000000000000000000000000000000000000',
          poolIds: [],
        },
      },
      {
        underlyingERC20: '0x6b175474e89094c44da98b954eedeac495271d0f',
        buyUnderlyingAmount: BigNumber.from('1666666666'),
        dexData: {
          exchange: 3,
          path: [
            '0x6b175474e89094c44da98b954eedeac495271d0f',
            '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
            '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
          ],
          fees: [3000, 3000],
          pool: '0x0000000000000000000000000000000000000000',
          poolIds: [],
        },
      },
      {
        underlyingERC20: '0x6b175474e89094c44da98b954eedeac495271d0f',
        buyUnderlyingAmount: BigNumber.from('1666666666'),
        dexData: {
          exchange: 3,
          path: [
            '0x6b175474e89094c44da98b954eedeac495271d0f',
            '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
            '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
          ],
          fees: [3000, 3000],
          pool: '0x0000000000000000000000000000000000000000',
          poolIds: [],
        },
      },
      {
        underlyingERC20: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        buyUnderlyingAmount: BigNumber.from('1666666666'),
        dexData: {
          exchange: 3,
          path: [
            '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
            '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
            '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
          ],
          fees: [3000, 3000],
          pool: '0x0000000000000000000000000000000000000000',
          poolIds: [],
        },
      },
    ],
    componentWrapData: [
      wrapData,
      wrapData,
      wrapData,
      wrapData,
      wrapData,
      wrapData,
    ],
  }
}
