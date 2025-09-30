import { Button, IconButton } from '@mui/joy';
import { SimpleEditor } from '@tailus-ui/components/tiptap-templates/simple/simple-editor';
import { Trash } from 'lucide-react';
import React, { useRef, useState } from 'react';

interface PageProps {
    editorState: any[];
    setEditorState: React.Dispatch<React.SetStateAction<any[]>>;
    index: number;
}

const TextSection = ({ editorState, index, setEditorState }: PageProps) => {
    const [isEditing, setIsEditing] = useState<boolean>(editorState[index].editing);
    const editorRef = useRef<any>(null);

    const handleCancel = () => {
        setEditorState(prev => {
            const updated = [...prev];
            updated[index] = { ...prev[index], editing: false }; // ✅ replace object
            return updated;
        });
        setIsEditing(false);
    };

    const handleSave = () => {
        setEditorState(prev => {
            const updated = [...prev];
            const id = prev[index].id;
            updated[index] = {
                id,
                type: 'text',
                content: editorRef.current.getJSON(),
                html: editorRef.current.getHTML(),
                editing: false,
            };
            return updated;
        });
        setIsEditing(false);
    };

    const handleEdit = () => {
        setEditorState(prev => {
            const updated = [...prev];
            updated[index] = { ...prev[index], editing: true }; // ✅ replace object
            return updated;
        });
        setIsEditing(true);
    };

    return (
        <div className="flex flex-col w-full overflow-hidden items-center">
            {isEditing ? (
                <div className="tiptap-editor max-w-[788px] border justify-center max-h-[300px] overflow-x-hidden overflow-y-hidden flex mb-5">
                    <SimpleEditor ref={editorRef} initialContent={editorState[index].content} />
                </div>
            ) : (
                <div className="max-w-[788px] relative  w-full">
                    <div className='absolute right-0'>
                        <IconButton onClick={() => {
                            let clone = [...editorState]
                            clone.splice(index, 1)
                            setEditorState(clone)
                        }} size='sm' color='danger' variant='plain'>
                            <Trash size={16} />
                        </IconButton>
                    </div>
                    <div className=" p-2 border w-full">
                        <div className="w-full" dangerouslySetInnerHTML={{ __html: editorState[index].html }} />
                    </div>
                </div>

            )}

            {isEditing ? (
                <div className="flex w-full justify-end max-w-[788px] gap-3">
                    <Button size="sm" onClick={handleCancel} variant="plain" color="danger">
                        Cancel
                    </Button>
                    <Button size="sm" variant="outlined" color="neutral" onClick={handleSave}>
                        Save Changes
                    </Button>
                </div>
            ) : (
                <div className="flex w-full max-w-[788px] justify-end gap-3 mt-2">
                    <Button size="sm" onClick={handleEdit} variant="outlined" color="warning">
                        Edit
                    </Button>
                </div>
            )}
        </div>
    );
};

export default TextSection;
