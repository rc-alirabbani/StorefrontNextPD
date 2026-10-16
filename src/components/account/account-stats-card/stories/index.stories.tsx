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
import { expect, within } from 'storybook/test';
import { waitForStorybookReady } from '@storybook/test-utils';
import { AccountStatsCard, AccountStatsCardSkeleton } from '../index';

/**
 * AccountStatsCard displays a compact summary of a shopper's key account metrics:
 * total orders placed, wishlist items saved, and addresses on file.
 *
 * It can be rendered standalone in Storybook without authentication or any
 * server-side data — just pass numeric props directly.
 */
const meta: Meta<typeof AccountStatsCard> = {
    title: 'ACCOUNT/Account Stats Card',
    component: AccountStatsCard,
    tags: ['autodocs'],
    parameters: {
        layout: 'padded',
        docs: {
            description: {
                component: `
A compact stat-summary card for the account overview page.

## Features
- **Total Orders** count with shopping bag icon
- **Wishlist Items** count with heart icon
- **Saved Addresses** count with map pin icon
- Fully accessible with ARIA-hidden decorative icons
- Includes a matching \`AccountStatsCardSkeleton\` for loading states

## Usage
\`\`\`tsx
<AccountStatsCard totalOrders={12} wishlistCount={4} addressCount={2} />
\`\`\`
                `,
            },
        },
    },
    argTypes: {
        totalOrders: {
            control: { type: 'number', min: 0 },
            description: 'Total number of orders placed',
        },
        wishlistCount: {
            control: { type: 'number', min: 0 },
            description: 'Number of items saved to the wishlist',
        },
        addressCount: {
            control: { type: 'number', min: 0 },
            description: 'Number of saved addresses',
        },
        recentlyViewedCount: {
            control: { type: 'number', min: 0 },
            description: 'Products viewed this session (from recently-viewed Zustand store)',
        },
    },
};

export default meta;
type Story = StoryObj<typeof AccountStatsCard>;

/**
 * Default story with realistic account data — no login required.
 */
export const Default: Story = {
    args: {
        totalOrders: 12,
        wishlistCount: 4,
        addressCount: 5,
        recentlyViewedCount: 7,
    },
    play: async ({ canvasElement }) => {
        await waitForStorybookReady(canvasElement);
        const canvas = within(canvasElement);

        await expect(canvas.getByText('Account Activity')).toBeInTheDocument();
        await expect(canvas.getByText('12')).toBeInTheDocument();
        await expect(canvas.getByText('Total Orders')).toBeInTheDocument();
        await expect(canvas.getByText('4')).toBeInTheDocument();
        await expect(canvas.getByText('Wishlist Items')).toBeInTheDocument();
        await expect(canvas.getByText('5')).toBeInTheDocument();
        await expect(canvas.getByText('Saved Addresses')).toBeInTheDocument();
        await expect(canvas.getByText('7')).toBeInTheDocument();
        await expect(canvas.getByText('Recently Viewed')).toBeInTheDocument();
    },
};

/**
 * New customer with no activity yet — all stats are zero.
 */
export const NewCustomer: Story = {
    args: {
        totalOrders: 0,
        wishlistCount: 0,
        addressCount: 0,
        recentlyViewedCount: 0,
    },
    parameters: {
        docs: {
            description: {
                story: 'A brand-new customer with no orders, wishlist items, or saved addresses.',
            },
        },
    },
    play: async ({ canvasElement }) => {
        await waitForStorybookReady(canvasElement);
        const canvas = within(canvasElement);

        // All four stats should show 0
        const zeros = canvas.getAllByText('0');
        await expect(zeros.length).toBe(4);
    },
};

/**
 * Power shopper with high activity numbers.
 */
export const PowerShopper: Story = {
    args: {
        totalOrders: 148,
        wishlistCount: 32,
        addressCount: 5,
        recentlyViewedCount: 10,
    },
    parameters: {
        docs: {
            description: {
                story: 'A returning customer with significant order history and many saved items.',
            },
        },
    },
    play: async ({ canvasElement }) => {
        await waitForStorybookReady(canvasElement);
        const canvas = within(canvasElement);

        await expect(canvas.getByText('148')).toBeInTheDocument();
        await expect(canvas.getByText('32')).toBeInTheDocument();
        await expect(canvas.getByText('5')).toBeInTheDocument();
        await expect(canvas.getByText('10')).toBeInTheDocument();
        await expect(canvas.getByText('Recently Viewed')).toBeInTheDocument();
    },
};

/**
 * Loading skeleton shown while account data is being fetched.
 */
export const Loading: StoryObj<typeof AccountStatsCardSkeleton> = {
    render: () => <AccountStatsCardSkeleton />,
    parameters: {
        docs: {
            description: {
                story: 'Skeleton placeholder displayed while stats are loading from the server.',
            },
        },
    },
    play: async ({ canvasElement }) => {
        await waitForStorybookReady(canvasElement);

        const skeletons = canvasElement.querySelectorAll('[data-slot="skeleton"]');
        await expect(skeletons.length).toBeGreaterThan(0);
    },
};
