import { JsonRpcProvider } from '@ethersproject/providers'
import { Wallet } from '@ethersproject/wallet'
import { getLocalHostProviderUrl } from 'tests/utils'
import { getRpcProvider } from 'utils/rpc-provider'

export { wei } from 'utils/numbers'

export function getSignerAccount(num = 0, provider: JsonRpcProvider) {
  let privateKey =
    '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'
  switch (num) {
    case 1:
      privateKey =
        '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d'
      break
    case 2:
      privateKey =
        '0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6'
      break
    case 3:
      privateKey =
        '0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6'
      break
    case 4:
      privateKey =
        '0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a'
      break
    case 5:
      privateKey =
        '0x8b3a350cf5c34c9194ca85829a2df0ec3153be0318b5e2d3348e872092edffba'
      break
  }
  return new Wallet(privateKey, provider)
}

// Mainnet only
const LocalhostProvider = getRpcProvider(getLocalHostProviderUrl(1))

// Hardhat Account #0
export const SignerAccount0 = new Wallet(
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
  LocalhostProvider
)

// Hardhat Account #1
export const SignerAccount1 = new Wallet(
  '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d',
  LocalhostProvider
)

// Hardhat Account #2
export const SignerAccount2 = new Wallet(
  '0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a',
  LocalhostProvider
)

// Hardhat Account #3
export const SignerAccount3 = new Wallet(
  '0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6',
  LocalhostProvider
)

// Hardhat Account #4
export const SignerAccount4 = new Wallet(
  '0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a',
  LocalhostProvider
)

// Hardhat Account #5
export const SignerAccount5 = new Wallet(
  '0x8b3a350cf5c34c9194ca85829a2df0ec3153be0318b5e2d3348e872092edffba',
  LocalhostProvider
)

// Hardhat Account #17
export const SignerAccount17 = new Wallet(
  '0x689af8efa8c651a91ad287602527f3af2fe9f6501a7ac4b061667b5a93e037fd',
  LocalhostProvider
)
