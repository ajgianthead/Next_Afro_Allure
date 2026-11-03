'use client'

import { useMemo } from 'react'
import { Render, type Data } from '@puckeditor/core'
import type { SiteData } from '@/features/siteBuilder/siteData'
import { renderConfig } from '../config'
import { templateToBuilder } from '../presets'
import type { BuilderMetadata } from './context'

/** A live builder page: a published page, or a template site shown as its template's starter page. */
export function BuilderPage({ page, site, metadata }: { page?: unknown; site?: SiteData; metadata: BuilderMetadata }) {
    const data = useMemo(() => (page ?? (site ? templateToBuilder(site, metadata.info) : { root: { props: {} }, content: [] })) as Data, [page, site, metadata.info])
    return <Render config={renderConfig} data={data} metadata={metadata as unknown as Record<string, unknown>} />
}
