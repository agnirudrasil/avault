import { Editor, Transforms } from "slate";
import { deserializeSyntaxTree } from "../../../../markdown/parsers/parseMessageContent";
import { deserialize } from "../deserialize";

export const withEmoji =
    (onImageUpload: (file: File) => any) => (editor: Editor) => {
        const { insertData, isInline, isVoid } = editor;

        editor.isInline = element =>
            (element as any).type === "emoji" ? true : isInline(element);

        editor.isVoid = element =>
            (element as any).type === "emoji" ? true : isVoid(element);

        editor.insertData = (data: DataTransfer) => {
            const text = data.getData("text/plain");
            const { files } = data;
            if (files && files.length > 0) {
                for (const file of files) {
                    onImageUpload(file);
                }
            } else {
                if (text) {
                    const tree = deserialize(deserializeSyntaxTree(text));
                    Transforms.insertFragment(editor, tree);
                    Transforms.move(editor);
                    return;
                } else {
                    insertData(data);
                }
            }
        };

        return editor;
    };
