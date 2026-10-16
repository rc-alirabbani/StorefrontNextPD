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
import { data } from 'react-router';
import type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router';
import { createApiClients } from '@/lib/api-clients.server';
import { getBasket } from '@/middlewares/basket.server';

/**
 * POST /resource/share-cart
 * Creates a share token for the current basket and returns the share URL.
 */
export async function action({ context }: ActionFunctionArgs) {
    const clients = createApiClients(context);
    const basketResource = await getBasket(context);
    const basket = basketResource.current;

    if (!basket?.basketId) {
        return data({ error: 'No active basket' }, { status: 400 });
    }

    try {
        const { data: shareData } = await clients.shareCart.createShareToken({
            params: {
                path: { basketId: basket.basketId },
            },
        });

        return data({
            shareUrl:   shareData.shareUrl,
            shareToken: shareData.shareToken,
            expiresAt:  shareData.expiresAt,
        });
    } catch {
        return data({ error: 'Failed to create share link' }, { status: 500 });
    }
}

/**
 * GET /resource/share-cart?token=<shareToken>
 * Returns basket contents for a given share token (used when a recipient opens the link).
 */
export async function loader({ request, context }: LoaderFunctionArgs) {
    const url        = new URL(request.url);
    const shareToken = url.searchParams.get('token');

    if (!shareToken) {
        return data({ error: 'Missing token parameter' }, { status: 400 });
    }

    const clients = createApiClients(context);

    try {
        const { data: sharedCart } = await clients.shareCart.getSharedCart({
            params: {
                path: { shareToken },
            },
        });

        return data(sharedCart);
    } catch (err) {
        const status = (err as { status?: number }).status ?? 500;
        return data({ error: 'Share link not found or expired' }, { status });
    }
}
