import React from 'react';
import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { TextColor } from '@metamask/design-system-react';
import { renderWithLocalization } from '../../../../test/lib/render-helpers';
import { enLocale as messages, tEn } from '../../../../test/lib/i18n-helpers';
import {
  CameraAccessErrorContent,
  CameraAccessErrorContentVariant,
} from './camera-access-error-content';

describe('CameraAccessErrorContent', () => {
  describe('needed variant', () => {
    it('renders localized title, body, and continue control', async () => {
      const user = userEvent.setup();
      const onContinue = jest.fn();
      renderWithLocalization(
        <CameraAccessErrorContent
          variant={CameraAccessErrorContentVariant.Needed}
          onContinue={onContinue}
        />,
      );

      expect(screen.getByTestId('qr-camera-access-needed')).toBeInTheDocument();
      expect(
        screen.getByText(messages.qrCameraAccessNeededTitle.message),
      ).toBeInTheDocument();
      expect(
        screen.getByText(messages.qrCameraAccessNeededBody.message),
      ).toBeInTheDocument();
      expect(screen.getByText(messages.continue.message)).toBeInTheDocument();
      await user.click(screen.getByTestId('qr-camera-access-needed-continue'));
      expect(onContinue).toHaveBeenCalledTimes(1);
    });

    it('uses continueMessageKey for the primary label when provided', () => {
      renderWithLocalization(
        <CameraAccessErrorContent
          variant={CameraAccessErrorContentVariant.Needed}
          onContinue={jest.fn()}
          continueMessageKey="hardwareWalletErrorContinueButton"
        />,
      );

      expect(
        screen.getByText(messages.hardwareWalletErrorContinueButton.message),
      ).toBeInTheDocument();
    });
  });

  describe('blocked variant', () => {
    it('shows chromium hint and open settings when not Firefox', () => {
      const onContinue = jest.fn();
      const onOpenSettings = jest.fn();
      renderWithLocalization(
        <CameraAccessErrorContent
          variant={CameraAccessErrorContentVariant.Blocked}
          isFirefox={false}
          mozExtensionDisplay=""
          onOpenSettings={onOpenSettings}
          onContinue={onContinue}
        />,
      );

      expect(
        screen.getByTestId('qr-camera-access-blocked'),
      ).toBeInTheDocument();
      expect(screen.getByTestId('qr-camera-chromium-hint')).toHaveTextContent(
        messages.qrCameraAccessBlockedChromiumHint.message,
      );
      expect(screen.getByTestId('qr-camera-open-settings')).toBeInTheDocument();
      expect(
        screen.queryByTestId('qr-camera-firefox-instructions'),
      ).not.toBeInTheDocument();
    });

    it('shows firefox instructions when Firefox', () => {
      const mozOrigin = 'moz-extension://abc';
      renderWithLocalization(
        <CameraAccessErrorContent
          variant={CameraAccessErrorContentVariant.Blocked}
          isFirefox
          mozExtensionDisplay={mozOrigin}
          onOpenSettings={jest.fn()}
          onContinue={jest.fn()}
        />,
      );

      expect(
        screen.getByTestId('qr-camera-firefox-instructions'),
      ).toBeInTheDocument();
      expect(
        screen.getByText(`1. ${tEn('qrCameraAccessBlockedFirefoxStep1', [])}`),
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          `2. ${tEn('qrCameraAccessBlockedFirefoxStep2', [mozOrigin])}`,
        ),
      ).toBeInTheDocument();
      expect(
        screen.getByText(`3. ${tEn('qrCameraAccessBlockedFirefoxStep3', [])}`),
      ).toBeInTheDocument();
      expect(
        screen.queryByTestId('qr-camera-open-settings'),
      ).not.toBeInTheDocument();
    });

    it('omits icon and action buttons when embedded in a parent shell', () => {
      renderWithLocalization(
        <CameraAccessErrorContent
          variant={CameraAccessErrorContentVariant.Blocked}
          isFirefox={false}
          mozExtensionDisplay=""
          onOpenSettings={jest.fn()}
          onContinue={jest.fn()}
          hideLeadingIcon
          hideActionButtons
          compactPadding
          bodyParagraphTextColor={TextColor.TextAlternative}
        />,
      );

      expect(screen.getByTestId('qr-camera-chromium-hint')).toBeInTheDocument();
      expect(
        screen.queryByTestId('qr-camera-open-settings'),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByTestId('qr-camera-blocked-continue'),
      ).not.toBeInTheDocument();
    });
  });
});
