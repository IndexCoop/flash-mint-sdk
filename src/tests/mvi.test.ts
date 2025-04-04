import { BigNumber } from '@ethersproject/bignumber'
import { getTokenByChainAndSymbol } from '@indexcoop/tokenlists'
import { ETH } from 'constants/tokens'
import { getTestFactoryZeroExV2, transferFromWhale, wei } from './utils'

import type { TestFactory } from './utils'

// Run locally only.
describe.skip('MVI (mainnet)', () => {
  const MVI = getTokenByChainAndSymbol(1, 'MVI')
  let factory: TestFactory
  beforeEach(async () => {
    factory = getTestFactoryZeroExV2(4)
  })

  test('can redeem to ETH', async () => {
    const whale = '0xEADD4A4E9FD0815ddE96eeC2808d90F5ebFcA75e'
    await transferFromWhale(
      whale,
      factory.getSigner().address,
      wei('2'),
      MVI.address,
      factory.getProvider(),
    )
    await factory.fetchQuote({
      chainId: 1,
      isMinting: false,
      inputToken: MVI,
      outputToken: ETH,
      indexTokenAmount: wei('1').toString(),
      inputTokenAmount: wei('1').toString(),
      slippage: 0.5,
    })
    await factory.executeTx(BigNumber.from(6_000_000))
  })
})
