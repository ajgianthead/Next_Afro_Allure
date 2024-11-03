'use client'
import { getTemplate } from '@utils/template_selector'
import { useParams } from 'next/navigation'
import React from 'react'

export default function page() {
    const template_id = useParams().template_id
    return (
        <div>
            {getTemplate(template_id, {})}
        </div>
    )
}
