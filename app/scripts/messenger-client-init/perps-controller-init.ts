import {
  PerpsController,
  type RawLedgerUpdate,
  type UserHistoryItem,
} from '@metamask/perps-controller';
import { createPerpsInfrastructure } from '../controllers/perps/infrastructure';
import { MessengerClientInitFunction } from './types';
import { PerpsControllerMessenger } from './messengers/perps-controller-messenger';

/**
 * Parse fallback blocked regions from MM_PERPS_BLOCKED_REGIONS env var.
 * Format: comma-separated region codes (e.g., "US,CA-ON,GB,BE").
 */
function getFallbackBlockedRegions(): string[] {
  const raw = process.env.MM_PERPS_BLOCKED_REGIONS;
  if (!raw || typeof raw !== 'string') {
    return [];
  }
  return raw
    .split(',')
    .map((r) => r.trim())
    .filter(Boolean);
}

export const PerpsControllerInit: MessengerClientInitFunction<
  PerpsController,
  PerpsControllerMessenger
> = ({ controllerMessenger, persistedState }) => {
  const infrastructure = createPerpsInfrastructure();
  const fallbackBlockedRegions = getFallbackBlockedRegions();
  const completedOnboarding =
    persistedState.OnboardingController?.completedOnboarding ?? false;
  const useExternalServices =
    persistedState.PreferencesController?.useExternalServices ?? false;

  const messengerClient = new PerpsController({
    messenger: controllerMessenger,
    state: persistedState.PerpsController,
    infrastructure,
    clientConfig: {
      fallbackHip3Enabled: true,
      fallbackHip3AllowlistMarkets: [],
      fallbackBlockedRegions,
    },
    deferEligibilityCheck: !completedOnboarding || !useExternalServices,
  });

  const api = getApi(messengerClient);

  return { messengerClient, api };
};

/**
 * All background action names exposed by the Perps API.
 * TypeScript will error at the Record below if any name is missing from getApi().
 */
type PerpsActionName =
  | 'perpsInit'
  | 'perpsDisconnect'
  | 'perpsPlaceOrder'
  | 'perpsClosePosition'
  | 'perpsClosePositions'
  | 'perpsEditOrder'
  | 'perpsCancelOrder'
  | 'perpsCancelOrders'
  | 'perpsUpdatePositionTPSL'
  | 'perpsUpdateMargin'
  | 'perpsFlipPosition'
  | 'perpsWithdraw'
  | 'perpsValidateWithdrawal'
  | 'perpsGetWithdrawalRoutes'
  | 'perpsUpdateWithdrawalStatus'
  | 'perpsUpdateWithdrawalProgress'
  | 'perpsGetWithdrawalProgress'
  | 'perpsGetUserNonFundingLedgerUpdates'
  | 'perpsDepositWithConfirmation'
  | 'perpsGetPositions'
  | 'perpsGetMarkets'
  | 'perpsGetMarketDataWithPrices'
  | 'perpsGetOrderFills'
  | 'perpsGetOrders'
  | 'perpsGetOpenOrders'
  | 'perpsGetFunding'
  | 'perpsGetAccountState'
  | 'perpsGetHistoricalPortfolio'
  | 'perpsFetchHistoricalCandles'
  | 'perpsCalculateFees'
  | 'perpsGetAvailableDexs'
  | 'perpsRefreshEligibility'
  | 'perpsStartEligibilityMonitoring'
  | 'perpsStopEligibilityMonitoring'
  | 'perpsToggleTestnet'
  | 'perpsSaveTradeConfiguration'
  | 'perpsGetTradeConfiguration'
  | 'perpsSavePendingTradeConfiguration'
  | 'perpsGetPendingTradeConfiguration'
  | 'perpsClearPendingTradeConfiguration'
  | 'perpsSaveMarketFilterPreferences'
  | 'perpsGetMarketFilterPreferences'
  | 'perpsSetSelectedPaymentToken'
  | 'perpsResetSelectedPaymentToken'
  | 'perpsMarkTutorialCompleted'
  | 'perpsMarkFirstOrderCompleted'
  | 'perpsResetFirstTimeUserState'
  | 'perpsClearPendingTransactionRequests'
  | 'perpsSaveOrderBookGrouping'
  | 'perpsGetOrderBookGrouping'
  | 'perpsGetUserHistory'
  | 'perpsClearDepositResult'
  | 'perpsClearWithdrawResult'
  | 'perpsGetBlockExplorerUrl'
  | 'perpsGetCurrentNetwork'
  | 'perpsIsFirstTimeUserOnCurrentNetwork'
  | 'perpsGetWatchlistMarkets'
  | 'perpsToggleWatchlistMarket'
  | 'perpsIsWatchlistMarket';

