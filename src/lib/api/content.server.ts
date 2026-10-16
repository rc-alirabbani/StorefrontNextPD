import { type LoaderFunctionArgs } from 'react-router';
import type { ShopperContent } from '@salesforce/storefront-next-runtime/scapi';
import { createApiClients } from '@/lib/api-clients.server';

export const fetchContentAsset = async (
    context: LoaderFunctionArgs['context'],
    contentId: string
): Promise<ShopperContent.schemas['Content']> => {
    const clients = createApiClients(context);
    const result = await clients.shopperContent.getContent({
        params: {
            path: { contentId },
        },
    });
    return result.data;
};
