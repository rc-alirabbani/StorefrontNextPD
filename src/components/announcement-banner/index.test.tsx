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
import AnnouncementBanner from './index';

describe('AnnouncementBanner', () => {
    const renderWithRouter = (ui: React.ReactElement) => {
        const router = createMemoryRouter(
            [{ path: '*', element: <AllProvidersWrapper>{ui}</AllProvidersWrapper> }],
            { initialEntries: ['/'] }
        );
        return render(<RouterProvider router={router} />);
    };

    test('renders message', () => {
        renderWithRouter(<AnnouncementBanner message="Scheduled maintenance tonight at 10 PM" />);
        expect(screen.getByText(/scheduled maintenance tonight at 10 pm/i)).toBeInTheDocument();
    });

    test('renders nothing when message is empty', () => {
        const { container } = renderWithRouter(<AnnouncementBanner message="" />);
        expect(container.firstChild).toBeNull();
    });

    test('has region role with accessible label', () => {
        renderWithRouter(<AnnouncementBanner message="Test announcement" />);
        expect(screen.getByRole('region', { name: /site announcement/i })).toBeInTheDocument();
    });

    test('renders CTA link when both linkText and linkUrl are provided', () => {
        renderWithRouter(
            <AnnouncementBanner
                message="New features available"
                linkText="Learn more"
                linkUrl="/whats-new"
            />
        );
        const link = screen.getByRole('link', { name: /learn more/i });
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute('href', expect.stringContaining('/whats-new'));
    });

    test('does not render link when linkUrl is missing', () => {
        renderWithRouter(<AnnouncementBanner message="Hello" linkText="Click here" />);
        expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });

    test('does not render link when linkText is missing', () => {
        renderWithRouter(<AnnouncementBanner message="Hello" linkUrl="/somewhere" />);
        expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });

    test('does not render dismiss button when dismissible is false', () => {
        renderWithRouter(<AnnouncementBanner message="Hello" dismissible={false} />);
        expect(screen.queryByRole('button', { name: /dismiss/i })).not.toBeInTheDocument();
    });

    test('renders dismiss button when dismissible is true', () => {
        renderWithRouter(<AnnouncementBanner message="Hello" dismissible={true} />);
        expect(screen.getByRole('button', { name: /dismiss announcement/i })).toBeInTheDocument();
    });

    test('hides banner after dismiss button is clicked', () => {
        renderWithRouter(<AnnouncementBanner message="Hello" dismissible={true} />);
        fireEvent.click(screen.getByRole('button', { name: /dismiss announcement/i }));
        expect(screen.queryByText('Hello')).not.toBeInTheDocument();
    });

    test('applies info variant styles by default', () => {
        const { container } = renderWithRouter(<AnnouncementBanner message="Hello" />);
        expect(container.firstChild).toHaveClass('bg-brand-primary');
        expect(container.firstChild).toHaveClass('text-white');
    });

    test('applies warning variant styles', () => {
        const { container } = renderWithRouter(
            <AnnouncementBanner message="Hello" variant="warning" />
        );
        expect(container.firstChild).toHaveClass('bg-accent');
        expect(container.firstChild).toHaveClass('text-accent-foreground');
    });

    test('applies success variant styles', () => {
        const { container } = renderWithRouter(
            <AnnouncementBanner message="Hello" variant="success" />
        );
        expect(container.firstChild).toHaveClass('bg-active-bg');
        expect(container.firstChild).toHaveClass('text-active-foreground');
    });

    test('applies error variant styles', () => {
        const { container } = renderWithRouter(
            <AnnouncementBanner message="Hello" variant="error" />
        );
        expect(container.firstChild).toHaveClass('bg-status-critical-bg');
        expect(container.firstChild).toHaveClass('text-status-critical-foreground');
    });

    test('renders icon by default', () => {
        renderWithRouter(<AnnouncementBanner message="Hello" />);
        const icon = document.querySelector('[aria-hidden="true"]');
        expect(icon).toBeInTheDocument();
    });

    test('does not render icon when showIcon is false', () => {
        renderWithRouter(<AnnouncementBanner message="Hello" showIcon={false} />);
        const icon = document.querySelector('[aria-hidden="true"]');
        expect(icon).not.toBeInTheDocument();
    });

    test('accepts custom className', () => {
        const { container } = renderWithRouter(
            <AnnouncementBanner message="Hello" className="custom-class" />
        );
        expect(container.firstChild).toHaveClass('custom-class');
    });
});
