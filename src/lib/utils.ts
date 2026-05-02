import { twMerge } from "tailwind-merge";
import React from "react";
import { Settings } from "luxon";
import { clsx, type ClassValue } from "clsx"

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



Settings.defaultZone = 'system'


export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}
