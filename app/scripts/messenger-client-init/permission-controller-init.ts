import {
  CaveatSpecificationConstraint,
  PermissionController,
  PermissionSpecificationConstraint,
} from '@metamask/permission-controller';
import {
  getCaveatSpecifications,
  getPermissionSpecifications,
  unrestrictedMethods,
} from '../controllers/permissions';
import { getSnapPermissionSpecifications } from '../controllers/permissions/snaps/specifications';
import {
  PermissionControllerInitMessenger,
  PermissionControllerMessenger,
} from './messengers';
import { MessengerClientInitFunction } from './types';

/**
 * Initialize the permission controller.
 *
 * @param request - The request object.
 * @param request.controllerMessenger - The messenger to use for the controller.
 * @param request.persistedState - The persisted state of the extension.
 * @param request.initMessenger
 * @param request.getMessengerClient
 * @returns The initialized controller.
 */
export const PermissionControllerInit: MessengerClientInitFunction<
  PermissionController<
    PermissionSpecificationConstraint,
    CaveatSpecificationConstraint
  >,
  PermissionControllerMessenger,
  PermissionControllerInitMessenger
> = ({
  controllerMessenger,
  persistedState,
  initMessenger,
  getMessengerClient,
}) => {
  const approvalController = getMessengerClient('ApprovalController');
  const keyringController = getMessengerClient('KeyringController');

  const messengerClient = new PermissionController({
    state: persistedState.PermissionController,
    // @ts-expect-error: The permission controller needs certain actions that
    // are not declared in the messenger's type.
    messenger: controllerMessenger,
    caveatSpecifications: getCaveatSpecifications({
      listAccounts: initMessenger.call.bind(
        initMessenger,
        'AccountsController:listAccounts',
      ),
      findNetworkClientIdByChainId: initMessenger.call.bind(
        initMessenger,
        'NetworkController:findNetworkClientIdByChainId',
      ),
      isNonEvmScopeSupported: initMessenger.call.bind(
        initMessenger,
        'MultichainRoutingService:isSupportedScope',
      ),
      getNonEvmAccountAddresses: initMessenger.call.bind(
        initMessenger,
        'MultichainRoutingService:getSupportedAccounts',
      ),
    }),
    permissionSpecifications: {
      ...getPermissionSpecifications(),
      ...getSnapPermissionSpecifications(initMessenger, {
        addAndShowApprovalRequest:
          approvalController.addAndShowApprovalRequest.bind(approvalController),
        addNewKeyring: keyringController.addNewKeyring.bind(keyringController),
      }),
    },
    unrestrictedMethods,
  });

  return {
    messengerClient,
  };
};
