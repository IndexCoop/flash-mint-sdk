import axios from 'axios'

export async function getClientV2(path: string, apiKey: string) {
  const config = {
    headers: {
      '0x-api-key': apiKey,
      '0x-version': 'v2',
    },
  }
  const url = `https://api.0x.org/swap/allowance-holder/quote?${path}`
  const res = await axios.get(url, config)
  return res.data
}
