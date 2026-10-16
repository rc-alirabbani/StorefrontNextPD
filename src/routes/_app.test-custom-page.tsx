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
import { Suspense } from 'react';
import { Await, useFetcher, data } from 'react-router';
import type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router';
import { SeoMeta } from '@/components/seo-meta';
import { Typography } from '@/components/typography';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { createApiClients } from '@/lib/api-clients.server';
import { getBasket } from '@/middlewares/basket.server';
import { Link } from '@/components/link';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ShareTokenResult =
    | { ok: true; shareUrl: string; shareToken: string; expiresAt: string }
    | { ok: false; error: string };

type SharedCartResult =
    | { ok: true; basketId: string; productItems: { productId?: string; productName?: string; quantity?: number; price?: number }[] }
    | { ok: false; error: string };

type LoaderData = {
    sharedCart: Promise<SharedCartResult> | null;
    lookupToken: string | null;
};

// ---------------------------------------------------------------------------
// Loader — resolve a shared cart when ?token= is present in the URL
// ---------------------------------------------------------------------------

export async function loader({ request, context }: LoaderFunctionArgs): Promise<LoaderData> {
    const url = new URL(request.url);
    const token = url.searchParams.get('token');

    if (!token) {
        return { sharedCart: null, lookupToken: null };
    }

    const clients = createApiClients(context);

    const sharedCart: Promise<SharedCartResult> = clients.shareCart
        .getSharedCart({ params: { path: { shareToken: token } } })
        .then(({ data: cart }) => {
            if (!cart) return { ok: false as const, error: 'Token not found or expired' };
            return { ok: true as const, basketId: cart.basketId, productItems: cart.productItems ?? [] };
        })
        .catch(() => ({ ok: false as const, error: 'Failed to fetch shared cart' }));

    return { sharedCart, lookupToken: token };
}

// ---------------------------------------------------------------------------
// Action — create a share token for the current basket
// ---------------------------------------------------------------------------

export async function action({ context }: ActionFunctionArgs) {
    const clients = createApiClients(context);
    const basketResource = await getBasket(context);
    const basket = basketResource.current;

    if (!basket?.basketId) {
        return data<ShareTokenResult>({ ok: false, error: 'No active basket — add an item to your cart first.' }, { status: 400 });
    }

    try {
        const { data: shareData } = await clients.shareCart.createShareToken({
            params: { path: { basketId: basket.basketId } },
        });

        return data<ShareTokenResult>({
            ok: true,
            shareUrl: shareData.shareUrl,
            shareToken: shareData.shareToken,
            expiresAt: shareData.expiresAt,
        });
    } catch {
        return data<ShareTokenResult>(
            { ok: false, error: 'Failed to create share link. Is the cartridge deployed and ver_sharecart active?' },
            { status: 500 }
        );
    }
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StatusBadge({ ok }: { ok: boolean }) {
    return (
        <span
            className={cn(
                'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold',
                ok ? 'bg-active-bg text-active-foreground' : 'bg-status-critical-bg text-status-critical-foreground'
            )}
        >
            {ok ? '✓ Success' : '✗ Error'}
        </span>
    );
}

function JsonBlock({ value }: { value: unknown }) {
    return (
        <pre className="mt-3 p-3 rounded-md bg-muted text-xs font-mono overflow-x-auto whitespace-pre-wrap break-all">
            {JSON.stringify(value, null, 2)}
        </pre>
    );
}

/** Panel: POST /baskets/{basketId}/share → createShareToken */
function CreateSharePanel() {
    const fetcher = useFetcher<typeof action>();
    const result = fetcher.data;
    const busy = fetcher.state !== 'idle';

    return (
        <section className="rounded-lg border border-border p-6 space-y-4">
            <div className="space-y-1">
                <Typography variant="h4">Create Share Token</Typography>
                <p className="text-sm text-muted-foreground">
                    <code className="bg-muted px-1 rounded text-xs">POST /custom/share-cart/v1/…/baskets/&#123;basketId&#125;/share</code>
                </p>
                <p className="text-sm text-muted-foreground">
                    Calls <strong>createShareToken</strong> for the current basket and returns a shareable URL.
                </p>
            </div>

            <fetcher.Form method="post">
                <Button type="submit" disabled={busy} className="w-full sm:w-auto">
                    {busy ? 'Generating…' : 'Generate Share Link'}
                </Button>
            </fetcher.Form>

            {result && (
                <div className="space-y-2">
                    <StatusBadge ok={result.ok} />
                    {result.ok ? (
                        <>
                            <div className="flex items-center gap-2">
                                <input
                                    readOnly
                                    value={result.shareUrl}
                                    onClick={(e) => e.currentTarget.select()}
                                    className="flex-1 text-xs font-mono px-2 py-1.5 rounded border border-input bg-background"
                                />
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => navigator.clipboard.writeText(result.shareUrl)}
                                >
                                    Copy
                                </Button>
                            </div>
                            <JsonBlock value={{ shareToken: result.shareToken, shareUrl: result.shareUrl, expiresAt: result.expiresAt }} />
                        </>
                    ) : (
                        <p className="text-sm text-status-critical-foreground">{result.error}</p>
                    )}
                </div>
            )}
        </section>
    );
}

