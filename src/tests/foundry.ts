import { network } from 'hardhat'
import { type Address, formatEther, parseEther, toHex } from 'viem'
import { createClientWithUrl } from '../utils/clients'

const client = createClientWithUrl(1, 'http://localhost:8545')!

async function getTestAccountBalance(account: Address) {
  const balance = await client.getBalance({ address: account })
  console.log(`💰 Balance of ${account}: ${formatEther(balance)} ETH`)
  return balance
}

async function setTestAccountBalance(account: string, balance: string) {
  await network.provider.send('anvil_setBalance', [
    account,
    toHex(parseEther(balance)),
  ])
  console.log(`Balance of ${balance} ETH set for account: ${account}`)
}

async function main() {
  const testAccount = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
  const balance = '1'
  await setTestAccountBalance(testAccount, balance)
  const balanceAfter = await getTestAccountBalance(testAccount)
  console.log(balanceAfter.toString())
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
