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
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Link } from '@/components/link';
import { Info, AlertTriangle, CheckCircle2, AlertCircle, X, Copy, Check } from 'lucide-react';

const announcementBannerVariants = cva(
    'w-full py-2.5 px-4 flex items-center gap-3 text-sm font-medium',
    {
        variants: {
            variant: {
                // Brand primary blue — the system's identity color for information
                info: 'bg-brand-dark text-white',
                // System accent palette (--accent / --accent-foreground) is the warning spectrum
                warning: 'bg-accent text-accent-foreground',
                // System active/positive token
                success: 'bg-active-bg text-active-foreground',
                // System critical status token
                error: 'bg-status-critical-bg text-status-critical-foreground',
            },
        },
        defaultVariants: { variant: 'info' },
    }
);

const VARIANT_ICONS = {
    info: Info,
    warning: AlertTriangle,
    success: CheckCircle2,
    error: AlertCircle,
} as const;

type AnnouncementVariant = keyof typeof VARIANT_ICONS;

export interface AnnouncementBannerProps extends VariantProps<typeof announcementBannerVariants> {
    message: string;
    promoCode?: string;
    linkText?: string;
    linkUrl?: string;
    dismissible?: boolean;
    showIcon?: boolean;
    className?: string;
}

function PromoCodeBadge({ code }: { code: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(code).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <button
            onClick={handleCopy}
            aria-label={copied ? 'Copied!' : `Copy promo code ${code}`}
            className="inline-flex items-center gap-1 mx-1.5 px-2 py-0.5 rounded border border-current/40 bg-white/15 font-mono font-bold tracking-widest text-[0.82em] hover:bg-white/25 transition-colors cursor-pointer"
        >
            {code}
            {copied ? (
                <Check className="w-3 h-3 shrink-0" aria-hidden="true" />
            ) : (
                <Copy className="w-3 h-3 shrink-0 opacity-70" aria-hidden="true" />
            )}
        </button>
    );
}

function MessageWithCode({ message, promoCode }: { message: string; promoCode?: string }) {
    if (!promoCode) return <>{message}</>;

    const parts = message.split(promoCode);
    if (parts.length < 2) return <>{message}</>;

    return (
        <>
            {parts[0]}
            <PromoCodeBadge code={promoCode} />
            {parts[1]}
        </>
    );
}

export default function AnnouncementBanner({
    message,
    promoCode,
    linkText,
    linkUrl,
    variant = 'info',
    dismissible = false,
    showIcon = true,
    className,
}: AnnouncementBannerProps) {
    const [dismissed, setDismissed] = useState(false);

    if (!message || dismissed) return null;

    const resolvedVariant = (variant ?? 'info') as AnnouncementVariant;
    const Icon = VARIANT_ICONS[resolvedVariant];
    const showLink = linkText && linkUrl;

    return (
        <div
            data-slot="announcement-banner"
            role="region"
            aria-label="Site announcement"
            className={cn(announcementBannerVariants({ variant }), className)}
        >
            <div
                data-slot="announcement-banner-content"
                className="flex items-center gap-2 flex-1 justify-center"
            >
                {showIcon && <Icon aria-hidden="true" className="w-4 h-4 shrink-0" />}
                <span data-slot="announcement-banner-message" className="text-center leading-snug">
                    <MessageWithCode message={message} promoCode={promoCode} />
                    {showLink && (
                        <>
                            {' '}
                            <Link
                                to={linkUrl}
                                className="underline underline-offset-2 hover:no-underline font-semibold"
                            >
                                {linkText}
                            </Link>
                        </>
                    )}
                </span>
            </div>

            {dismissible && (
                <button
                    data-slot="announcement-banner-dismiss"
                    onClick={() => setDismissed(true)}
                    aria-label="Dismiss announcement"
                    className="ml-auto shrink-0 p-1 rounded-sm opacity-70 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-opacity"
                >
                    <X className="w-4 h-4" />
                </button>
            )}
        </div>
    );
}
