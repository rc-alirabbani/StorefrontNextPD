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
import { ShoppingBag, Heart, MapPin, Eye } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from 'react-i18next';

/**
 * Individual stat displayed inside the card
 */
interface AccountStat {
    icon: React.ElementType;
    labelKey: string;
    value: number;
}

/**
 * Props for AccountStatsCard
 */
export interface AccountStatsCardProps {
    /** Total number of orders placed by the customer */
    totalOrders?: number;
    /** Number of items saved to the wishlist */
    wishlistCount?: number;
    /** Number of saved addresses */
    addressCount?: number;
    /** Number of products viewed this session (from Zustand recently-viewed store) */
    recentlyViewedCount?: number;
}

/**
 * Displays a summary row of key account stats: total orders, wishlist items,
 * saved addresses, and recently viewed products.
 */
export function AccountStatsCard({
    totalOrders = 0,
    wishlistCount = 0,
    addressCount = 0,
    recentlyViewedCount = 0,
}: AccountStatsCardProps): ReactElement {
    const { t } = useTranslation('account');

    const stats: AccountStat[] = [
        { icon: ShoppingBag, labelKey: 'statsCard.totalOrders', value: totalOrders },
        { icon: Heart, labelKey: 'statsCard.wishlistItems', value: wishlistCount },
        { icon: MapPin, labelKey: 'statsCard.savedAddresses', value: addressCount },
        { icon: Eye, labelKey: 'statsCard.recentlyViewed', value: recentlyViewedCount },
    ];

    return (
        <Card className="py-0 rounded-none shadow-none">
            <CardContent className="p-6">
                <h2 className="text-[length:var(--account-section-header)] font-semibold text-foreground mb-4">
                    {t('statsCard.title')}
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 divide-x-0 sm:divide-x divide-border">
                    {stats.map(({ icon: Icon, labelKey, value }) => (
                        <div key={labelKey} className="flex flex-col items-center gap-2 p-4 first:pl-0 last:pr-0">
                            <Icon className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                            <span className="text-2xl font-bold text-foreground tabular-nums">{value}</span>
                            <span className="text-xs text-muted-foreground text-center leading-tight">
                                {t(labelKey)}
                            </span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

/**
 * Loading skeleton for AccountStatsCard
 */
export function AccountStatsCardSkeleton(): ReactElement {
    return (
        <Card className="py-0 rounded-none shadow-none">
            <CardContent className="p-6">
                <Skeleton className="h-6 w-40 mb-4" />
                <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 divide-x-0 sm:divide-x divide-border">
                    {[0, 1, 2, 3].map((i) => (
                        <div key={i} className="flex flex-col items-center gap-2 p-4 first:pl-0 last:pr-0">
                            <Skeleton className="h-5 w-5 rounded-sm" />
                            <Skeleton className="h-8 w-10" />
                            <Skeleton className="h-3 w-16" />
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

export default AccountStatsCard;
