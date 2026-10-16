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

import { Suspense, type ReactElement } from 'react';

import type { LoaderFunctionArgs } from 'react-router';

import { Await } from 'react-router';

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

import { PageType } from '@/lib/decorators/page-type';

import { RegionDefinition } from '@/lib/decorators/region-definition';

import {

    fetchStorefrontPage,

    STOREFRONT_PAGE_TYPE_IDS,

} from '@/lib/util/pageLoader.server';

import { getLogger } from '@/lib/logger.server';

import { buildCanonicalUrl } from '@/utils/canonical-url';

import { siteContext } from '@salesforce/storefront-next-runtime/site-context';

import { getTranslation } from '@salesforce/storefront-next-runtime/i18n';

function formatAspectPageLabel(aspectPageId?: string): string {
    if (!aspectPageId) {
        return 'Storefront Page';
    }

    return aspectPageId.charAt(0).toUpperCase() + aspectPageId.slice(1);
}
// ---------------------------------------------------------------------------

// Page Designer metadata — registers this page type + regions in Business Manager

// Generates: experience/pages/storefrontPage.json (page type "Storefront Page")

// ---------------------------------------------------------------------------



@PageType({

    name: 'Storefront Page',

    description: 'A Storefront Page Type',

    supportedAspectTypes: ['page'],

})

@RegionDefinition([

    {

        id: 'headerbanner',

        name: 'Header Banner Region',

        description: 'Full-width banner area at the top of the page',

        maxComponents: 1,

    },

    {

        id: 'main',

        name: 'Main Region',

        description: 'Primary content area for the page',

        componentTypeExclusions: ['commerce_assets.campaignBanner'],

    },

])

export class StorePageMetadata {}



// ---------------------------------------------------------------------------

// Types

// ---------------------------------------------------------------------------



export type StorePageData = {

    page: ReturnType<typeof fetchStorefrontPage> | null;

    pageUrl: string;

    aspectPageId?: string;

};



// ---------------------------------------------------------------------------

// Loader

// ---------------------------------------------------------------------------



export function loader(args: LoaderFunctionArgs): StorePageData {

    const logger = getLogger(args.context);

    const requestUrl = new URL(args.request.url);

    // Runtime: `:pageId` is the BM content page ID (e.g. `test` for /page/test).

    // SCAPI call: getPage('page' | 'storefrontPage', { aspectType: 'page', pageId: aspectPageId }).

    // In Page Designer design/preview mode, fetchPageFromLoader overrides pageId with

    // the `?pageId=` query param that Business Manager passes (with mode/pdToken).

    const aspectPageId = args.params.pageId;



    const page = aspectPageId

        ? fetchStorefrontPage(args, aspectPageId).then((resolvedPage) => {

              if (!resolvedPage) {

                  const siteCtx = args.context.get(siteContext);

                  const { i18next } = getTranslation(args.context);

                  logger.warn('Storefront Page: no published Page Designer page found', {

                      aspectPageId,

                      siteId: siteCtx?.site?.id,

                      locale: siteCtx?.locale?.id ?? i18next.language,

                      pageTypeIds: [...STOREFRONT_PAGE_TYPE_IDS],

                      hint: 'In BM: create a Storefront Page on site StoreforntNextPD, set Page ID to match the URL segment, assign Custom page aspect, and publish Online.',

                  });

              }

              return resolvedPage;

          })

        : null;



    return {

        page,

        pageUrl: buildCanonicalUrl(requestUrl.origin, requestUrl.pathname, requestUrl.search),

        aspectPageId,

    };

}



// ---------------------------------------------------------------------------

// Static fallback content (shown when no PD page is configured)

// ---------------------------------------------------------------------------



function HeaderBannerFallback() {

    return (

        <div className="relative overflow-hidden rounded-2xl bg-brand-dark text-white">

            <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/40 to-transparent pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center text-center gap-6 px-6 py-20 md:py-28">

                <span className="text-xs font-semibold tracking-widest uppercase opacity-70">

                    Welcome

                </span>

                <Typography variant="h1" className="text-white max-w-2xl">

                    Your Storefront Page Headline

                </Typography>

                <p className="max-w-xl text-lg opacity-80">

                    Add a Header Banner component in Page Designer to replace this placeholder.

                </p>

                <div className="flex flex-wrap justify-center gap-3 pt-2">

                    <Button asChild size="lg" className="rounded-full">

                        <Link to="/search">Shop now</Link>

                    </Button>

                </div>

            </div>

        </div>

    );

}



