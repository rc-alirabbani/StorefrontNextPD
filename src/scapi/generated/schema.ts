export interface paths {
    "/baskets/{basketId}/share": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Create a share token for the given basket */
        post: operations["createShareToken"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/share/{shareToken}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Retrieve basket contents by share token */
        get: operations["getSharedCart"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        ShareCartResponse: {
            /** @description Opaque token that identifies the shared basket */
            shareToken: string;
            /** @description Full shareable URL the shopper can copy */
            shareUrl: string;
            /**
             * Format: date-time
             * @description ISO-8601 expiry timestamp
             */
            expiresAt: string;
        };
        SharedBasket: {
            basketId: string;
            productItems: {
                productId?: string;
                productName?: string;
                quantity?: number;
                price?: number;
            }[];
        };
        ErrorResponse: {
            type: string;
            title: string;
            detail?: string;
        };
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    createShareToken: {
        parameters: {
            query: {
                siteId: string;
            };
            header?: never;
            path: {
                basketId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Share token created */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ShareCartResponse"];
                };
            };
            /** @description Basket not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    getSharedCart: {
        parameters: {
            query: {
                siteId: string;
            };
            header?: never;
            path: {
                shareToken: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Shared basket contents */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SharedBasket"];
                };
            };
            /** @description Token not found or expired */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Share token has expired */
            410: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
}
