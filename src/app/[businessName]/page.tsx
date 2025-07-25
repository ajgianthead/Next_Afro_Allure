
import React from 'react'
import lz from "lzutf8";
import Image from 'next/image';
import { fetchBusinessData } from './actions';
import { PostgrestError } from '@supabase/supabase-js';
import { getSectionImages } from 'app/dashboard/(other)/booking-site/actions';
import { Button } from '@mui/joy';

const Container: React.FC<any> = async ({ children, ...props }) => (
    <div style={{ ...props, display: 'flex', flexDirection: props.flexDirection }}>
        {children}
    </div>
);

const EditableButton: React.FC<any> = async ({ text, ...props }) => (
    <button style={{ ...props }}>
        {text}
    </button>
);

const EditableText: React.FC<any> = async ({ text, ...props }) => (
    <p style={{ ...props }}>
        {text}
    </p>
);
const Video: React.FC<any> = async ({ url, ...props }) => (
    <div style={{ ...props }}>
        <iframe src={url} className="w-full h-full" allowFullScreen loading="lazy" />
    </div>
)
const ImageContainer: React.FC<any> = async ({ url, ...props }) => (
    <div style={{ ...props }}>
        <Image src={url} style={{ ...props }} alt='image' />
    </div>
)
const Hyperlink: React.FC<any> = async ({ text, ...props }) => (
    <div style={{ ...props }}>
        <a>{text}</a>
    </div>
)

interface PageProps {
    params: {
        businessName: string;
    };
}

export default async function Page({ params }: PageProps) {
    const resolver = {
        "Container": Container,
        "EditableButton": EditableButton,
        "EditableText": EditableText,
        "ImageContainer": ImageContainer,
        "Video": Video,
        "Hyperlink": Hyperlink
    };

    const { businessName } = await params;
    const result = await fetchBusinessData(businessName);

    if (result instanceof PostgrestError) {
        return result
    }
    if (result.result.web_editors[0].type === 'SECTIONS') {
        const imageObjs = await getSectionImages(result.result.web_editors[0].id)
        return (
            <div className='flex items-center flex-col p-10'>
                {imageObjs?.map((imageObject, index) => {
                    return (
                        <Image src={imageObject.url!} alt='image-section' width={1366 / 2} height={768 / 2} />
                    )
                })}
                <a href={`${result.result.url_name}/book`}><Button className='my-10' >Book Now</Button></a>
            </div>
        )
    } else {
        const json = lz.decompress(lz.decodeBase64(result.result.web_editors[0].editor_data!));
        console.log("json");

        const parsedData = JSON.parse(json);

        // Extract nodes from ROOT
        const components = parsedData.ROOT.nodes;

        // Function to render nodes
        function renderNode(nodeId: string, nodes: Record<string, any>) {
            const node = nodes[nodeId];
            if (!node) return null;

            // Get the correct component using resolvedName
            const Component = resolver[node.type.resolvedName as keyof typeof resolver];

            if (!Component) return null;

            // Render the component with the necessary props
            return (
                <Component key={nodeId} {...node.props}>
                    {node.nodes && node.nodes.map((childNodeId: string) => renderNode(childNodeId, nodes))}
                </Component>
            );
        }

        // Render all components starting from ROOT node
        const nodes = parsedData; // The entire parsed JSON will contain all the nodes by their ID
        const renderedComponents = components.map((nodeId: string) => renderNode(nodeId, nodes));

        return (
            <div>
                {renderedComponents}
            </div>
        );
    }


    // Decompress and parse editor data

}
