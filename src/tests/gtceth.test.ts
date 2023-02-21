import { GitcoinStakedETHIndex, WETH } from 'constants/tokens'
import { wei } from 'utils/numbers'

import { mint, mintERC20 } from './dsETH/dsETH.helpers'
import { SignerAccount0, wrapETH } from './utils'

const signer = SignerAccount0

export const gtcETH = {
  address: GitcoinStakedETHIndex.address!,
  decimals: 18,
  symbol: GitcoinStakedETHIndex.symbol,
}

export const WETH9 = {
  address: WETH.address!,
  decimals: 18,
  symbol: WETH.symbol,
}

describe('FlashMintZeroEx - gtcETH', () => {
  const outputToken = gtcETH
  const indexTokenAmount = wei('0.1')

  beforeEach((): void => {
    jest.setTimeout(10000000)
  })

  test('minting with ETH', async () => {
    await mint(outputToken, indexTokenAmount)
  })

  test('minting with WETH', async () => {
    const inputToken = WETH9
    await wrapETH(wei(2), signer)
    await mintERC20(inputToken, outputToken, indexTokenAmount, 0.5, signer)
  })
})
