'use client'
import { useNode } from "@craftjs/core";
import { default as TailusButton } from "@tailus-ui/Button";
import React from "react";

export const Button = ({ size, variant, color, children }: any) => {
    const { connectors: { connect, drag } }: any = useNode();
    return (
        <TailusButton.Root ref={ref => connect(drag(ref))} size={size} variant={variant} color={color}>
            <TailusButton.Label>
                {children}
            </TailusButton.Label>
        </TailusButton.Root>
    )
}
