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
import { describe, test, expect, vi, beforeEach } from 'vitest';
import type { LoaderFunctionArgs } from 'react-router';
import { loader } from './_app.page.$pageId';
import { fetchStorefrontPage } from '@/lib/util/pageLoader.server';
import { createTestContext } from '@/lib/test-utils';

vi.mock('@/lib/util/pageLoader.server', () => ({
    fetchStorefrontPage: vi.fn(),
    STOREFRONT_PAGE_TYPE_IDS: ['storefrontPage'],
}));

describe('_app.page.$pageId loader', () => {
    let mockContext: ReturnType<typeof createTestContext>;
    let baseLoaderArgs: LoaderFunctionArgs;

    beforeEach(() => {
        vi.clearAllMocks();
        mockContext = createTestContext();
        baseLoaderArgs = {
            request: new Request('http://localhost/StoreforntNextPD/default/page/test'),
            params: { pageId: 'test' },
            context: mockContext,
            unstable_pattern: '/page/:pageId',
        };
    });

    test('returns page promise for URL pageId segment', async () => {
        const mockPage = { id: 'test', name: 'Test Page', regions: [], componentData: {} };
        vi.mocked(fetchStorefrontPage).mockResolvedValueOnce(mockPage);

        const result = loader(baseLoaderArgs);

        expect(fetchStorefrontPage).toHaveBeenCalledWith(baseLoaderArgs, 'test');
        expect(await result.page).toBe(mockPage);
        expect(result.pageUrl).toBe('http://localhost/StoreforntNextPD/default/page/test');
    });

    test('returns null page when pageId param is missing', async () => {
        const result = await loader({ ...baseLoaderArgs, params: {} });

        expect(result.page).toBeNull();
        expect(fetchStorefrontPage).not.toHaveBeenCalled();
    });
});
