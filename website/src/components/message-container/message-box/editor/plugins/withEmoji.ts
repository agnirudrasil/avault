import { Editor, Transforms } from "slate";
import { syntaxTree } from "../../../../markdown/parsers/parseMessageContent";

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
                    const tree = syntaxTree(text);
                    for (const item of tree) {
                        if (item.type === "emoji") {
                            console.log(item);
                            Transforms.insertFragment(editor, [
                                {
                                    type: "emoji",
                                    emoji: item.emoji,
                                    src: item.src,
                                    children: [{ text: " " }],
                                },
                                { text: " " },
                            ] as any);
                            Transforms.move(editor);
                            return;
                        }
                    }
                } else {
                    insertData(data);
                }
            }
        };

        return editor;
    };
