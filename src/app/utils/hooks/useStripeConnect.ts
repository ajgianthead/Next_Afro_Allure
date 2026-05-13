import { useState, useEffect } from "react";
import { loadConnectAndInitialize, StripeConnectInstance } from "@stripe/connect-js";
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
                            cssSrc: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap",
                        },
                    ],
                    appearance: {
                        overlays: "dialog",
                        variables: {
                            colorPrimary: "#C9974A",
                            colorText: "#1A1818",
                            colorSecondaryText: "#6F6863",
                            colorBackground: "#FFFFFF",
                            colorBorder: "#E8E2D6",
                            borderRadius: "10px",
                            fontFamily: "Inter, sans-serif",
                            colorDanger: "#FC6161",
                        },
                    },
                })
            );
        }
    }, [connectedAccountId]);

    return stripeConnectInstance;
};

export default useStripeConnect;
