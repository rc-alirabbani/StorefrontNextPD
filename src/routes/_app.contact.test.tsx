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

import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import type { LoaderFunctionArgs } from 'react-router';
import ContactUs, { type ContactUsPageData, loader } from './_app.contact-us';
import { createTestContext } from '@/lib/test-utils';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock('@/components/link', () => ({
    Link: ({ to, children }: any) => <a href={to}>{children}</a>,
}));

vi.mock('@/lib/decorators/page-type', () => ({
    PageType: () => (target: any) => target,
}));

vi.mock('@/lib/decorators/region-definition', () => ({
    RegionDefinition: () => (target: any) => target,
}));

vi.mock('@/lib/logger.server', () => ({
    getLogger: vi.fn(() => ({
        error: vi.fn(),
        warn: vi.fn(),
        info: vi.fn(),
        debug: vi.fn(),
    })),
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const DEFAULT_LOADER_DATA: ContactUsPageData = {
    pageUrl: 'http://localhost/contact-us',
};

const renderComponent = (overrides?: Partial<ContactUsPageData>) =>
    render(<ContactUs loaderData={{ ...DEFAULT_LOADER_DATA, ...overrides }} />);

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('ContactUs', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Basic Rendering', () => {
        test('renders breadcrumb with Home link', () => {
            renderComponent();
            expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
        });

        test('renders breadcrumb current page label', () => {
            renderComponent();
            expect(screen.getByText('Contact Us')).toBeInTheDocument();
        });

        test('renders contact information cards', () => {
            renderComponent();
            expect(screen.getByText('Email')).toBeInTheDocument();
            expect(screen.getByText('Phone')).toBeInTheDocument();
            expect(screen.getByText('Hours')).toBeInTheDocument();
        });

        test('renders contact details', () => {
            renderComponent();
            expect(screen.getByText('support@example.com')).toBeInTheDocument();
            expect(screen.getByText('1-800-000-0000')).toBeInTheDocument();
            expect(screen.getByText('Mon – Fri, 9 am – 5 pm')).toBeInTheDocument();
        });
    });

    describe('Layout and Styling', () => {
        test('applies correct outer container class', () => {
            const { container } = renderComponent();
            expect(container.firstChild).toHaveClass('pb-8');
        });

        test('Home breadcrumb link points to /', () => {
            renderComponent();
            expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/');
        });

        test('renders three info cards in a grid', () => {
            renderComponent();
            // Each card has a heading (h4) — Email, Phone, Hours
            const headings = screen.getAllByRole('heading', { level: 4 });
            expect(headings).toHaveLength(3);
        });
    });

    describe('Loader', () => {
        let mockContext: ReturnType<typeof createTestContext>;
        let baseLoaderArgs: LoaderFunctionArgs;

        beforeEach(() => {
            mockContext = createTestContext();
            baseLoaderArgs = {
                request: new Request('http://localhost/contact-us'),
                params: {},
                context: mockContext,
                unstable_pattern: '/contact-us',
            };
        });

        test('returns pageUrl built from the request URL', async () => {
            const result = await loader(baseLoaderArgs);
            expect(result.pageUrl).toBe('http://localhost/contact-us');
        });

        test('includes query string in canonical URL when present', async () => {
            const result = await loader({
                ...baseLoaderArgs,
                request: new Request('http://localhost/contact-us?ref=footer'),
            });
            expect(result.pageUrl).toContain('contact-us');
        });
    });
});
