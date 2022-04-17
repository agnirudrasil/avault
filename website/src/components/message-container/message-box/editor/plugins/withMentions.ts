import { Editor } from "slate";

export const withMentions = (editor: Editor) => {
    const { isInline, isVoid } = editor;

    editor.isInline = (element: any) => {
        return element.type === "mention" ? true : isInline(element);
    };

    editor.isVoid = (element: any) => {
        return element.type === "mention" ? true : isVoid(element);
    };

    return editor;
};
