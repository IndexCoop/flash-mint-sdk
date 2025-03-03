import { network } from 'hardhat'
import {
  http,
  type Address,
  createWalletClient,
  formatEther,
  parseAbi,
  parseEther,
  parseUnits,
  toHex,
} from 'viem'
import { base } from 'viem/chains'
import { createClientWithUrl } from '../utils/clients'

const usdcAddress = '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913'

const client = createClientWithUrl(base.id, 'http://localhost:8545')!

const walletClient = createWalletClient({
  chain: base,
  transport: http(client.transport.url!),
})

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

/**
 * Gets the ERC-20 token balance of an address.
 * @param {string} tokenAddress - The ERC-20 contract address.
 * @param {string} ownerAddress - The wallet address to check balance for.
 * @returns {Promise<string>} - The balance in human-readable format.
 */
async function getErc20Balance(
  tokenAddress: Address,
  ownerAddress: Address,
  decimals = 18,
) {
  try {
    const balance = await client.readContract({
      address: tokenAddress,
      abi: parseAbi([
        'function balanceOf(address owner) view returns (uint256)',
      ]),
      functionName: 'balanceOf',
      args: [ownerAddress],
    })

    return `Balance: ${parseUnits(balance.toString(), -decimals).toString()}`
  } catch (error) {
    console.error('Error fetching balance:', error)
    return 'Error fetching balance'
  }
}

async function setErc20Balance(
  account: Address,
  balance: string,
  whale: Address,
) {
  await network.provider.request({
    method: 'anvil_impersonateAccount',
    params: [whale],
  })

  const usdcAbi = [
    {
      type: 'function',
      name: 'transfer',
      stateMutability: 'nonpayable',
      inputs: [
        { name: 'recipient', type: 'address' },
        { name: 'amount', type: 'uint256' },
      ],
      outputs: [{ name: '', type: 'bool' }],
    },
  ]

  const tx = await walletClient.writeContract({
    account: whale,
    address: usdcAddress,
    abi: usdcAbi,
    functionName: 'transfer',
    args: [account, parseUnits(balance, 6)],
  })

  console.log(`Transaction sent: ${tx}`)

  await network.provider.request({
    method: 'anvil_stopImpersonatingAccount',
    params: [whale],
  })
}

async function main() {
  const testAccount = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'
  const balance = '1000'
  await setErc20Balance(
    testAccount,
    balance,
    '0x8dB0f952B8B6A462445C732C41Ec2937bCae9c35',
  )
  const balanceAfter = await getTestAccountBalance(testAccount)
  console.log(balanceAfter.toString())
  const usdcBalanceAfter = await getErc20Balance(usdcAddress, testAccount, 6)
  console.log(usdcBalanceAfter.toString(), 'USDC')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
