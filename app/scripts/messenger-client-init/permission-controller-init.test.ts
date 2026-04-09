import { PermissionController } from '@metamask/permission-controller';
import { getRootMessenger } from '../lib/messenger';
import { MessengerClientInitRequest } from './types';
import { buildControllerInitRequestMock } from './test/utils';
import {
  getPermissionControllerInitMessenger,
  getPermissionControllerMessenger,
  PermissionControllerInitMessenger,
  PermissionControllerMessenger,
} from './messengers';
import { PermissionControllerInit } from './permission-controller-init';

jest.mock('@metamask/permission-controller');

function getInitRequestMock(): jest.Mocked<
  MessengerClientInitRequest<
    PermissionControllerMessenger,
    PermissionControllerInitMessenger
  >
> {
  const baseMessenger = getRootMessenger<never, never>();

  const requestMock = {
    ...buildControllerInitRequestMock(),
    controllerMessenger: getPermissionControllerMessenger(baseMessenger),
    initMessenger: getPermissionControllerInitMessenger(baseMessenger),
  };

  requestMock.getMessengerClient.mockImplementation(
    // @ts-expect-error: Partial implementation.
    (controllerName: string) => {
      if (controllerName === 'ApprovalController') {
        return {
          addAndShowApprovalRequest: jest.fn(),
        };
      }

      if (controllerName === 'KeyringController') {
        return {
          addNewKeyring: jest.fn(),
        };
      }

      throw new Error(`Controller "${controllerName}" not found.`);
    },
  );

  return requestMock;
}

describe('PermissionControllerInit', () => {
  it('initializes the messengerClient', () => {
    const { messengerClient } = PermissionControllerInit(getInitRequestMock());
    expect(messengerClient).toBeInstanceOf(PermissionController);
  });

  it('passes the proper arguments to the messengerClient', () => {
    PermissionControllerInit(getInitRequestMock());

    const controllerMock = jest.mocked(PermissionController);
    expect(controllerMock).toHaveBeenCalledWith({
      messenger: expect.any(Object),
      state: undefined,
      caveatSpecifications: expect.any(Object),
      permissionSpecifications: expect.any(Object),
      unrestrictedMethods: expect.any(Array),
    });
  });
});
