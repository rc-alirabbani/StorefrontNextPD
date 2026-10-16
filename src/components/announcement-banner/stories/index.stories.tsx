/**
 * Copyright 2026 Salesforce, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within, userEvent } from 'storybook/test';
import AnnouncementBanner from '../index';

const meta: Meta<typeof AnnouncementBanner> = {
    title: 'COMMON/AnnouncementBanner',
    component: AnnouncementBanner,
    tags: ['autodocs'],
    parameters: {
        layout: 'fullscreen',
        docs: {
            description: {
                component:
                    'Site-wide top-of-page message strip for developer-controlled announcements — maintenance windows, feature releases, regional alerts. For merchant-editable promotional strips, use PromoBanner.',
            },
        },
    },
    argTypes: {
        variant: {
            control: 'select',
            options: ['info', 'warning', 'success', 'error'],
        },
    },
};

export default meta;
type Story = StoryObj<typeof AnnouncementBanner>;

export const Info: Story = {
    args: {
        message: 'New feature: order tracking is now available in your account.',
        linkText: 'Try it now',
        linkUrl: '/account/orders',
        variant: 'info',
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByRole('region', { name: /site announcement/i })).toBeInTheDocument();
        await expect(canvas.getByRole('link', { name: /try it now/i })).toBeInTheDocument();
    },
};

export const Warning: Story = {
    args: {
        message: 'Scheduled maintenance on Sunday 14 Jul, 2–4 AM UTC. The site may be briefly unavailable.',
        variant: 'warning',
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByRole('region', { name: /site announcement/i })).toBeInTheDocument();
        await expect(
            canvas.getByText(/scheduled maintenance on sunday/i)
        ).toBeInTheDocument();
    },
};

export const Success: Story = {
    args: {
        message: 'Your order #12345 has been shipped and is on its way.',
        linkText: 'Track shipment',
        linkUrl: '/account/orders/12345',
        variant: 'success',
    },
};

export const Error: Story = {
    args: {
        message: 'We\'re experiencing issues with our payment provider. Please try again shortly.',
        variant: 'error',
    },
};

export const Dismissible: Story = {
    args: {
        message: 'We use cookies to improve your experience.',
        linkText: 'Learn more',
        linkUrl: '/privacy',
        variant: 'info',
        dismissible: true,
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        const banner = canvas.getByRole('region', { name: /site announcement/i });
        await expect(banner).toBeInTheDocument();

        const dismissBtn = canvas.getByRole('button', { name: /dismiss announcement/i });
        await expect(dismissBtn).toBeInTheDocument();

        await userEvent.click(dismissBtn);
        await expect(canvas.queryByRole('region', { name: /site announcement/i })).not.toBeInTheDocument();
    },
};

export const NoIcon: Story = {
    args: {
        message: 'Free standard delivery on all orders this weekend.',
        variant: 'success',
        showIcon: false,
    },
};

export const Snapshot: Story = {
    name: 'Snapshot — all variants',
    render: () => (
        <div className="flex flex-col gap-0">
            <AnnouncementBanner message="Info: New features are available." variant="info" />
            <AnnouncementBanner message="Warning: Maintenance scheduled for tonight." variant="warning" />
            <AnnouncementBanner message="Success: Your changes have been saved." variant="success" />
            <AnnouncementBanner message="Error: Payment processing is temporarily unavailable." variant="error" />
        </div>
    ),
};
