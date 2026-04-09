import type { TextColor } from '@metamask/design-system-react';

export enum CameraAccessErrorContentVariant {
  Needed = 'needed',
  Blocked = 'blocked',
}

type CameraAccessErrorContentLayoutProps = {
  /** Hide the top camera icon (e.g. a parent already shows it). */
  hideLeadingIcon?: boolean;
  /** Hide built-in actions; parent supplies its own footer. */
  hideActionButtons?: boolean;
  /** Reduce outer padding when nested inside another padded container. */
  compactPadding?: boolean;
  titleTextColor?: TextColor;
  /** Main paragraph under the title (hint callouts keep default contrast). */
  bodyParagraphTextColor?: TextColor;
  /**
   * i18n message key for the primary button label. Defaults to `continue`.
   * Use e.g. `hardwareWalletErrorContinueButton` when embedded in the hardware wallet modal.
   */
  continueMessageKey?: string;
};

export type CameraAccessErrorContentNeededProps =
  CameraAccessErrorContentLayoutProps & {
    variant: CameraAccessErrorContentVariant.Needed;
    onContinue: () => void | Promise<void>;
    continueLoading?: boolean;
  };

export type CameraAccessErrorContentBlockedProps =
  CameraAccessErrorContentLayoutProps & {
    variant: CameraAccessErrorContentVariant.Blocked;
    isFirefox: boolean;
    onContinue: () => void | Promise<void>;
    continueLoading?: boolean;
    /** Used for Firefox step 2; ignored when `isFirefox` is false. */
    mozExtensionDisplay: string;
    /** Used for Chromium “Open settings”; ignored when `isFirefox` is true. */
    onOpenSettings: () => void;
  };

export type CameraAccessErrorContentProps =
  | CameraAccessErrorContentNeededProps
  | CameraAccessErrorContentBlockedProps;
