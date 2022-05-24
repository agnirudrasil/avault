import { Editor, Element, Point, Range, Transforms, Text } from "slate";
import { isBlockActive } from "../utils";

export const withBlockquote = (editor: Editor) => {
    const { normalizeNode, deleteBackward } = editor;

    editor.normalizeNode = nodeEntry => {
        const [node, path] = nodeEntry;
        if (Text.isText(node)) {
            if (
                node.text.startsWith("> ") &&
                !isBlockActive(editor, "blockquote") &&
                !isBlockActive(editor, "codeline")
            ) {
                Transforms.setNodes(editor, { type: "blockquote" } as any, {
                    match: n => Editor.isBlock(editor, n),
                });
                Transforms.insertText(editor, "", {
                    at: {
                        anchor: { path, offset: 0 },
                        focus: { path, offset: 2 },
                    },
                });
                return;
            }
        }

        normalizeNode(nodeEntry);
    };

    editor.deleteBackward = (...args) => {
        const { selection } = editor;

        if (selection && Range.isCollapsed(selection)) {
            const match = Editor.above(editor, {
                match: n => Editor.isBlock(editor, n),
            });

            if (match) {
                const [block, path] = match as any;
                const start = Editor.start(editor, path);

                if (
                    !Editor.isEditor(block) &&
                    Element.isElement(block) &&
                    (block as any).type !== "codeline" &&
                    (block as any).type !== "paragraph" &&
                    Point.equals(selection.anchor, start)
                ) {
                    const newProperties = {
                        type: "paragraph",
                    };
                    Transforms.setNodes(editor, newProperties as any);

                    return;
                }
            }

            deleteBackward(...args);
        }
    };

    return editor;
};
