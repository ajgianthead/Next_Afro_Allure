import { twMerge } from "tailwind-merge";
import React from "react";

/**
 * Clone React element.
 * The function clones React element and adds Tailwind CSS classnames to the cloned element
 * @param element the React element to clone
 * @param classNames Tailwind CSS classnames
 * @returns { React.ReactElement } - Cloned React element
 */

import { loadStripe } from '@stripe/stripe-js';

export function cloneElement(element: React.ReactElement, classNames: string) {
    return React.cloneElement(element, {
        className: twMerge(element.props.className, classNames)
    });
}
export const stripe = require('stripe')(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY, {
    apiVersion: "2023-10-16",
});