// TODO: These methods have custom signatures that don't match their controller
// counterparts. Once the controller package is updated to return the deposit
// transaction ID directly and expose getUserHistory as a proper controller
// method, these can be removed and the mapped type will cover them automatically.
type PerpsCustomApiNames =
  | 'perpsDepositWithConfirmation'
  | 'perpsGetUserHistory'
  | 'perpsGetUserNonFundingLedgerUpdates';

type PerpsBackgroundApi = {
  [ActionName in Exclude<
    PerpsActionName,
    PerpsCustomApiNames
  >]: ActionName extends `perps${infer firstLetter}${infer remainingLetters}`
    ? `${Lowercase<firstLetter>}${remainingLetters}` extends keyof PerpsController
      ? PerpsController[`${Lowercase<firstLetter>}${remainingLetters}`]
      : never
    : never;
} & {
  perpsDepositWithConfirmation: (
    ...args: Parameters<PerpsController['depositWithConfirmation']>
  ) => Promise<string | null>;
  perpsGetUserHistory: (params: {
    startTime?: number;
    endTime?: number;
    accountId?: `${string}:${string}:${string}`;
  }) => Promise<UserHistoryItem[]>;
  perpsGetUserNonFundingLedgerUpdates: (params?: {
    startTime?: number;
    endTime?: number;
    accountId?: string;
  }) => Promise<RawLedgerUpdate[]>;
};

