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
import { useState } from 'react';
import { Link } from '@/components/link';
import { cn } from '@/lib/utils';
import { Component } from '@/lib/decorators/component';
import { AttributeDefinition } from '@/lib/decorators/attribute-definition';
import { X } from 'lucide-react';

const BACKGROUND_VALUES = ['primary', 'secondary', 'accent', 'muted'] as const;
type Background = (typeof BACKGROUND_VALUES)[number];

const TEXT_COLOR_VALUES = ['light', 'dark'] as const;
type TextColor = (typeof TEXT_COLOR_VALUES)[number];

const BACKGROUND_CLASS: Record<Background, string> = {
    primary: 'bg-brand-primary',
    secondary: 'bg-brand-gray-900',
    accent: 'bg-brand-black-charcoal',
    muted: 'bg-brand-gray-100',
};

const TEXT_CLASS: Record<TextColor, string> = {
    light: 'text-white',
    dark: 'text-brand-black',
};

function normalizeBackground(value: string | undefined): Background {
    if (value && (BACKGROUND_VALUES as readonly string[]).includes(value)) return value as Background;
    return 'primary';
}

function normalizeTextColor(value: string | undefined): TextColor {
    if (value && (TEXT_COLOR_VALUES as readonly string[]).includes(value)) return value as TextColor;
    return 'light';
}

/* v8 ignore start - do not test decorators in unit tests, decorator functionality is tested separately */
@Component('promoBanner', {
    name: 'Promo Banner',
    description:
        'Slim promotional strip for site-wide announcements, sale messaging, or time-sensitive offers. Supports an optional CTA link and a dismiss button.',
    group: 'Content',
})
export class PromoBannerMetadata {
    @AttributeDefinition({ required: true })
    message?: string;

    @AttributeDefinition()
    linkText?: string;

    @AttributeDefinition({
        id: 'linkUrl',
        name: 'Link URL',
        type: 'url',
        required: false,
    })
    linkUrl?: string;

    @AttributeDefinition({
        id: 'backgroundColor',
        name: 'Background Color',
        type: 'enum',
        values: ['primary', 'secondary', 'accent', 'muted'],
        defaultValue: 'primary',
    })
    backgroundColor?: string;

    @AttributeDefinition({
        id: 'textColor',
        name: 'Text Color',
        type: 'enum',
        values: ['light', 'dark'],
        defaultValue: 'light',
    })
    textColor?: string;

    @AttributeDefinition({
        id: 'dismissible',
        name: 'Dismissible',
        description: 'Allow visitors to close the banner',
        defaultValue: false,
    })
    dismissible?: boolean;
}
/* v8 ignore stop */

export interface PromoBannerProps {
    message?: string;
    linkText?: string;
    linkUrl?: string;
    backgroundColor?: string;
    textColor?: string;
    dismissible?: boolean;
}

export default function PromoBanner({
    message,
    linkText,
    linkUrl,
    backgroundColor,
    textColor,
    dismissible = false,
}: PromoBannerProps) {
    const [dismissed, setDismissed] = useState(false);

    if (!message || dismissed) return null;

    const bg = normalizeBackground(backgroundColor);
    const tc = normalizeTextColor(textColor);
    const showLink = linkText && linkUrl;

    return (
        <div
            role="banner"
            className={cn(
                'w-full py-2.5 px-4 flex items-center justify-center gap-3 text-sm font-medium',
                BACKGROUND_CLASS[bg],
                TEXT_CLASS[tc]
            )}>
            <span className="text-center leading-snug">
                {message}
                {showLink && (
                    <>
                        {' '}
                        <Link
                            to={linkUrl}
                            className={cn(
                                'underline underline-offset-2 hover:no-underline font-semibold',
                                tc === 'light' ? 'text-white' : 'text-brand-black'
                            )}>
                            {linkText}
                        </Link>
                    </>
                )}
            </span>

            {dismissible && (
                <button
                    onClick={() => setDismissed(true)}
                    aria-label="Dismiss banner"
                    className={cn(
                        'ml-auto shrink-0 p-1 rounded-sm opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 transition-opacity',
                        tc === 'light' ? 'focus:ring-white/50' : 'focus:ring-brand-black/50'
                    )}>
                    <X className="w-4 h-4" />
                </button>
            )}
        </div>
    );
}
