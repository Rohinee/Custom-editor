import React, {  useState } from 'react';
import { EditorState, Modifier, SelectionState, RichUtils, convertFromRaw, convertToRaw, ContentState } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import './EditorComponent.css';
const EditorComponent: React.FC = () => {
    // Define custom inline style for red color
    const styleMap = {
        'RED_COLOR': {
            color: 'red',
        },
        'UNDERLINE': {
            'text-decoration': 'underline'
        },
    };

    const [editorState, setEditorState] = useState<EditorState>(() => {
        const storedEditorData = localStorage.getItem('EditorData');
        if (storedEditorData) {
            const contentState = convertFromRaw(JSON.parse(storedEditorData));
            return EditorState.createWithContent(contentState);
        }
        return EditorState.createEmpty();
    });

    const onEditorStateChange = (newEditorState: EditorState) => {
        const contentState = newEditorState.getCurrentContent();
        const selectionState = newEditorState.getSelection();
        const currentBlockKey = selectionState.getStartKey();
        const currentContentBlock = contentState.getBlockForKey(currentBlockKey);
        const currentText = currentContentBlock.getText();

        // Check if the current block is a normal unstyled block
        if (currentContentBlock.getType() === 'unstyled') {
            // Find the index of the start and end of the current line
            const currentLineStart = currentText.lastIndexOf('\n', selectionState.getStartOffset()) + 1;
            const currentLineEnd = currentText.indexOf('\n', selectionState.getStartOffset());
            const currentLineEndOffset = currentLineEnd === -1 ? currentText.length : currentLineEnd;
            // Create selection for the current line
            const currentLineSelection = SelectionState.createEmpty(currentBlockKey).merge({
                anchorOffset: currentLineStart,
                focusOffset: currentLineEndOffset
            });
            // Apply bold style if the current line contains "**"
            if (currentText.startsWith('* ')) {
                newEditorState = formatEditor(contentState, currentLineSelection, 'BOLD', 'change-inline-style', newEditorState)
            }
            if (currentText.startsWith('** ')) {
                newEditorState = formatEditor(contentState, currentLineSelection, 'RED_COLOR', 'change-inline-style', newEditorState)
            }
            if (currentText.startsWith('# ')) {
                const newContentState = Modifier.setBlockType(
                    contentState,
                    currentLineSelection,
                    'header-one'
                );
                newEditorState = EditorState.push(
                    newEditorState,
                    newContentState,
                    'change-block-type'
                );
                newEditorState = RichUtils.toggleBlockType(editorState, 'header-one');
            }

            if (currentText.startsWith('*** ')) {

                newEditorState = formatEditor(contentState, currentLineSelection, 'UNDERLINE', 'change-inline-style', newEditorState)
            }
        }
        setEditorState(newEditorState);
    };

    const formatEditor = (contentState: ContentState, currentLineSelection: SelectionState, formatData: string, style: any, newEditorState: EditorState) => {
        const newContentState = Modifier.applyInlineStyle(
            contentState,
            currentLineSelection,
            formatData
        );
        return EditorState.push(
            newEditorState,
            newContentState,
            style
        );

    }

    const saveEditorData = () => {
        const contentState = editorState.getCurrentContent();
        const rawContentState = convertToRaw(contentState);
        localStorage.setItem('EditorData', JSON.stringify(rawContentState));
    }

    return (
        <div>
            <div className='header-container'>
                <div className='subHeader1'>
                    <h2>Demo Editor by Rohinee</h2>
                    </div>
                <div className='subHeader2'> 
                 <button className='btn-css' onClick={saveEditorData}>Save</button></div>
            </div>
            <div style={{ width: '94%', height: '300px', marginTop: '30px', marginLeft: '30px', border: '1px solid lightgray' }}>
                <Editor
                    editorState={editorState}
                    onEditorStateChange={onEditorStateChange}
                    customStyleMap={styleMap}
                />
            </div>
        </div>
    )
}

export default EditorComponent
