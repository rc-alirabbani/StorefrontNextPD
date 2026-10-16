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
import { Link } from '@/components/link';
import { CarouselItem } from '@/components/ui/carousel';
import { CarouselSection } from '@/components/carousel-section';
import { useRecentlyViewedStore } from '@/store/recently-viewed';

function RecentlyViewedCard({
    productId,
    productName,
    imageUrl,
    price,
    currency,
}: {
    productId: string;
    productName: string;
    imageUrl?: string;
    price?: number;
    currency?: string;
}) {
    const formattedPrice =
        price !== undefined
            ? new Intl.NumberFormat(undefined, { style: 'currency', currency: currency ?? 'USD' }).format(price)
            : null;

    return (
        <Link to={`/product/${productId}`} className="group flex flex-col w-full h-full">
            <div className="aspect-[4/5] w-full overflow-hidden bg-muted">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={productName}
                        className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
                    />
                ) : (
                    <div className="h-full w-full bg-secondary" />
                )}
            </div>
            <div className="mt-2 flex flex-col gap-0.5 px-1">
                <p className="text-sm font-medium text-foreground line-clamp-2 leading-snug">{productName}</p>
                {formattedPrice && <p className="text-sm font-semibold text-primary">{formattedPrice}</p>}
            </div>
        </Link>
    );
}

export default function RecentlyViewedProducts() {
    const items = useRecentlyViewedStore((s) => s.items);

    if (items.length === 0) return null;

    return (
        <CarouselSection title="Recently Viewed Of Centralized Store">
            {items.map((item) => (
                <CarouselItem key={item.productId} className="w-[180px] md:w-[200px] basis-auto py-1 flex">
                    <div className="w-full max-w-full min-w-0 flex">
                        <RecentlyViewedCard {...item} />
                    </div>
                </CarouselItem>
            ))}
        </CarouselSection>
    );
}
