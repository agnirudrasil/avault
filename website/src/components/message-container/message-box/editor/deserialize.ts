import {
    deserializeSyntaxTree,
    extraSpaces,
} from "../../../markdown/parsers/parseMessageContent";
import { jsx } from "slate-hyperscript";
import { SingleASTNode } from "simple-markdown";

const buildText = (token: SingleASTNode): string => {
    if (typeof token === "string") {
        return token;
    } else if (
        token?.type === "text" ||
        token?.type === "url" ||
        token?.type === "inlineCode"
    ) {
        return token.content;
    } else if (token?.type === "emoji" || token?.type === "mention") {
        return "";
    } else {
        //@ts-ignore
        return `${extraSpaces[token?.type]?.syntaxBefore || ""}${token?.content
            //@ts-ignore
            ?.map(t => buildText(t))
            //@ts-ignore
            .join("")}${extraSpaces[token?.type]?.syntaxAfter || ""}`;
    }
};

export const deserialize = (text: string) => {
    const tokens = deserializeSyntaxTree(text);

    const children = [];

    for (const token of tokens) {
        if (token.type === "blockQuote") {
            children.push(
                jsx("element", {}, [
                    {
                        type: "bulleted-list",
                        children: [
                            {
                                type: "list-item",
                                children: [{ text: "Hello World" }],
                            },
                        ],
                    },
                ])
            );
        } else if (token.type === "mention") {
        } else if (token.type === "emoji") {
        } else if (token.type === "text") {
        } else {
            children.push(jsx("text", {}, buildText(token)));
        }
    }

    return children;
};
