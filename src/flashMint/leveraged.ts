import { TransactionResponse } from '@ethersproject/abstract-provider'
import { BigNumber } from '@ethersproject/bignumber'
import { Contract } from '@ethersproject/contracts'

import { TransactionOverrides } from '../utils/overrides'
import { SwapData } from '../utils/swapData'

export interface LeveragedTokenData {
  collateralAToken: string
  collateralToken: string
  debtToken: string
  collateralAmount: BigNumber
  debtAmount: BigNumber
}

export class FlashMintLeveraged {
  contract: Contract

  /**
   * @param contract    An instance of an FlashMintLeveraged contract
   */
  constructor(contract: Contract) {
    this.contract = contract
  }

  /**
   * Returns the collateral / debt token addresses and amounts for a leveraged index.
   *
   * @param _setToken     Address of the Set token to be minted / redeemed
   * @param _setAmount    Amount of tokens to mint / redeem
   * @param _isIssuance   Boolean indicating if the Set token is to be issued/minted or redeemed
   *
   * @return Struct containing the collateral / debt token addresses and amounts.
   */
  getLeveragedTokenData = async (
    _setToken: string,
    _setAmount: BigNumber,
    _isIssuance: boolean
  ): Promise<LeveragedTokenData | null> => {
    try {
      return await this.contract.getLeveragedTokenData(
        _setToken,
        _setAmount,
        _isIssuance
      )
    } catch (error) {
      // TODO: should this just always fail cause it means there is something wrongly configured?
      console.error('Error getting leveraged token data', error)
      return null
    }
  }

  /**
   * Trigger minting of Set token paying with any arbitrary ERC20 token.
   *
   * @param _setToken                     Set token to mint
   * @param _setAmount                    Amount to mint
   * @param _inputToken                   Input token to pay with
   * @param _maxAmountInputToken          Maximum amount of input token to spend
   * @param _swapDataDebtForCollateral    SwapData (token addresses and fee levels) to describe the swap path from debt to collateral token
   * @param _swapDataInputToken           SwapData (token addresses and fee levels) to describe the swap path from input to collateral token
   * @param overrides                     Overrides for the transaction
   *
   * @return A TransactionResponse on success, null on error.
   */
  mintExactSetFromERC20 = async (
    _setToken: string,
    _setAmount: BigNumber,
    _inputToken: string,
    _maxAmountInputToken: BigNumber,
    _swapDataDebtForCollateral: SwapData,
    _swapDataInputToken: SwapData,
    overrides: TransactionOverrides
  ): Promise<TransactionResponse | null> => {
    try {
      const issueSetTx = await this.contract.issueExactSetFromERC20(
        _setToken,
        _setAmount,
        _inputToken,
        _maxAmountInputToken,
        _swapDataDebtForCollateral,
        _swapDataInputToken,
        overrides
      )
      return issueSetTx
    } catch (error) {
      console.error('Error issuing exact set from ERC20', error)
      return null
    }
  }

  /**
   * Trigger minting of set token paying with ETH.
   *
   * @param _setToken                     Set token to mint
   * @param _setAmount                    Amount to mint
   * @param _swapDataDebtForCollateral    SwapData (token addresses and fee levels) to describe the swap path from debt to collateral token
   * @param _swapDataInputToken           SwapData (token addresses and fee levels) to describe the swap path from eth to collateral token
   * @param maxInput                      Maximum amount of eth to spend
   * @param overrides                     Overrides for the transaction
   *
   * @return A TransactionResponse on success, null on error.
   */
  mintExactSetFromETH = async (
    _setToken: string,
    _setAmount: BigNumber,
    _swapDataDebtForCollateral: SwapData,
    _swapDataInputToken: SwapData,
    maxInput: BigNumber,
    overrides: TransactionOverrides
  ): Promise<TransactionResponse | null> => {
    try {
      const txOverrides = overrides
      txOverrides.value = maxInput
      const issueSetTx = await this.contract.issueExactSetFromETH(
        _setToken,
        _setAmount,
        _swapDataDebtForCollateral,
        _swapDataInputToken,
        txOverrides
      )
      return issueSetTx
    } catch (error) {
      console.error('Error issuing exact set from ETH', error)
      return null
    }
  }

  /**
   * Trigger redemption of set token to pay the user with an arbitrary ERC20.
   *
   * @param _setToken                   Set token to redeem
   * @param _setAmount                  Amount to redeem
   * @param _outputToken                Address of the ERC20 token to send to the user
   * @param _minAmountOutputToken       Minimum amount of output token to send to the user
   * @param _swapDataCollateralForDebt  SwapData (token path and fee levels) describing the swap from collateral token to debt token
   * @param _swapDataOutputToken        SwapData (token path and fee levels) describing the swap from collateral token to output token
   * @param overrides                   Overrides for the transaction
   *
   * @return A TransactionResponse on success, null on error.
   */
  redeemExactSetForERC20 = async (
    _setToken: string,
    _setAmount: BigNumber,
    _outputToken: string,
    _minAmountOutputToken: BigNumber,
    _swapDataCollateralForDebt: SwapData,
    _swapDataOutputToken: SwapData,
    overrides: TransactionOverrides
  ): Promise<TransactionResponse | null> => {
    try {
      const redeemSetTx = await this.contract.redeemExactSetForERC20(
        _setToken,
        _setAmount,
        _outputToken,
        _minAmountOutputToken,
        _swapDataCollateralForDebt,
        _swapDataOutputToken,
        overrides
      )
      return redeemSetTx
    } catch (error) {
      console.error('Error redeeming exact set for ERC20', error)
      return null
    }
  }

  /**
   * Trigger redemption of set token to pay the user with Eth.
   *
   * @param _setToken                   Set token to redeem
   * @param _setAmount                  Amount to redeem
   * @param _minAmountOutputToken       Minimum amount of ETH to send to the user
   * @param _swapDataCollateralForDebt  SwapData (token path and fee levels) describing the swap from collateral token to debt token
   * @param _swapDataOutputToken        SwapData (token path and fee levels) describing the swap from collateral token to output token
   * @param overrides                   Overrides for the transaction
   *
   * @return A TransactionResponse on success, null on error.
   */
  async redeemExactSetForETH(
    _setToken: string,
    _setAmount: BigNumber,
    _minAmountOutputToken: BigNumber,
    _swapDataCollateralForDebt: SwapData,
    _swapDataOutputToken: SwapData,
    overrides: TransactionOverrides
  ): Promise<TransactionResponse | null> {
    try {
      const redeemSetTx = await this.contract.redeemExactSetForETH(
        _setToken,
        _setAmount,
        _minAmountOutputToken,
        _swapDataCollateralForDebt,
        _swapDataOutputToken,
        overrides
      )
      return redeemSetTx
    } catch (error) {
      console.error('Error redeeming exact set for ETH', error)
      return null
    }
  }
}
