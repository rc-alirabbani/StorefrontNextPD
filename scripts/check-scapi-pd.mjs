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
import https from 'node:https';
import { readFileSync } from 'node:fs';

const env = Object.fromEntries(
    readFileSync('.env', 'utf8')
        .split(/\r?\n/)
        .filter((line) => line && !line.startsWith('#') && line.includes('='))
        .map((line) => {
            const index = line.indexOf('=');
            return [line.slice(0, index), line.slice(index + 1)];
        })
);

const clientId = env.PUBLIC__app__commerce__api__clientId;
const secret = env.COMMERCE_API_SLAS_SECRET;
const org = env.PUBLIC__app__commerce__api__organizationId;
const shortCode = env.PUBLIC__app__commerce__api__shortCode;
const siteId = env.PUBLIC__app__defaultSiteId || env.SITE_ID || 'StoreforntNextPD';
const aspectPageId = process.argv[2] || 'test';
const host = `${shortCode}.api.commercecloud.salesforce.com`;

function request(options, body) {
    return new Promise((resolve, reject) => {
        const req = https.request({ ...options, hostname: host }, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                let parsed;
                try {
                    parsed = JSON.parse(data);
                } catch {
                    parsed = data;
                }
                resolve({ status: res.statusCode, data: parsed });
            });
        });
        req.on('error', reject);
        if (body) req.write(body);
        req.end();
    });
}

async function getGuestToken() {
    const body = new URLSearchParams({
        grant_type: 'client_credentials',
        channel_id: siteId,
    }).toString();
    const auth = `Basic ${Buffer.from(`${clientId}:${secret}`).toString('base64')}`;
    const response = await request(
        {
            path: `/shopper/auth/v1/organizations/${org}/oauth2/token`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization: auth,
                'Content-Length': Buffer.byteLength(body),
            },
        },
        body
    );
    if (response.status !== 200) {
        throw new Error(`SLAS token failed (${response.status}): ${JSON.stringify(response.data)}`);
    }
    return response.data.access_token;
}

async function getPage(token, pageId, aspectAttributes) {
    const query = new URLSearchParams({ siteId, locale: 'en-US' });
    if (aspectAttributes) {
        query.set('aspectAttributes', JSON.stringify(aspectAttributes));
    }
    return request({
        path: `/experience/shopper-experience/v1/organizations/${org}/pages/${pageId}?${query}`,
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
    });
}

const token = await getGuestToken();
const checks = [
    ['homepage', null],
    ['homePage', null],
    ['storefrontPage', { aspectType: 'page', pageId: aspectPageId }],
    ['storefrontPage', { pageId: aspectPageId }],
    // Direct lookup by page instance ID (works when the page has no required aspect)
    [aspectPageId, null],
    [aspectPageId, { aspectType: 'page', pageId: aspectPageId }],
    ['aboutus', null],
];

console.log(`Checking published Page Designer pages for site "${siteId}"...\n`);

let anyFound = false;
for (const [pageId, aspectAttributes] of checks) {
    const result = await getPage(token, pageId, aspectAttributes);
    const label = aspectAttributes ? `${pageId} + aspect ${JSON.stringify(aspectAttributes)}` : pageId;
    if (result.status === 200) {
        anyFound = true;
        const regions = (result.data.regions || [])
            .map((region) => `${region.id}:${(region.components || []).length}`)
            .join(', ');
        console.log(`✓ ${label} -> name="${result.data.name}" typeId=${result.data.typeId} regions=[${regions}]`);
        for (const region of result.data.regions || []) {
            for (const component of region.components || []) {
                console.log(`    component: ${component.typeId} (id=${component.id})`);
            }
        }
    } else {
        const detail = result.data?.detail || result.data?.message || JSON.stringify(result.data);
        console.log(`✗ ${label} -> ${result.status} ${String(detail).slice(0, 120)}`);
    }
}

console.log('');
if (!anyFound) {
    console.log('No published pages returned by SCAPI.');
    console.log('BM preview uses mode/pdToken (draft). Live storefront requires Publish (Online) on this site.');
    console.log(`For /page/${aspectPageId}: create type "Storefront Page", set Page ID to "${aspectPageId}", publish Online.`);
    process.exitCode = 1;
} else {
    console.log('At least one Page Designer page is visible to SCAPI.');
}