/** Panel: GET /share/{shareToken} → getSharedCart */
function LookupSharePanel({ initialToken }: { initialToken: string | null }) {
    const fetcher = useFetcher<typeof loader>();
    const busy = fetcher.state !== 'idle';

    return (
        <section className="rounded-lg border border-border p-6 space-y-4">
            <div className="space-y-1">
                <Typography variant="h4">Look Up Shared Cart</Typography>
                <p className="text-sm text-muted-foreground">
                    <code className="bg-muted px-1 rounded text-xs">GET /custom/share-cart/v1/…/share/&#123;shareToken&#125;</code>
                </p>
                <p className="text-sm text-muted-foreground">
                    Calls <strong>getSharedCart</strong> and displays the basket contents for the given token.
                </p>
            </div>

            <fetcher.Form method="get" action="/test-custom-page" className="flex gap-2">
                <input
                    name="token"
                    defaultValue={initialToken ?? ''}
                    placeholder="Paste a share token…"
                    className="flex-1 text-sm px-3 py-1.5 rounded border border-input bg-background"
                />
                <Button type="submit" disabled={busy} variant="outline">
                    {busy ? 'Loading…' : 'Look Up'}
                </Button>
            </fetcher.Form>

            {fetcher.data?.sharedCart && (
                <Suspense fallback={<p className="text-sm text-muted-foreground">Fetching cart…</p>}>
                    <Await resolve={fetcher.data.sharedCart}>
                        {(cartResult) => (
                            <div className="space-y-2">
                                <StatusBadge ok={cartResult.ok} />
                                {cartResult.ok ? (
                                    <>
                                        <p className="text-sm text-muted-foreground">
                                            Basket <code className="bg-muted px-1 rounded text-xs">{cartResult.basketId}</code> —{' '}
                                            {cartResult.productItems.length} item(s)
                                        </p>
                                        <div className="divide-y divide-border rounded border border-border overflow-hidden">
                                            {cartResult.productItems.map((item, i) => (
                                                <div key={i} className="flex items-center justify-between px-4 py-3 text-sm">
                                                    <span className="font-medium">{item.productName ?? item.productId}</span>
                                                    <span className="text-muted-foreground">
                                                        Qty: {item.quantity} · ${(item.price ?? 0).toFixed(2)}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                        <JsonBlock value={cartResult} />
                                    </>
                                ) : (
                                    <p className="text-sm text-status-critical-foreground">{cartResult.error}</p>
                                )}
                            </div>
                        )}
                    </Await>
                </Suspense>
            )}
        </section>
    );
}

// ---------------------------------------------------------------------------
// Shared-cart view rendered from loader (when ?token= is in the URL on page load)
// ---------------------------------------------------------------------------

function LoaderSharedCartView({ sharedCart, token }: { sharedCart: Promise<SharedCartResult>; token: string }) {
    return (
        <section className="rounded-lg border border-border p-6 space-y-4">
            <div className="space-y-1">
                <Typography variant="h4">Shared Cart Preview</Typography>
                <p className="text-sm text-muted-foreground">
                    Loaded from token: <code className="bg-muted px-1 rounded text-xs">{token}</code>
                </p>
            </div>
            <Suspense fallback={<p className="text-sm text-muted-foreground">Resolving shared cart…</p>}>
                <Await resolve={sharedCart}>
                    {(cartResult) => (
                        <div className="space-y-2">
                            <StatusBadge ok={cartResult.ok} />
                            {cartResult.ok ? (
                                <>
                                    <div className="divide-y divide-border rounded border border-border overflow-hidden">
                                        {cartResult.productItems.map((item, i) => (
                                            <div key={i} className="flex items-center justify-between px-4 py-3 text-sm">
                                                <span className="font-medium">{item.productName ?? item.productId}</span>
                                                <span className="text-muted-foreground">
                                                    Qty: {item.quantity} · ${(item.price ?? 0).toFixed(2)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                    <JsonBlock value={cartResult} />
                                </>
                            ) : (
                                <p className="text-sm text-status-critical-foreground">{cartResult.error}</p>
                            )}
                        </div>
                    )}
                </Await>
            </Suspense>
        </section>
    );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function TestCustomPage({ loaderData }: { loaderData: LoaderData }) {
    const { sharedCart, lookupToken } = loaderData;

    return (
        <div className="max-w-screen-lg mx-auto px-4 py-8 space-y-8">
            <SeoMeta title="Test Custom Page" />

            {/* Breadcrumb */}
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link to="/">Home</Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>Test Custom Page</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            {/* Header */}
            <div className="space-y-2">
                <Typography variant="h2">Share Cart — Custom SCAPI Test</Typography>
                <p className="text-muted-foreground">
                    End-to-end test page for the <strong>share-cart</strong> custom SCAPI endpoints.
                    The cartridge must be deployed and{' '}
                    <code className="bg-muted px-1 rounded text-xs">ver_sharecart</code> must be active in Business Manager.
                </p>
            </div>

            {/* Endpoint panels */}
            <div className="grid grid-cols-1 gap-6">
                <CreateSharePanel />
                <LookupSharePanel initialToken={lookupToken} />

                {/* Show streamed result when ?token= is present on initial load */}
                {sharedCart && lookupToken && (
                    <LoaderSharedCartView sharedCart={sharedCart} token={lookupToken} />
                )}
            </div>

            {/* API reference */}
            <section className="rounded-lg border border-border p-6 space-y-3">
                <Typography variant="h4">API Reference</Typography>
                <div className="space-y-2 text-sm font-mono">
                    <div className="flex gap-3 items-start">
                        <span className="shrink-0 px-1.5 py-0.5 rounded bg-brand-primary text-white text-xs">POST</span>
                        <span className="text-muted-foreground break-all">
                            kv7kzm78.api.commercecloud.salesforce.com/custom/share-cart/v1/organizations/f_ecom_zzkc_009/baskets/&#123;basketId&#125;/share?siteId=RefArch
                        </span>
                    </div>
                    <div className="flex gap-3 items-start">
                        <span className="shrink-0 px-1.5 py-0.5 rounded bg-active-bg text-active-foreground text-xs">GET</span>
                        <span className="text-muted-foreground break-all">
                            kv7kzm78.api.commercecloud.salesforce.com/custom/share-cart/v1/organizations/f_ecom_zzkc_009/share/&#123;shareToken&#125;?siteId=RefArch
                        </span>
                    </div>
                </div>
            </section>
        </div>
    );
}
