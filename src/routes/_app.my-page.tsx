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
import type { ReactElement } from 'react';
import type { LoaderFunctionArgs } from 'react-router';
import { Link } from '@/components/link';
import { SeoMeta } from '@/components/seo-meta';
import { Typography } from '@/components/typography';
import { Button } from '@/components/ui/button';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Region } from '@/components/region';
import { cn } from '@/lib/utils';
import { PageType } from '@/lib/decorators/page-type';
import { RegionDefinition } from '@/lib/decorators/region-definition';
import { fetchPageWithComponentData, type PageWithComponentData } from '@/lib/util/pageLoader.server';
import { buildCanonicalUrl } from '@/utils/canonical-url';

// ---------------------------------------------------------------------------
// Page Designer metadata — registers this page type + regions in Business Manager
// ---------------------------------------------------------------------------

@PageType({
    name: 'My Page',
    description: 'Custom landing page with hero, feature cards, and CTA sections.',
    supportedAspectTypes: [],
})
@RegionDefinition([
    {
        id: 'hero',
        name: 'Hero Region',
        description: 'Full-width hero banner area at the top of the page',
        maxComponents: 1,
    },
    {
        id: 'features',
        name: 'Features Region',
        description: 'Feature card grid — up to 6 content blocks',
        maxComponents: 6,
    },
    {
        id: 'cta',
        name: 'CTA Region',
        description: 'Call-to-action strip at the bottom of the page',
        maxComponents: 1,
    },
])
export class MyPageMetadata {}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type MyPageData = {
    page: PageWithComponentData | null;
    pageUrl: string;
};

// ---------------------------------------------------------------------------
// Loader
// ---------------------------------------------------------------------------

export async function loader(args: LoaderFunctionArgs): Promise<MyPageData> {
    const requestUrl = new URL(args.request.url);
    return {
        page: await fetchPageWithComponentData(args, { pageId: 'mypage' }),
        pageUrl: buildCanonicalUrl(requestUrl.origin, requestUrl.pathname, requestUrl.search),
    };
}

// ---------------------------------------------------------------------------
// Static fallback content (shown when no PD page is configured)
// ---------------------------------------------------------------------------

const FEATURES = [
    {
        icon: '✦',
        title: 'Feature One',
        description:
            'Describe what makes this feature compelling. Focus on the customer benefit, not the technical detail.',
        cta: 'Learn more',
        href: '/category/new-arrivals',
    },
    {
        icon: '◈',
        title: 'Feature Two',
        description:
            'A second benefit or selling point that reinforces why visitors should trust and choose your brand.',
        cta: 'Shop now',
        href: '/search',
    },
    {
        icon: '❋',
        title: 'Feature Three',
        description:
            'Round out the value proposition here — quality, service, sustainability, community, or whatever fits.',
        cta: 'Discover',
        href: '/about-us',
    },
] as const;

function HeroBannerFallback() {
    return (
        <div className="relative overflow-hidden rounded-2xl bg-brand-dark text-white">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/40 to-transparent pointer-events-none" />
            <div className="relative z-10 flex flex-col items-center text-center gap-6 px-6 py-20 md:py-28">
                <span className="text-xs font-semibold tracking-widest uppercase opacity-70">
                    Welcome
                </span>
                <Typography variant="h1" className="text-white max-w-2xl">
                    Your Page Headline Goes Here
                </Typography>
                <p className="max-w-xl text-lg opacity-80">
                    Replace this with a concise sub-headline that communicates the core value of
                    this page in one or two sentences.
                </p>
                <div className="flex flex-wrap justify-center gap-3 pt-2">
                    <Button asChild size="lg" className="rounded-full">
                        <Link to="/search">Shop now</Link>
                    </Button>
                    <Button
                        asChild
                        size="lg"
                        variant="outline"
                        className="rounded-full border-white text-white hover:bg-white hover:text-brand-dark"
                    >
                        <Link to="/about-us">Learn more</Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}

function FeatureCardFallback({
    icon,
    title,
    description,
    cta,
    href,
}: (typeof FEATURES)[number]) {
    return (
        <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6 hover:shadow-md transition-shadow">
            <span className="text-3xl text-brand-primary" aria-hidden="true">
                {icon}
            </span>
            <Typography variant="h4">{title}</Typography>
            <p className="flex-1 text-sm text-muted-foreground">{description}</p>
            <Button
                asChild
                variant="ghost"
                className="w-fit -ml-2 px-2 text-brand-primary hover:text-brand-primary"
            >
                <Link to={href}>{cta} →</Link>
            </Button>
        </div>
    );
}

function FeaturesFallback() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
                <FeatureCardFallback key={f.title} {...f} />
            ))}
        </div>
    );
}

function CtaFallback() {
    return (
        <div
            className={cn(
                'flex flex-col items-center gap-4 rounded-2xl px-6 py-12 text-center',
                'bg-secondary text-secondary-foreground'
            )}
        >
            <Typography variant="h3">Ready to get started?</Typography>
            <p className="max-w-md text-muted-foreground">
                Replace this with a closing call-to-action — a newsletter sign-up, a sale
                announcement, or a link to your featured category.
            </p>
            <Button asChild size="lg" className="rounded-full mt-2">
                <Link to="/search">Browse the catalogue</Link>
            </Button>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Region wrappers — use PD content when available, fall back to static content
// ---------------------------------------------------------------------------

function HeroRegion({ page }: { page: PageWithComponentData | null }): ReactElement {
    if (!page) return <HeroBannerFallback />;
    return (
        <Region
            page={Promise.resolve(page)}
            regionId="hero"
            errorElement={<HeroBannerFallback />}
        />
    );
}

function FeaturesRegion({ page }: { page: PageWithComponentData | null }): ReactElement {
    if (!page) return <FeaturesFallback />;
    return (
        <Region
            page={Promise.resolve(page)}
            regionId="features"
            errorElement={<FeaturesFallback />}
        />
    );
}

function CtaRegion({ page }: { page: PageWithComponentData | null }): ReactElement {
    if (!page) return <CtaFallback />;
    return (
        <Region
            page={Promise.resolve(page)}
            regionId="cta"
            errorElement={<CtaFallback />}
        />
    );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function MyPage({ loaderData }: { loaderData: MyPageData }): ReactElement {
    const { page, pageUrl } = loaderData;

    return (
        <div className="max-w-screen-2xl mx-auto px-4 pb-12 space-y-10">
            <SeoMeta
                title="My Page"
                description="A custom landing page — update this description to match your content."
                openGraph={{ type: 'website', url: pageUrl }}
            />

            {/* Breadcrumb */}
            <Breadcrumb className="pt-4">
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link to="/">Home</Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>My Page</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            {/* Hero Region */}
            <HeroRegion page={page} />

            {/* Features Region */}
            <section className="space-y-4">
                <Typography variant="h2" className="text-center">
                    Why choose us
                </Typography>
                <p className="text-center text-muted-foreground max-w-xl mx-auto">
                    Swap this intro line for a brief section summary that sets up the cards below.
                </p>
                <div className="pt-4">
                    <FeaturesRegion page={page} />
                </div>
            </section>

            {/* CTA Region */}
            <CtaRegion page={page} />
        </div>
    );
}
