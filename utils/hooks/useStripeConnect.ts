import { useState, useEffect } from "react";
import { loadConnectAndInitialize, StripeConnectInstance } from "@stripe/connect-js";

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
                    publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "",
                    fetchClientSecret,
                    appearance: {
                        overlays: "dialog",
                        variables: {
                            colorPrimary: "#635BFF",
                            fontFamily: "Geist, Inter, ui-sans-serif, system-ui, sans-serif, \"Apple Color Emoji\", \"Segoe UI Emoji\", \"Segoe UI Symbol\", \"Noto Color Emoji\"",

                        },
                    },
                })
            );
        }
    }, [connectedAccountId]);

    return stripeConnectInstance;
};

export default useStripeConnect;
