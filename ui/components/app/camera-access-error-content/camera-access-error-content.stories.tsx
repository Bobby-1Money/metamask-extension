import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import {
  Box,
  BoxBackgroundColor,
  TextColor,
} from '@metamask/design-system-react';
import {
  CameraAccessErrorContent,
  CameraAccessErrorContentVariant,
} from './camera-access-error-content';
import type {
  CameraAccessErrorContentBlockedProps,
  CameraAccessErrorContentNeededProps,
} from './camera-access-error-content.types';

const MOZ_EXTENSION_DISPLAY_MOCK = 'moz-extension://ab5f75ae…d4aa03';

const meta = {
  title: 'Components/App/CameraAccessErrorContent',
  component: CameraAccessErrorContent,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
Locale copy lives inside the component (\`useI18nContext\`).

**Variants**
- **needed** — User dismissed the permission prompt; permission can be requested again. Renders title, body, and primary action only.
- **blocked** — Camera persistently denied. **Firefox**: numbered steps (step 2 uses \`mozExtensionDisplay\`). **Chromium / similar**: hint callout plus **Open settings** and primary **Continue**.

**Blocked props (type-level)**  
\`mozExtensionDisplay\` and \`onOpenSettings\` are required for \`blocked\` even though only one branch uses them at runtime (Firefox vs Chromium).

**Optional layout (both variants)**  
\`hideLeadingIcon\`, \`hideActionButtons\`, \`compactPadding\`, \`titleTextColor\`, \`bodyParagraphTextColor\`, \`continueMessageKey\` — used when embedding (e.g. hardware wallet error modal with its own header/footer).
`.trim(),
      },
    },
  },
  decorators: [
    (Story) => (
      <Box
        backgroundColor={BoxBackgroundColor.BackgroundDefault}
        padding={4}
        style={{ width: '100%', maxWidth: 400 }}
      >
        <Story />
      </Box>
    ),
  ],
  argTypes: {
    variant: {
      control: 'select',
      options: [
        CameraAccessErrorContentVariant.Needed,
        CameraAccessErrorContentVariant.Blocked,
      ],
      description:
        '`needed` — prompt dismissed. `blocked` — persistently denied (UI branches on `isFirefox`).',
    },
    onContinue: {
      action: 'onContinue',
      description:
        'Primary button handler. Label defaults to `continue` unless `continueMessageKey` is set.',
    },
    continueLoading: {
      description: 'Disables the primary button and shows a loading state.',
    },
    continueMessageKey: {
      control: 'text',
      description:
        'Optional i18n key for the primary label (default `continue`). Example: `hardwareWalletErrorContinueButton` in the hardware wallet modal.',
    },
    hideLeadingIcon: {
      description:
        'Hide the top camera icon when a parent already shows one (e.g. modal header).',
    },
    hideActionButtons: {
      description:
        'Hide built-in actions when the parent supplies its own footer (e.g. modal).',
    },
    compactPadding: {
      description:
        'Use less horizontal/bottom padding when nested inside another padded container.',
    },
    titleTextColor: {
      control: false,
      description:
        'Design system `TextColor` for the heading (default `TextDefault`).',
    },
    bodyParagraphTextColor: {
      control: false,
      description:
        'Design system `TextColor` for the paragraph under the title; hint callouts keep default contrast (default `TextDefault`).',
    },
    isFirefox: {
      control: 'boolean',
      description:
        '`blocked` only: Firefox steps vs Chromium hint + Open settings.',
      if: { arg: 'variant', eq: CameraAccessErrorContentVariant.Blocked },
    },
    mozExtensionDisplay: {
      control: 'text',
      description:
        '`blocked` only: shown in Firefox step 2; ignored when `isFirefox` is false.',
      if: { arg: 'variant', eq: CameraAccessErrorContentVariant.Blocked },
    },
    onOpenSettings: {
      action: 'onOpenSettings',
      description:
        '`blocked` only: Chromium secondary button; not shown for Firefox.',
      if: { arg: 'variant', eq: CameraAccessErrorContentVariant.Blocked },
    },
  },
} satisfies Meta<typeof CameraAccessErrorContent>;

export default meta;

type Story = StoryObj<typeof CameraAccessErrorContent>;

export const Needed: Story = {
  args: {
    variant: CameraAccessErrorContentVariant.Needed,
    continueLoading: false,
    onContinue: () => undefined,
  } satisfies CameraAccessErrorContentNeededProps,
};

export const NeededHardwareWalletContinueLabel: Story = {
  storyName: 'Needed (hardware wallet continue label)',
  args: {
    variant: CameraAccessErrorContentVariant.Needed,
    continueLoading: false,
    onContinue: () => undefined,
    continueMessageKey: 'hardwareWalletErrorContinueButton',
  } satisfies CameraAccessErrorContentNeededProps,
};

export const BlockedChromium: Story = {
  storyName: 'Blocked (Chrome / Chromium)',
  args: {
    variant: CameraAccessErrorContentVariant.Blocked,
    isFirefox: false,
    mozExtensionDisplay: '',
    continueLoading: false,
    onContinue: () => undefined,
    onOpenSettings: () => undefined,
  } satisfies CameraAccessErrorContentBlockedProps,
};

export const BlockedFirefox: Story = {
  storyName: 'Blocked (Firefox)',
  args: {
    variant: CameraAccessErrorContentVariant.Blocked,
    isFirefox: true,
    mozExtensionDisplay: MOZ_EXTENSION_DISPLAY_MOCK,
    continueLoading: false,
    onContinue: () => undefined,
    onOpenSettings: () => undefined,
  } satisfies CameraAccessErrorContentBlockedProps,
};

/** Content-only strip: parent supplies header, footer, and primary actions (e.g. modal). */
export const EmbeddedInModalBody: Story = {
  args: {
    variant: CameraAccessErrorContentVariant.Blocked,
    isFirefox: false,
    mozExtensionDisplay: '',
    continueLoading: false,
    onContinue: () => undefined,
    onOpenSettings: () => undefined,
    hideLeadingIcon: true,
    hideActionButtons: true,
    compactPadding: true,
    bodyParagraphTextColor: TextColor.TextAlternative,
  } satisfies CameraAccessErrorContentBlockedProps,
};
