import React from 'react';
import {
  Box,
  BoxAlignItems,
  BoxBackgroundColor,
  BoxFlexDirection,
  Button,
  ButtonSize,
  ButtonVariant,
  FontWeight,
  Icon,
  IconColor,
  IconName,
  IconSize,
  Text,
  TextAlign,
  TextColor,
  TextVariant,
} from '@metamask/design-system-react';
import { useI18nContext } from '../../../hooks/useI18nContext';
import {
  CameraAccessErrorContentVariant,
  type CameraAccessErrorContentProps,
} from './camera-access-error-content.types';

export const CameraAccessErrorContent = (
  props: CameraAccessErrorContentProps,
) => {
  const t = useI18nContext();
  const {
    variant,
    onContinue,
    continueLoading = false,
    hideLeadingIcon = false,
    hideActionButtons = false,
    compactPadding = false,
    titleTextColor = TextColor.TextDefault,
    bodyParagraphTextColor = TextColor.TextDefault,
    continueMessageKey,
  } = props;

  const isBlocked = variant === CameraAccessErrorContentVariant.Blocked;
  const isFirefox = isBlocked && props.isFirefox;
  const showChromiumActions = isBlocked && !props.isFirefox;

  const rootTestId =
    variant === CameraAccessErrorContentVariant.Needed
      ? 'qr-camera-access-needed'
      : 'qr-camera-access-blocked';

  const title =
    variant === CameraAccessErrorContentVariant.Needed
      ? t('qrCameraAccessNeededTitle')
      : t('qrCameraAccessBlockedTitle');

  let body: string;
  if (variant === CameraAccessErrorContentVariant.Needed) {
    body = t('qrCameraAccessNeededBody');
  } else {
    body = t('qrCameraAccessBlockedBody');
  }

  const continueLabel = continueMessageKey
    ? t(continueMessageKey)
    : t('continue');

  const firefoxSteps =
    variant === CameraAccessErrorContentVariant.Blocked && isFirefox
      ? [
          t('qrCameraAccessBlockedFirefoxStep1'),
          t('qrCameraAccessBlockedFirefoxStep2', [props.mozExtensionDisplay]),
          t('qrCameraAccessBlockedFirefoxStep3'),
        ]
      : [];

  const chromiumHintText = showChromiumActions
    ? t('qrCameraAccessBlockedChromiumHint')
    : '';

  const openSettingsLabel = showChromiumActions ? t('openSettings') : '';

  const handleOpenSettings = showChromiumActions
    ? props.onOpenSettings
    : undefined;

  const horizontalPadding = compactPadding ? 0 : 5;
  const bottomPadding = compactPadding ? 0 : 5;

  return (
    <Box
      data-testid={rootTestId}
      flexDirection={BoxFlexDirection.Column}
      paddingHorizontal={horizontalPadding}
      paddingBottom={bottomPadding}
      style={{ width: '100%' }}
    >
      {hideLeadingIcon ? null : (
        <Box
          flexDirection={BoxFlexDirection.Column}
          alignItems={BoxAlignItems.Center}
          paddingBottom={2}
        >
          <Icon
            name={IconName.Camera}
            color={IconColor.IconDefault}
            size={IconSize.Xl}
          />
        </Box>
      )}
      <Box paddingTop={hideLeadingIcon ? 0 : 2} paddingBottom={2}>
        <Text
          variant={TextVariant.HeadingMd}
          fontWeight={FontWeight.Medium}
          textAlign={TextAlign.Center}
          color={titleTextColor}
        >
          {title}
        </Text>
      </Box>
      <Box padding={3}>
        <Text
          variant={TextVariant.BodyMd}
          textAlign={TextAlign.Center}
          color={bodyParagraphTextColor}
        >
          {body}
        </Text>
      </Box>
      {isBlocked && isFirefox ? (
        <Box
          data-testid="qr-camera-firefox-instructions"
          flexDirection={BoxFlexDirection.Column}
          gap={2}
          marginTop={2}
          padding={3}
          backgroundColor={BoxBackgroundColor.BackgroundAlternative}
          style={{ borderRadius: 8 }}
        >
          {firefoxSteps.map((step, index) => (
            <Text
              key={`firefox-camera-step-${index}`}
              variant={TextVariant.BodyMd}
              textAlign={TextAlign.Left}
              color={TextColor.TextDefault}
            >
              {`${index + 1}. ${step}`}
            </Text>
          ))}
        </Box>
      ) : null}
      {showChromiumActions ? (
        <Box
          data-testid="qr-camera-chromium-hint"
          flexDirection={BoxFlexDirection.Column}
          marginTop={2}
          padding={3}
          backgroundColor={BoxBackgroundColor.BackgroundAlternative}
          style={{ borderRadius: 8 }}
        >
          <Text
            variant={TextVariant.BodyMd}
            textAlign={TextAlign.Left}
            color={TextColor.TextDefault}
          >
            {chromiumHintText}
          </Text>
        </Box>
      ) : null}
      {hideActionButtons ? null : (
        <Box flexDirection={BoxFlexDirection.Column} gap={3} marginTop={4}>
          {showChromiumActions && handleOpenSettings ? (
            <Button
              size={ButtonSize.Lg}
              variant={ButtonVariant.Secondary}
              onClick={handleOpenSettings}
              data-testid="qr-camera-open-settings"
              isFullWidth
            >
              {openSettingsLabel}
            </Button>
          ) : null}
          <Button
            size={ButtonSize.Lg}
            variant={ButtonVariant.Primary}
            onClick={onContinue}
            isLoading={continueLoading}
            isDisabled={continueLoading}
            data-testid={
              variant === CameraAccessErrorContentVariant.Needed
                ? 'qr-camera-access-needed-continue'
                : 'qr-camera-blocked-continue'
            }
            isFullWidth
          >
            {continueLabel}
          </Button>
        </Box>
      )}
    </Box>
  );
};

export { CameraAccessErrorContentVariant } from './camera-access-error-content.types';
