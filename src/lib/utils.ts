import { twMerge } from "tailwind-merge";
import React from "react";
export function cloneElement(element: React.ReactElement, classNames: string) {
    return React.cloneElement(element, {
        className: twMerge(element.props.className, classNames)
    });
}

/**
 * Clone React element.
 * The function clones React element and adds Tailwind CSS classnames to the cloned element
 * @param element the React element to clone
 * @param classNames Tailwind CSS classnames
 * @returns { React.ReactElement } - Cloned React element
 */

import { Settings } from "luxon";
import Stripe from "stripe";

Settings.defaultZone = 'system'


// export const stripe = new Stripe(process.env.NODE_ENV === 'development' ? process.env.STRIPE_SECRET_KEY! : process.env.STRIPE_SECRET_LIVE_KEY!, {
//     apiVersion: '2025-06-30.basil',
// });

export const stripe = new Stripe(process.env.NODE_ENV === 'development' ? process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY! : process.env.NEXT_PUBLIC_STRIPE_SECRET_LIVE_KEY!, {
    apiVersion: '2025-06-30.basil',
});

