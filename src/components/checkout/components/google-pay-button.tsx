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
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { useBasket } from '@/providers/basket';
import { useGooglePay, type GooglePayBillingAddress } from '@/hooks/use-google-pay';
import GooglePayLogo from './google-pay-logo';

interface GooglePayButtonProps {
    disabled?: boolean;
    className?: string;
    onPaymentComplete?: (token: string, billingAddress: GooglePayBillingAddress) => void;
}

/**
 * Google Pay express checkout button.
 *
 * Renders only when the Google Pay JS API confirms the current device/browser supports it.
 * On click, opens the native Google Pay payment sheet. On success, calls `onPaymentComplete`
 * with the gateway token and billing address returned by Google.
 *
 * Requires the following env vars (see .env.default):
 *   PUBLIC__app__features__googlePay__merchantId
 *   PUBLIC__app__features__googlePay__merchantName
 *   PUBLIC__app__features__googlePay__gatewayId
 *   PUBLIC__app__features__googlePay__gatewayMerchantId
 *   PUBLIC__app__features__googlePay__environment
 */
export default function GooglePayButton({ disabled = false, className, onPaymentComplete }: GooglePayButtonProps) {
    const { t } = useTranslation('checkout');
    const { isReady, startPayment } = useGooglePay();
    const basket = useBasket();
    const [isPending, setIsPending] = useState(false);

    if (!isReady) return null;

    const amount = (basket?.orderTotal ?? 0).toFixed(2);
    const currency = basket?.currency ?? 'USD';

    const handleClick = async () => {
        if (disabled || isPending) return;
        setIsPending(true);
        try {
            const result = await startPayment({ amount, currency });
            if (result) {
                onPaymentComplete?.(result.token, result.billingAddress);
            }
        } finally {
            setIsPending(false);
        }
    };

    return (
        <Button
            onClick={handleClick}
            disabled={disabled || isPending}
            className={`w-full h-9 bg-foreground hover:bg-foreground/90 text-background border-0 flex items-center justify-center transition-colors${className ? ` ${className}` : ''}`}
            aria-label={t('expressPayments.googlePayLabel')}>
            <GooglePayLogo className="flex-shrink-0" inverted decorative />
        </Button>
    );
}
