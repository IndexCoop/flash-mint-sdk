import { TransactionResponse } from '@ethersproject/abstract-provider'
import { BigNumber } from '@ethersproject/bignumber'
import { Contract } from '@ethersproject/contracts'

import { TransactionOverrides } from '../utils/overrides'

interface RequiredComponentsResponse {
  components: string[]
  positions: BigNumber[]
}

export class FlashMintZeroEx {
  contract: Contract

  /**
   * @param contract    An instance of an FlashMintZeroEx contract
   */
  constructor(contract: Contract) {
    this.contract = contract
  }

  /**
   * Returns transaction to get component & position quotes for token minting.
   *
   * @param _issuanceModule     Address of issuance module to use
   * @param _isDebtIssuance     Flag indicating wether given issuance module is a debt issuance module
   * @param _setToken           Address of the Set token to be minted
   * @param _amountSetToken     Amount of Set tokens to mint
   *
   * @return A RequiredComponentsResponse including component and position quotes (empty on error)
   */
  getRequiredIssuanceComponents = async (
    _issuanceModule: string,
    _isDebtIssuance: boolean,
    _setToken: string,
    _amountSetToken: BigNumber
  ): Promise<RequiredComponentsResponse> => {
    try {
      const issueCompTx = await this.contract.getRequiredIssuanceComponents(
        _issuanceModule,
        _isDebtIssuance,
        _setToken,
        _amountSetToken
      )
      return issueCompTx
    } catch (err) {
      console.error('Error getting required issuance components', err)
      return { components: [], positions: [] }
    }
  }

  /**
   * Returns transaction to get component & position quotes for token redemption.
   *
   * @param _issuanceModule     Address of issuance Module to use
   * @param _isDebtIssuance     Flag indicating wether given issuance module is a debt issuance module
   * @param _setToken           Address of the Set token to be redeemed
   * @param _amountSetToken     Amount of Set tokens to redeem
   *
   * @return A RequiredComponentsResponse including component and position quotes (empty on error)
   */
  getRequiredRedemptionComponents = async (
    _issuanceModule: string,
    _isDebtIssuance: boolean,
    _setToken: string,
    _amountSetToken: BigNumber
  ): Promise<RequiredComponentsResponse> => {
    try {
      const redeemCompTx = await this.contract.getRequiredRedemptionComponents(
        _issuanceModule,
        _isDebtIssuance,
        _setToken,
        _amountSetToken
      )
      return redeemCompTx
    } catch (err) {
      console.error('Error getting required redemption components', err)
      return { components: [], positions: [] }
    }
  }

  /**
   * Mints an exact amount of Set tokens for given amount of ETH.
   * The excess amount of tokens is returned in an equivalent amount of ether.
   *
   * @param _setToken           Address of the Set token to be minted
   * @param _amountSetToken     Amount of Set tokens to mint
   * @param _componentQuotes    The encoded 0x transactions to execute
   * @param _issuanceModule     Address of issuance Module to use
   * @param _isDebtIssuance     Flag indicating wether given issuance module is a debt issuance module
   * @param maxInput            Max eth to use as input (will be set as value for the tx)
   * @param overrides           Overrides for the transaction
   *
   * @return A TransactionResponse on success, null on error.
   */
  mintExactSetFromETH = async (
    _setToken: string,
    _amountSetToken: BigNumber,
    _componentQuotes: string[],
    _issuanceModule: string,
    _isDebtIssuance: boolean,
    maxInput: BigNumber,
    overrides: TransactionOverrides
  ): Promise<TransactionResponse | null> => {
    try {
      const txOverrides = overrides
      txOverrides.value = maxInput
      const issueSetTx = await this.contract.issueExactSetFromETH(
        _setToken,
        _amountSetToken,
        _componentQuotes,
        _issuanceModule,
        _isDebtIssuance,
        txOverrides
      )
      return issueSetTx
    } catch (err) {
      console.error('Error issuing exact set from eth', err)
      return null
    }
  }

