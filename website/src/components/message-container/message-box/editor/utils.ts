import { Editor, Element, Transforms } from "slate";

export const getBlock = (
    editor: Editor,
    format = "block-quote",
    blockType = "type"
) => {
    const { selection } = editor;
    if (!selection) return false;

    const [match] = Array.from(
        Editor.nodes(editor, {
            at: Editor.unhangRange(editor, selection),
            match: n =>
                !Editor.isEditor(n) &&
                Element.isElement(n) &&
                (n[blockType as keyof typeof n] as any) === format,
        })
    );

    return match;
};

export const isBlockActive = (
    editor: Editor,
    format = "block-quote",
    blockType = "type"
) => {
    return !!getBlock(editor, format, blockType);
};

const LIST_TYPES = ["bulleted-list"];

export const toggleBlock = (editor: Editor, format: string) => {
    const isActive = isBlockActive(editor, format);
    const isList = LIST_TYPES.includes(format);

    Transforms.unwrapNodes(editor, {
        match: n =>
            !Editor.isEditor(n) &&
            Element.isElement(n) &&
            LIST_TYPES.includes((n as any).type),
        split: true,
    });

    const newProperties: Partial<Element> = {
        type: isActive ? "paragraph" : isList ? "list-item" : format,
    } as any;

    Transforms.setNodes<Element>(editor, newProperties);

    if (!isActive && isList) {
        const block = { type: format, children: [] };
        Transforms.wrapNodes(editor, block);
    }
};
export const reset = (editor: Editor) => {
    const children = [...editor.children];

    children.forEach(node =>
        editor.apply({ type: "remove_node", path: [0], node })
    );

    Transforms.insertNodes(editor, {
        type: "paragraph",
        children: [{ text: "" }],
    } as any);
};

export const insertMention = (
    editor: Editor,
    character: {
        id: string;
        name: string;
        type: "channel" | "user" | "role" | "everyone";
        color?: number;
    }
) => {
    const mention = {
        type: "mention",
        character,
        children: [{ text: " " }],
    };
    Transforms.insertNodes(editor, [mention, { text: " " }]);
    Transforms.move(editor);
};
