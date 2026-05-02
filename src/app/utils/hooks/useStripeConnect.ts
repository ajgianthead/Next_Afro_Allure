import { useState, useEffect } from "react";
import { loadConnectAndInitialize, StripeConnectInstance } from "@stripe/connect-js";
import '@fontsource/geist-sans';
import { createAccountSessionAction } from '@/features/stripe/actions';

export const useStripeConnect = (connectedAccountId: string) => {
    const [stripeConnectInstance, setStripeConnectInstance] = useState<StripeConnectInstance>();

    useEffect(() => {
        if (connectedAccountId) {
            const fetchClientSecret = async () => {
                const clientSecret = await createAccountSessionAction(connectedAccountId)
                return clientSecret!
            };

            setStripeConnectInstance(
                loadConnectAndInitialize({
                    publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
                    fetchClientSecret,
                    fonts: [
                        {
                            src: `url(https://cdn.jsdelivr.net/fontsource/fonts/geist-sans@latest/latin-400-normal.woff)`,
                            family: "Geist Sans"
                        }
                    ],
                    appearance: {
                        overlays: "dialog",
                        variables: {
                            colorPrimary: "#635BFF",
                            fontFamily: "Geist Sans",

                        },
                    },
                })
            );
        }
    }, [connectedAccountId]);

    return stripeConnectInstance;
};

export default useStripeConnect;
