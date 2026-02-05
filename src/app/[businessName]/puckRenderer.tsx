"use client";

import React from "react";
import { Render } from "@puckeditor/core";
import { config } from "./edit/constants";
import { buildGoogleFontsUrl, extractFontsFromPuckData, normalizeFont } from "../../lib/extractFonts";

interface PuckRendererProps {
    editorData: any;
}

export const PuckRenderer: React.FC<PuckRendererProps> = ({ editorData }) => {
    return <Render config={config} data={editorData} />;
};
