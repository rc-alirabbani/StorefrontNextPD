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
import { waitForStorybookReady } from '@storybook/test-utils';
import PromoBanner from '../index';

const meta: Meta<typeof PromoBanner> = {
    title: 'COMMON/PromoBanner',
    component: PromoBanner,
    tags: ['autodocs', 'interaction'],
    parameters: {
        layout: 'fullscreen',
        docs: {
            description: {
                component: 'Slim promotional strip for site-wide announcements, sale messaging, or time-sensitive offers.',
            },
        },
    },
};

export default meta;
type Story = StoryObj<typeof PromoBanner>;

export const Default: Story = {
    args: {
        message: 'Free shipping on orders over £50',
        backgroundColor: 'primary',
        textColor: 'light',
        dismissible: false,
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await waitForStorybookReady(canvasElement);
        await expect(canvas.getByRole('banner')).toBeInTheDocument();
        await expect(canvas.getByText(/free shipping on orders over £50/i)).toBeInTheDocument();
    },
};

export const WithCTALink: Story = {
    args: {
        message: 'Summer sale — up to 50% off.',
        linkText: 'Shop Now',
        linkUrl: '/category/sale',
        backgroundColor: 'secondary',
        textColor: 'light',
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await waitForStorybookReady(canvasElement);
        await expect(canvas.getByRole('link', { name: /shop now/i })).toBeInTheDocument();
    },
};

export const Dismissible: Story = {
    args: {
        message: 'Sign up for our newsletter and get 10% off your first order.',
        linkText: 'Subscribe',
        linkUrl: '/newsletter',
        backgroundColor: 'accent',
        textColor: 'light',
        dismissible: true,
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await waitForStorybookReady(canvasElement);

        const banner = canvas.getByRole('banner');
        await expect(banner).toBeInTheDocument();

        const dismissBtn = canvas.getByRole('button', { name: /dismiss banner/i });
        await expect(dismissBtn).toBeInTheDocument();

        await userEvent.click(dismissBtn);
        await expect(canvas.queryByRole('banner')).not.toBeInTheDocument();
    },
};

export const MutedLight: Story = {
    args: {
        message: 'New arrivals every week. ',
        linkText: 'See what\'s new',
        linkUrl: '/category/new',
        backgroundColor: 'muted',
        textColor: 'dark',
        dismissible: false,
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await waitForStorybookReady(canvasElement);
        await expect(canvas.getByRole('banner')).toBeInTheDocument();
    },
};
