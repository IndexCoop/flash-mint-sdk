import { getTokenByChainAndSymbol } from '@indexcoop/tokenlists'
import { ETH } from 'constants/tokens'
import { getTestFactoryZeroExV2, transferFromWhale, wei } from './utils'

import type { TestFactory } from './utils'

// Run locally only.
describe.skip('DPI (mainnet)', () => {
  const DPI = getTokenByChainAndSymbol(1, 'DPI')
  let factory: TestFactory
  beforeEach(async () => {
    factory = getTestFactoryZeroExV2(4)
  })

  test('can redeem to ETH', async () => {
    const whale = '0xD68407500087C38e39232f5dcF2214D7f46E7456'
    await transferFromWhale(
      whale,
      factory.getSigner().address,
      wei('2'),
      DPI.address,
      factory.getProvider(),
    )
    await factory.fetchQuote({
      isMinting: false,
      inputToken: DPI,
      outputToken: ETH,
      indexTokenAmount: wei('1').toString(),
      inputTokenAmount: wei('1').toString(),
      slippage: 0.5,
    })
    await factory.executeTx()
  })
})
