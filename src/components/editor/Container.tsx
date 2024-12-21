'use client'
import { useNode } from "@craftjs/core";
import React from "react";

export const Container = ({ background, padding = 0, children }: any) => {
    const { connectors: { connect, drag } }: any = useNode();

    return (
        <div ref={ref => connect(drag(ref))} style={{ margin: "5px 0", background, padding: `${padding}px` }}>
            {children}
        </div>
    )
}
