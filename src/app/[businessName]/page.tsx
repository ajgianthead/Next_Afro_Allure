
import React from 'react'
import lz from "lzutf8";
import Image from 'next/image';

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

    const getBusinessData = async (businessName: string) => {
        try {
            const result = await fetch(`http://127.0.0.1:3000/api/businessUsers/${businessName}`, {
                method: 'GET',

            });
            if (result.status === 401 || result.status === 400) {
                const res = await result.json();
                console.log(`Something went wrong: ${res.result}`);
                return null;
            }
            const data = await result.json();
            return data;
        } catch (error: any) {
            console.error(`Error: ${error.message}`);
            return null;
        }
    }

    const { businessName } = params;
    const result = await getBusinessData(businessName);

    // Decompress and parse editor data
    const json = lz.decompress(lz.decodeBase64(result.editor_data));
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
