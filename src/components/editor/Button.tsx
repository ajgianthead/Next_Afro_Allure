'use client'
import { useNode } from "@craftjs/core";
import React from "react";
import { default as MUIButton } from '@mui/joy/Button';

export const EditableButton = ({ size, variant, color, text }: any) => {
    const { connectors: { connect, drag } }: any = useNode();
    return (
        <div>
            <Button ref={(ref: any) => connect(drag(ref))} size={size} variant={variant} color={color} text={text} />
        </div>
    )
}

export const Button = ({ size, variant, color, text }: any) => {
    return (
        <MUIButton size={size} variant={variant} color={color}>
            {text}
        </MUIButton>
    )
}
