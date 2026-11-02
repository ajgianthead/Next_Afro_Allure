'use client'

import { Render, type Data } from '@puckeditor/core'
import { renderConfig } from '../config'
import type { BuilderMetadata } from './context'

/** A published builder page on the live site. */
export function BuilderPage({ page, metadata }: { page: unknown; metadata: BuilderMetadata }) {
    return <Render config={renderConfig} data={page as Data} metadata={metadata as unknown as Record<string, unknown>} />
}