  /**
   * Mints an exact amount of Set tokens for given amount of input ERC20 tokens.
   * The excess amount of tokens is returned in an equivalent amount of ether.
   *
   * @param _setToken               Address of the Set token to be FlashMintLeveragedQuote
   * @param _inputToken             Address of the input token
   * @param _amountSetToken         Amount of Set tokens to mint
   * @param _maxAmountInputToken    Maximum amount of input tokens to be used to mint Set tokens
   * @param _componentQuotes        The encoded 0x transactions to execute
   * @param _issuanceModule         Address of issuance Module to use
   * @param _isDebtIssuance         Flag indicating wether given issuance module is a debt issuance module
   * @param overrides           Overrides for the transaction
   *
   * @return A TransactionResponse on success, null on error.
   */
  mintExactSetFromToken = async (
    _setToken: string,
    _inputToken: string,
    _amountSetToken: BigNumber,
    _maxAmountInputToken: BigNumber,
    _componentQuotes: string[],
    _issuanceModule: string,
    _isDebtIssuance: boolean,
    overrides: TransactionOverrides
  ): Promise<TransactionResponse | null> => {
    try {
      const issueSetTx = await this.contract.issueExactSetFromToken(
        _setToken,
        _inputToken,
        _amountSetToken,
        _maxAmountInputToken,
        _componentQuotes,
        _issuanceModule,
        _isDebtIssuance,
        overrides
      )
      return issueSetTx
    } catch (err) {
      console.error('Error issuing exact set from token', err)
      return null
    }
  }

  /**
   * Redeems an exact amount of Set tokens for ETH.
   * The Set token must be approved by the sender to this contract.
   *
   * @param _setToken              Address of the Set token be redeemed
   * @param _amountSetToken        Amount of Set token to redeem
   * @param _minEthReceive         Minimum amount of Eth to receive
   * @param _componentQuotes       The encoded 0x transactions to execute
   * @param _issuanceModule        Address of issuance module to use
   * @param _isDebtIssuance        Flag indicating wether given issuance module is a debt issuance module
   * @param overrides           Overrides for the transaction
   *
   * @return A TransactionResponse on success, null on error.
   */
  redeemExactSetForETH = async (
    _setToken: string,
    _amountSetToken: BigNumber,
    _minEthReceive: BigNumber,
    _componentQuotes: string[],
    _issuanceModule: string,
    _isDebtIssuance: boolean,
    overrides: TransactionOverrides
  ): Promise<TransactionResponse | null> => {
    try {
      const redeemSetTx = await this.contract.redeemExactSetForETH(
        _setToken,
        _amountSetToken,
        _minEthReceive,
        _componentQuotes,
        _issuanceModule,
        _isDebtIssuance,
        overrides
      )
      return redeemSetTx
    } catch (err) {
      console.error('Error redeeming exact set for eth', err)
      return null
    }
  }

  /**
   * Redeems an exact amount of Set tokens for ERC20 tokens.
   * The excess amount of tokens is returned in an equivalent amount of ether.
   *
   * @param _setToken             Address of the Set token to be redeemed
   * @param _outputToken          Address of the output token
   * @param _amountSetToken       Amount of output token to redeem
   * @param _minOutputReceive     Minimum amount of output token to receive
   * @param _componentQuotes      The encoded 0x transactions to execute
   * @param _issuanceModule       Address of issuance module to use
   * @param _isDebtIssuance       Flag indicating wether given issuance module is a debt issuance module
   * @param overrides           Overrides for the transaction
   *
   * @return A TransactionResponse on success, null on error.
   */
  redeemExactSetForToken = async (
    _setToken: string,
    _outputToken: string,
    _amountSetToken: BigNumber,
    _minOutputReceive: BigNumber,
    _componentQuotes: string[],
    _issuanceModule: string,
    _isDebtIssuance: boolean,
    overrides: TransactionOverrides
  ): Promise<TransactionResponse | null> => {
    try {
      const redeemSetTx = await this.contract.redeemExactSetForToken(
        _setToken,
        _outputToken,
        _amountSetToken,
        _minOutputReceive,
        _componentQuotes,
        _issuanceModule,
        _isDebtIssuance,
        overrides
      )
      return redeemSetTx
    } catch (err) {
      console.error('Error redeeming exact set for token', err)
      return null
    }
  }
}
