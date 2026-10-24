'use client'

import type { TemplateId } from '../themes'
import { SiteProvider, type TemplateProps } from './context'
import { AtelierClair } from './AtelierClair'
import { CoilCrown } from './CoilCrown'
import { FadeHouse } from './FadeHouse'
import { MaisonTresse } from './MaisonTresse'
import { Quickstart } from './Quickstart'
import { RougeMaison } from './RougeMaison'

const TEMPLATE_COMPONENTS: Record<TemplateId, () => React.JSX.Element> = {
    'maison-tresse': MaisonTresse,
    'fade-house': FadeHouse,
    'atelier-clair': AtelierClair,
    'rouge-maison': RougeMaison,
    'coil-crown': CoilCrown,
    quickstart: Quickstart,
}

/** Renders a business's template site: the live page, the builder preview and the template cards. */
export function SiteRenderer(props: TemplateProps) {
    const Template = TEMPLATE_COMPONENTS[props.site.templateId] ?? Quickstart
    return (
        <SiteProvider {...props}>
            <Template />
        </SiteProvider>
    )
}

export type { TemplateProps }
