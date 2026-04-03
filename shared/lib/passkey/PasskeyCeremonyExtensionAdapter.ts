import type {
  CreationParams,
  AssertionParams,
  CredentialCreationResult,
  AssertionResult,
} from '@metamask/passkey-controller';

type PrfExtensionResults = {
  prf?: {
    enabled?: boolean;
    results?: { first?: ArrayBuffer };
  };
};

export class PasskeyCeremonyExtensionAdapter {
  async createCredential(
    params: CreationParams,
  ): Promise<CredentialCreationResult> {
    const options: CredentialCreationOptions = {
      publicKey: {
        rp: { name: 'MetaMask' },
        user: {
          id: params.userHandle,
          name: 'MetaMask User',
          displayName: 'MetaMask',
        },
        challenge: crypto.getRandomValues(new Uint8Array(32)),
        pubKeyCredParams: [
          { alg: -7, type: 'public-key' },
          { alg: -257, type: 'public-key' },
        ],
        authenticatorSelection: {
          residentKey: 'preferred',
          userVerification: 'required',
          authenticatorAttachment: 'platform',
        },
        extensions: {
          prf: { eval: { first: params.prfSalt } },
        } as AuthenticationExtensionsClientInputs,
      },
    };

    const credential = await navigator.credentials.create(options);
    if (!credential || !(credential instanceof PublicKeyCredential)) {
      throw new Error('Passkey creation cancelled');
    }

    const extResults =
      credential.getClientExtensionResults() as PrfExtensionResults;

    return {
      credentialId: new Uint8Array(credential.rawId),
      userHandle: params.userHandle,
      prfEnabled: extResults.prf?.enabled === true,
      prfFirst: extResults.prf?.results?.first,
    };
  }

  async getAssertion(params: AssertionParams): Promise<AssertionResult> {
    const extensions: AuthenticationExtensionsClientInputs =
      params.usePrf && params.prfSalt
        ? ({
            prf: { eval: { first: params.prfSalt } },
          } as AuthenticationExtensionsClientInputs)
        : {};

    const options: CredentialRequestOptions = {
      publicKey: {
        challenge: crypto.getRandomValues(new Uint8Array(32)),
        allowCredentials: [{ id: params.credentialId, type: 'public-key' }],
        userVerification: 'required',
        extensions,
      },
    };

    const credential = await navigator.credentials.get(options);
    if (!credential || !(credential instanceof PublicKeyCredential)) {
      throw new Error('Passkey authentication cancelled');
    }

    const response = credential.response as AuthenticatorAssertionResponse;
    const extResults =
      credential.getClientExtensionResults() as PrfExtensionResults;

    return {
      userHandle: response.userHandle ?? undefined,
      prfFirst: extResults.prf?.results?.first,
    };
  }
}