function getApi(messengerClient: PerpsController): PerpsBackgroundApi {
  return {
    // -- Lifecycle --
    perpsInit: messengerClient.init.bind(messengerClient),
    perpsDisconnect: messengerClient.disconnect.bind(messengerClient),

    // -- Trading mutations --
    perpsPlaceOrder: messengerClient.placeOrder.bind(messengerClient),
    perpsClosePosition: messengerClient.closePosition.bind(messengerClient),
    perpsClosePositions: messengerClient.closePositions.bind(messengerClient),
    perpsEditOrder: messengerClient.editOrder.bind(messengerClient),
    perpsCancelOrder: messengerClient.cancelOrder.bind(messengerClient),
    perpsCancelOrders: messengerClient.cancelOrders.bind(messengerClient),
    perpsUpdatePositionTPSL:
      messengerClient.updatePositionTPSL.bind(messengerClient),
    perpsUpdateMargin: messengerClient.updateMargin.bind(messengerClient),
    perpsFlipPosition: messengerClient.flipPosition.bind(messengerClient),
    perpsWithdraw: messengerClient.withdraw.bind(messengerClient),
    perpsValidateWithdrawal:
      messengerClient.validateWithdrawal.bind(messengerClient),
    perpsGetWithdrawalRoutes:
      messengerClient.getWithdrawalRoutes.bind(messengerClient),
    perpsUpdateWithdrawalStatus:
      messengerClient.updateWithdrawalStatus.bind(messengerClient),
    perpsUpdateWithdrawalProgress:
      messengerClient.updateWithdrawalProgress.bind(messengerClient),
    perpsGetWithdrawalProgress:
      messengerClient.getWithdrawalProgress.bind(messengerClient),
    perpsDepositWithConfirmation: async (
      ...args: Parameters<typeof messengerClient.depositWithConfirmation>
    ) => {
      await messengerClient.depositWithConfirmation(...args);
      // TODO: depositWithConfirmation should return the transaction ID
      // directly — that requires a controller package change.
      return messengerClient.state.lastDepositTransactionId;
    },

    // -- Data fetches --
    perpsGetPositions: messengerClient.getPositions.bind(messengerClient),
    perpsGetMarkets: messengerClient.getMarkets.bind(messengerClient),
    perpsGetMarketDataWithPrices:
      messengerClient.getMarketDataWithPrices.bind(messengerClient),
    perpsGetOrderFills: messengerClient.getOrderFills.bind(messengerClient),
    perpsGetOrders: messengerClient.getOrders.bind(messengerClient),
    perpsGetOpenOrders: messengerClient.getOpenOrders.bind(messengerClient),
    perpsGetFunding: messengerClient.getFunding.bind(messengerClient),
    perpsGetAccountState: messengerClient.getAccountState.bind(messengerClient),
    perpsGetHistoricalPortfolio:
      messengerClient.getHistoricalPortfolio.bind(messengerClient),
    perpsFetchHistoricalCandles:
      messengerClient.fetchHistoricalCandles.bind(messengerClient),
    perpsCalculateFees: messengerClient.calculateFees.bind(messengerClient),
    perpsGetAvailableDexs:
      messengerClient.getAvailableDexs.bind(messengerClient),

    // -- Eligibility --
    perpsRefreshEligibility:
      messengerClient.refreshEligibility.bind(messengerClient),
    perpsStartEligibilityMonitoring:
      messengerClient.startEligibilityMonitoring.bind(messengerClient),
    perpsStopEligibilityMonitoring:
      messengerClient.stopEligibilityMonitoring.bind(messengerClient),

    // -- Toggle --
    perpsToggleTestnet: messengerClient.toggleTestnet.bind(messengerClient),

    // -- Preferences --
    perpsSaveTradeConfiguration:
      messengerClient.saveTradeConfiguration.bind(messengerClient),
    perpsGetTradeConfiguration:
      messengerClient.getTradeConfiguration.bind(messengerClient),
    perpsSavePendingTradeConfiguration:
      messengerClient.savePendingTradeConfiguration.bind(messengerClient),
    perpsGetPendingTradeConfiguration:
      messengerClient.getPendingTradeConfiguration.bind(messengerClient),
    perpsClearPendingTradeConfiguration:
      messengerClient.clearPendingTradeConfiguration.bind(messengerClient),
    perpsSaveMarketFilterPreferences:
      messengerClient.saveMarketFilterPreferences.bind(messengerClient),
    perpsGetMarketFilterPreferences:
      messengerClient.getMarketFilterPreferences.bind(messengerClient),
    perpsSetSelectedPaymentToken:
      messengerClient.setSelectedPaymentToken.bind(messengerClient),
    perpsResetSelectedPaymentToken:
      messengerClient.resetSelectedPaymentToken.bind(messengerClient),
    perpsMarkTutorialCompleted:
      messengerClient.markTutorialCompleted.bind(messengerClient),
    perpsMarkFirstOrderCompleted:
      messengerClient.markFirstOrderCompleted.bind(messengerClient),
    perpsResetFirstTimeUserState:
      messengerClient.resetFirstTimeUserState.bind(messengerClient),
    perpsClearPendingTransactionRequests:
      messengerClient.clearPendingTransactionRequests.bind(messengerClient),
    perpsSaveOrderBookGrouping:
      messengerClient.saveOrderBookGrouping.bind(messengerClient),
    perpsGetOrderBookGrouping:
      messengerClient.getOrderBookGrouping.bind(messengerClient),

    // -- Provider passthrough --
    perpsGetUserHistory: async (params: {
      startTime?: number;
      endTime?: number;
      accountId?: `${string}:${string}:${string}`;
    }) => {
      return messengerClient.getActiveProvider().getUserHistory(params);
    },
    perpsGetUserNonFundingLedgerUpdates: async (params?: {
      startTime?: number;
      endTime?: number;
      accountId?: string;
    }) => {
      return messengerClient
        .getActiveProvider()
        .getUserNonFundingLedgerUpdates(params);
    },

    // -- Misc --
    perpsClearDepositResult:
      messengerClient.clearDepositResult.bind(messengerClient),
    perpsClearWithdrawResult:
      messengerClient.clearWithdrawResult.bind(messengerClient),
    perpsGetBlockExplorerUrl:
      messengerClient.getBlockExplorerUrl.bind(messengerClient),
    perpsGetCurrentNetwork:
      messengerClient.getCurrentNetwork.bind(messengerClient),
    perpsIsFirstTimeUserOnCurrentNetwork:
      messengerClient.isFirstTimeUserOnCurrentNetwork.bind(messengerClient),
    perpsGetWatchlistMarkets:
      messengerClient.getWatchlistMarkets.bind(messengerClient),
    perpsToggleWatchlistMarket:
      messengerClient.toggleWatchlistMarket.bind(messengerClient),
    perpsIsWatchlistMarket:
      messengerClient.isWatchlistMarket.bind(messengerClient),
  };
}
