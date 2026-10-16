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
import { describe, test, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { AllProvidersWrapper } from '@/test-utils/context-provider';
import PromoBanner from './index';

describe('PromoBanner', () => {
    const renderWithRouter = (ui: React.ReactElement) => {
        const router = createMemoryRouter([{ path: '*', element: <AllProvidersWrapper>{ui}</AllProvidersWrapper> }], {
            initialEntries: ['/'],
        });
        return render(<RouterProvider router={router} />);
    };

    test('renders message', () => {
        renderWithRouter(<PromoBanner message="Free shipping on orders over £50" />);
        expect(screen.getByText(/free shipping on orders over £50/i)).toBeInTheDocument();
    });

    test('renders nothing when message is empty', () => {
        const { container } = renderWithRouter(<PromoBanner message="" />);
        expect(container.firstChild).toBeNull();
    });

    test('renders CTA link when both linkText and linkUrl are provided', () => {
        renderWithRouter(
            <PromoBanner message="Sale on now" linkText="Shop Sale" linkUrl="/category/sale" />
        );
        const link = screen.getByRole('link', { name: /shop sale/i });
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute('href', expect.stringContaining('/category/sale'));
    });

    test('does not render link when linkUrl is missing', () => {
        renderWithRouter(<PromoBanner message="Sale on now" linkText="Shop Sale" />);
        expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });

    test('does not render link when linkText is missing', () => {
        renderWithRouter(<PromoBanner message="Sale on now" linkUrl="/category/sale" />);
        expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });

    test('does not render dismiss button when dismissible is false', () => {
        renderWithRouter(<PromoBanner message="Hello" dismissible={false} />);
        expect(screen.queryByRole('button', { name: /dismiss/i })).not.toBeInTheDocument();
    });

    test('renders dismiss button when dismissible is true', () => {
        renderWithRouter(<PromoBanner message="Hello" dismissible={true} />);
        expect(screen.getByRole('button', { name: /dismiss banner/i })).toBeInTheDocument();
    });

    test('hides banner after dismiss button is clicked', () => {
        renderWithRouter(<PromoBanner message="Hello" dismissible={true} />);
        const btn = screen.getByRole('button', { name: /dismiss banner/i });
        fireEvent.click(btn);
        expect(screen.queryByText('Hello')).not.toBeInTheDocument();
    });

    test('applies primary background by default', () => {
        const { container } = renderWithRouter(<PromoBanner message="Hello" />);
        expect(container.firstChild).toHaveClass('bg-brand-primary');
    });

    test('applies muted background when specified', () => {
        const { container } = renderWithRouter(<PromoBanner message="Hello" backgroundColor="muted" />);
        expect(container.firstChild).toHaveClass('bg-brand-gray-100');
    });

    test('applies dark text color', () => {
        const { container } = renderWithRouter(<PromoBanner message="Hello" textColor="dark" />);
        expect(container.firstChild).toHaveClass('text-brand-black');
    });

    test('has banner role for accessibility', () => {
        renderWithRouter(<PromoBanner message="Hello" />);
        expect(screen.getByRole('banner')).toBeInTheDocument();
    });
});
