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
                Transforms.setNodes(
                    editor,
                    { type: "blockquote" },
                    { match: n => Editor.isBlock(editor, n) }
                );
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
                const [block, path] = match;
                const start = Editor.start(editor, path);

                if (
                    !Editor.isEditor(block) &&
                    Element.isElement(block) &&
                    block.type !== "codeline" &&
                    block.type !== "paragraph" &&
                    Point.equals(selection.anchor, start)
                ) {
                    const newProperties: Partial<Element> = {
                        type: "paragraph",
                    };
                    Transforms.setNodes(editor, newProperties);

                    return;
                }
            }

            deleteBackward(...args);
        }
    };

    return editor;
};
