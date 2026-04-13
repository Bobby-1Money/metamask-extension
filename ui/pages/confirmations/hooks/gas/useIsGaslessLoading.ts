import { useSelector } from 'react-redux';
import { TransactionMeta } from '@metamask/transaction-controller';
import { useMemo } from 'react';
import { useConfirmContext } from '../../context/confirm';
import { getUseTransactionSimulations } from '../../../../selectors';
import { useHasInsufficientBalance } from '../useHasInsufficientBalance';
import { NATIVE_TOKEN_ADDRESS } from '../../../../../shared/constants/transaction';
import { useIsGaslessSupported } from './useIsGaslessSupported';

export function useIsGaslessLoading() {
  const { currentConfirmation: transactionMeta } =
    useConfirmContext<TransactionMeta>();

  const { gasFeeTokens, excludeNativeTokenForFee, selectedGasFeeToken } =
    transactionMeta ?? {};

  const {
    isSupported: isGaslessSupported,
    pending: isGaslessSupportedPending,
  } = useIsGaslessSupported();
  const isSimulationEnabled = useSelector(getUseTransactionSimulations);

  const { hasInsufficientBalance } = useHasInsufficientBalance();

  const isGaslessLoading = useMemo(() => {
    if (isGaslessSupportedPending) {
      return true;
    }
    if (!isGaslessSupported) {
      return false;
    }
    if (!isSimulationEnabled || !hasInsufficientBalance) {
      return false;
    }
    /*
     * Sometimes useAutomaticGasFeeTokenSelect needs to have time to run
     * for the correct available fee token to be assigned.
     * This is the case on Tempo when we 'suggest' a default fee token
     * but this is not one of the available token.
     * Not doing this would fallback on using the native token, which makes it
     * less painful on other chains, but means tx failure on Tempo.
     * By using `excludeNativeTokenForFee` as guard, we limit regression risks on
     * other networks/flows while solving this issue for Tempo.
     * Without this, clicking too fast on "confirm" while the tx is building would
     * be possible and would cause a tx failure.
     */
    if (excludeNativeTokenForFee) {
      const hasSelectedGasFeeTokenInconsistentWithAvailableGasFeeTokens =
        selectedGasFeeToken &&
        selectedGasFeeToken !== NATIVE_TOKEN_ADDRESS &&
        gasFeeTokens &&
        !gasFeeTokens.find(
          ({ tokenAddress }) =>
            tokenAddress.toLocaleLowerCase() ===
            selectedGasFeeToken?.toLocaleLowerCase(),
        );
      return (
        !gasFeeTokens ||
        Boolean(hasSelectedGasFeeTokenInconsistentWithAvailableGasFeeTokens)
      );
    }
    return !gasFeeTokens;
  }, [
    isGaslessSupportedPending,
    isGaslessSupported,
    isSimulationEnabled,
    hasInsufficientBalance,
    gasFeeTokens,
    selectedGasFeeToken,
    excludeNativeTokenForFee,
  ]);
  return { isGaslessLoading };
}