function MainFallback({ aspectPageId }: { aspectPageId?: string }) {

    return (

        <div className="rounded-2xl border border-border bg-card px-6 py-16 text-center">

            <Typography variant="h3">This page has no content yet</Typography>

            <p className="mx-auto mt-3 max-w-md text-muted-foreground">

                SCAPI did not return a published Page Designer page for this URL. BM edit/preview works with

                <code className="mx-1">mode</code> and <code>pdToken</code>; the live storefront requires the page to

                be <strong>Published (Online)</strong> on site StoreforntNextPD.

            </p>

            {aspectPageId === 'about' ? (
                <p className="mx-auto mt-3 max-w-md text-muted-foreground">
                    If you created an <strong>About Us Page</strong> in Business Manager, use{' '}
                    <Link to="/about-us" className="underline">
                        /about-us
                    </Link>{' '}
                    instead of /page/about.
                </p>
            ) : (
                <p className="mx-auto mt-3 max-w-md text-muted-foreground">
                    In BM: use page type <strong>Storefront Page</strong>, set Custom page aspect Page ID to{' '}
                    <strong>{aspectPageId ?? 'your-url-segment'}</strong>, and add components to the Main region.
                </p>
            )}

            <Button asChild size="lg" className="mt-6 rounded-full">

                <Link to="/">Back to home</Link>

            </Button>

        </div>

    );

}



function StorePageHeader({

    pagePromise,

    pageUrl,

    aspectPageId,

}: {

    pagePromise: ReturnType<typeof fetchStorefrontPage>;

    pageUrl: string;

    aspectPageId?: string;

}): ReactElement {

    const fallbackLabel = formatAspectPageLabel(aspectPageId);

    return (

        <Suspense

            fallback={

                <>

                    <SeoMeta title={fallbackLabel} openGraph={{ type: 'website', url: pageUrl }} />

                    <Breadcrumb className="pt-4">

                        <BreadcrumbList>

                            <BreadcrumbItem>

                                <BreadcrumbLink asChild>

                                    <Link to="/">Home</Link>

                                </BreadcrumbLink>

                            </BreadcrumbItem>

                            <BreadcrumbSeparator />

                            <BreadcrumbItem>

                                <BreadcrumbPage>{fallbackLabel}</BreadcrumbPage>

                            </BreadcrumbItem>

                        </BreadcrumbList>

                    </Breadcrumb>

                </>

            }>

            <Await resolve={pagePromise}>

                {(page) => (

                    <>

                        <SeoMeta

                            title={page?.name ?? fallbackLabel}

                            description="A storefront page — update this description to match your content."

                            openGraph={{ type: 'website', url: pageUrl }}

                        />

                        <Breadcrumb className="pt-4">

                            <BreadcrumbList>

                                <BreadcrumbItem>

                                    <BreadcrumbLink asChild>

                                        <Link to="/">Home</Link>

                                    </BreadcrumbLink>

                                </BreadcrumbItem>

                                <BreadcrumbSeparator />

                                <BreadcrumbItem>

                                    <BreadcrumbPage>{page?.name ?? fallbackLabel}</BreadcrumbPage>

                                </BreadcrumbItem>

                            </BreadcrumbList>

                        </Breadcrumb>

                    </>

                )}

            </Await>

        </Suspense>

    );

}



// ---------------------------------------------------------------------------

// Page

// ---------------------------------------------------------------------------



export default function StorePage({ loaderData }: { loaderData: StorePageData }): ReactElement {

    const { page, pageUrl, aspectPageId } = loaderData;

    const mainFallback = <MainFallback aspectPageId={aspectPageId} />;



    return (

        <div className="max-w-screen-2xl mx-auto px-4 pb-12 space-y-10">

            {page ? (

                <StorePageHeader pagePromise={page} pageUrl={pageUrl} aspectPageId={aspectPageId} />

            ) : (

                <StorePageHeader
                    pagePromise={Promise.resolve(null)}
                    pageUrl={pageUrl}
                    aspectPageId={aspectPageId}
                />

            )}



            {/* Header Banner Region — pass unresolved page promise so componentData stays intact */}

            <Region

                page={page ?? Promise.resolve(null)}

                regionId="headerbanner"

                errorElement={<HeaderBannerFallback />}

            />



            {/* Main Region */}

            <Region

                page={page ?? Promise.resolve(null)}

                regionId="main"

                errorElement={mainFallback}

            />

        </div>

    );

}


