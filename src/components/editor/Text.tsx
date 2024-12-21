'use client'
import { Text as AAText } from "@tailus-ui/typography";
import React from "react";
import { useNode } from "@craftjs/core";

export const Text = ({ text, fontSize }: any) => {
    const { connectors: { connect, drag } }: any = useNode();
    return (
        <div ref={ref => connect(drag(ref))}>
            <AAText style={{ fontSize }}>{text}</AAText>
        </div>
    )
}
