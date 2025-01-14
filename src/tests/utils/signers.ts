import type { JsonRpcProvider } from '@ethersproject/providers'
import { Wallet } from '@ethersproject/wallet'

export { wei } from 'utils/numbers'

export function getSignerAccount(num: number, provider: JsonRpcProvider) {
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
