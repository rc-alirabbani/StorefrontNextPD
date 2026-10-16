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
import { useState, useEffect, useCallback, useRef } from 'react';
import { useConfig } from '@salesforce/storefront-next-runtime/config';
import type { AppConfig } from '@/types/config';

export interface GooglePayBillingAddress {
    firstName: string;
    lastName: string;
    address1: string;
    address2: string;
    city: string;
    stateCode: string;
    postalCode: string;
    countryCode: string;
    phone?: string;
}

export interface GooglePayResult {
    token: string;
    billingAddress: GooglePayBillingAddress;
}

interface UseGooglePayOptions {
    amount: string;
    currency: string;
}

interface UseGooglePayReturn {
    isReady: boolean;
    startPayment: (opts: UseGooglePayOptions) => Promise<GooglePayResult | null>;
}

const GOOGLE_PAY_SCRIPT_ID = 'google-pay-script';
const ALLOWED_CARD_NETWORKS = ['AMEX', 'DISCOVER', 'JCB', 'MASTERCARD', 'VISA'];
const ALLOWED_AUTH_METHODS = ['PAN_ONLY', 'CRYPTOGRAM_3DS'];

function loadGooglePayScript(): Promise<void> {
    return new Promise((resolve, reject) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((window as any).google?.payments?.api?.PaymentsClient) {
            resolve();
            return;
        }
        const existing = document.getElementById(GOOGLE_PAY_SCRIPT_ID) as HTMLScriptElement | null;
        if (existing) {
            // Tag exists but script hasn't finished executing yet — wait for it
            existing.addEventListener('load', () => resolve(), { once: true });
            existing.addEventListener('error', () => reject(new Error('Failed to load Google Pay script')), { once: true });
            return;
        }
        const script = document.createElement('script');
        script.id = GOOGLE_PAY_SCRIPT_ID;
        script.src = 'https://pay.google.com/gp/p/js/pay.js';
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load Google Pay script'));
        document.head.appendChild(script);
    });
}

/**
 * Hook that integrates with the Google Pay JS API.
 *
 * Loads the Google Pay script, checks device readiness, and exposes `startPayment`
 * which opens the Google Pay sheet and returns the gateway token + billing address.
 * Returns `isReady: false` on unsupported browsers/devices (e.g. Firefox on desktop)
 * so callers can hide the button entirely.
 *
 * Configure via env vars:
 *   PUBLIC__app__features__googlePay__merchantId
 *   PUBLIC__app__features__googlePay__merchantName
 *   PUBLIC__app__features__googlePay__gatewayId
 *   PUBLIC__app__features__googlePay__gatewayMerchantId
 *   PUBLIC__app__features__googlePay__environment
 */
export function useGooglePay(): UseGooglePayReturn {
    const config = useConfig<AppConfig>();
    const gpConfig = config.features.googlePay;
    const [isReady, setIsReady] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const clientRef = useRef<any>(null);

    useEffect(() => {
        if (!gpConfig.merchantId || !gpConfig.gatewayId || !gpConfig.gatewayMerchantId) {
            return;
        }

        let cancelled = false;

        loadGooglePayScript()
            .then(() => {
                if (cancelled) return;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const google = (window as any).google;
                if (!google?.payments?.api?.PaymentsClient) return;

                const client = new google.payments.api.PaymentsClient({
                    environment: gpConfig.environment ?? 'TEST',
                });
                clientRef.current = client;

                return client.isReadyToPay({
                    apiVersion: 2,
                    apiVersionMinor: 0,
                    allowedPaymentMethods: [
                        {
                            type: 'CARD',
                            parameters: {
                                allowedAuthMethods: ALLOWED_AUTH_METHODS,
                                allowedCardNetworks: ALLOWED_CARD_NETWORKS,
                                billingAddressRequired: true,
                                billingAddressParameters: { format: 'FULL', phoneNumberRequired: false },
                            },
                        },
                    ],
                });
            })
            .then((response) => {
                if (cancelled) return;
                if (response?.result === true) {
                    setIsReady(true);
                }
            })
            .catch(() => {
                // Google Pay not available — button stays hidden
            });

        return () => {
            cancelled = true;
        };
    }, [gpConfig.merchantId, gpConfig.gatewayId, gpConfig.gatewayMerchantId, gpConfig.environment]);

    const startPayment = useCallback(
        async ({ amount, currency }: UseGooglePayOptions): Promise<GooglePayResult | null> => {
            if (!clientRef.current) return null;

            try {
                const paymentDataRequest = {
                    apiVersion: 2,
                    apiVersionMinor: 0,
                    allowedPaymentMethods: [
                        {
                            type: 'CARD',
                            parameters: {
                                allowedAuthMethods: ALLOWED_AUTH_METHODS,
                                allowedCardNetworks: ALLOWED_CARD_NETWORKS,
                                billingAddressRequired: true,
                                billingAddressParameters: { format: 'FULL', phoneNumberRequired: false },
                            },
                            tokenizationSpecification: {
                                type: 'PAYMENT_GATEWAY',
                                parameters: {
                                    gateway: gpConfig.gatewayId,
                                    gatewayMerchantId: gpConfig.gatewayMerchantId,
                                },
                            },
                        },
                    ],
                    merchantInfo: {
                        merchantId: gpConfig.merchantId,
                        merchantName: gpConfig.merchantName,
                    },
                    transactionInfo: {
                        totalPriceStatus: 'FINAL',
                        totalPrice: amount,
                        currencyCode: currency,
                    },
                };

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const paymentData: any = await clientRef.current.loadPaymentData(paymentDataRequest);

                const token: string = paymentData?.paymentMethodData?.tokenizationData?.token ?? '';
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const gpAddress: any = paymentData?.paymentMethodData?.info?.billingAddress ?? {};

                const billingAddress: GooglePayBillingAddress = {
                    firstName: gpAddress.name?.split(' ')[0] ?? '',
                    lastName: gpAddress.name?.split(' ').slice(1).join(' ') ?? '',
                    address1: gpAddress.address1 ?? '',
                    address2: gpAddress.address2 ?? '',
                    city: gpAddress.locality ?? '',
                    stateCode: gpAddress.administrativeArea ?? '',
                    postalCode: gpAddress.postalCode ?? '',
                    countryCode: gpAddress.countryCode ?? 'US',
                    phone: gpAddress.phoneNumber,
                };

                return { token, billingAddress };
            } catch {
                // User dismissed the sheet or payment failed — treat as no-op
                return null;
            }
        },
        [gpConfig.gatewayId, gpConfig.gatewayMerchantId, gpConfig.merchantId, gpConfig.merchantName]
    );

    return { isReady, startPayment };
}
