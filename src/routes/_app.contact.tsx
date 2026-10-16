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
import {
    Breadcrumb,
    BreadcrumbList,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Typography } from '@/components/typography';
import { SeoMeta } from '@/components/seo-meta';
import { buildCanonicalUrl } from '@/utils/canonical-url';
import { PageType } from '@/lib/decorators/page-type';
import { RegionDefinition } from '@/lib/decorators/region-definition';
import { getLogger } from '@/lib/logger.server';
// import { fetchContentAsset } from '@/lib/api/content.server';

// ---------------------------------------------------------------------------
// Page Designer metadata
// ---------------------------------------------------------------------------
// @PageType registers this page with SFCC Page Designer so editors can manage
// it via the CMS. @RegionDefinition declares the content slots they can fill.
// ---------------------------------------------------------------------------

@PageType({
    name: 'Contact Us Page',
    description: 'Static contact information page.',
    supportedAspectTypes: [],
})
@RegionDefinition([
    {
        id: 'main',
        name: 'Main Content Region',
        description: 'Primary content area for the contact page.',
        maxComponents: 10,
    },
])
export class ContactUsPageMetadata {}

// ---------------------------------------------------------------------------
// Loader data type
// ---------------------------------------------------------------------------
// Declaring this type separately keeps loader and component in sync and lets
// other files (e.g. tests) import it without importing the full module.
// ---------------------------------------------------------------------------

export type ContactUsPageData = {
    pageUrl: string;
    shippingBannerHtml?: string | null;
};

// ---------------------------------------------------------------------------
// Loader — runs server-side before the component renders
// ---------------------------------------------------------------------------
// For a purely static page this just builds the canonical URL for SEO.
// Add async data fetching here (e.g. a CMS call) when needed.
// ---------------------------------------------------------------------------

export async function loader(args: LoaderFunctionArgs): Promise<ContactUsPageData> {
    const logger = getLogger(args.context);
    logger.debug('ContactUs: loader starting');

    const requestUrl = new URL(args.request.url);

    // let shippingBannerHtml: string | null = null;
    // try {
    //     const asset = await fetchContentAsset(args.context, '2-day-shipping-popup');
    //     shippingBannerHtml = asset.c_body ?? null;
    // } catch (err) {
    //     logger.warn('ContactUs: failed to fetch content asset "2-day-shipping-popup"', { err });
    // }

    return {
        pageUrl: buildCanonicalUrl(requestUrl.origin, requestUrl.pathname, requestUrl.search),
        // shippingBannerHtml,
    };
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------
// React Router injects the typed loader result via the `loaderData` prop.
// The `_app` layout (header + footer) wraps this automatically.
// ---------------------------------------------------------------------------

export default function ContactUs({ loaderData }: { loaderData: ContactUsPageData }): ReactElement {
    return (
        <div className="pb-8">
            {loaderData.shippingBannerHtml && (
                <div
                    className="max-w-screen-2xl mx-auto px-4 py-4"
                    dangerouslySetInnerHTML={{ __html: loaderData.shippingBannerHtml }}
                />
            )}
            {/* SEO meta tags — title, description, Open Graph */}
            <SeoMeta
                title="Contact Us"
                description="Get in touch with our team. We are happy to help."
                openGraph={{ type: 'website', url: loaderData.pageUrl }}
            />

            <div className="max-w-screen-2xl mx-auto px-4 pb-6">
                {/* Breadcrumb navigation */}
                <Breadcrumb className="mb-2.5">
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild>
                                <Link to="/">Home</Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>Contact Us</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                {/* Page title */}
                <Typography variant="h2">Contact Us</Typography>
            </div>

            {/* Page body */}
            <div className="max-w-screen-2xl mx-auto px-4 py-6 space-y-4">
                <Typography variant="p">
                    Have a question or need help with your order? Our team is here for you.
                </Typography>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                    <div className="rounded-lg border p-6 space-y-2">
                        <Typography variant="h4">Email</Typography>
                        <Typography variant="p">support@example.com</Typography>
                    </div>
                    <div className="rounded-lg border p-6 space-y-2">
                        <Typography variant="h4">Phone</Typography>
                        <Typography variant="p">1-800-000-0000</Typography>
                    </div>
                    <div className="rounded-lg border p-6 space-y-2">
                        <Typography variant="h4">Hours</Typography>
                        <Typography variant="p">Mon – Fri, 9 am – 5 pm</Typography>
                    </div>
                </div>
            </div>
        </div>
    );
}
