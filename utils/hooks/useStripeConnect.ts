import { useState, useEffect } from "react";
import { loadConnectAndInitialize, StripeConnectInstance } from "@stripe/connect-js";
import '@fontsource/geist-sans';

export const useStripeConnect = (connectedAccountId: string) => {
    const [stripeConnectInstance, setStripeConnectInstance] = useState<StripeConnectInstance>();

    useEffect(() => {
        if (connectedAccountId) {
            const fetchClientSecret = async () => {
                const response = await fetch("http://127.0.0.1:3000/api/account_session", {
                    method: "POST",
                    body: JSON.stringify({
                        account: connectedAccountId,
                    }),
                });
                if (!response.ok) {
                    // Handle errors on the client side here
                    const { error } = await response.json();
                    throw new Error("An error occurred: ", error);
                } else {
                    const val = await response.json();
                    return val.clientSecret;
                }
            };

            setStripeConnectInstance(
                loadConnectAndInitialize({
                    publishableKey: process.env.NODE_ENV === 'development' ? process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY! : process.env.NEXT_PUBLIC_STRIPE_LIVE_PUBLISHABLE_KEY!,
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
