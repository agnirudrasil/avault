import { jsx } from "slate-hyperscript";
import { paragraph } from "../../../markdown/rules/paragraph";

const TAGS: Record<string, Function> = {
    emoji: (token: any) => ({ ...token }),
    emote: (token: any) => ({ ...token }),
    blockQuote: () => ({
        type: "blockquote",
    }),
    codeBlock: (token: any) => ({
        type: "codeline",
        language: token.language,
    }),
    mention: (token: any) => ({ type: "mention", character: token.content }),
};

export const deserialize = (tokens: any): any => {
    let children = Array.from(
        tokens.content && Array.isArray(tokens.content)
            ? tokens.content
            : tokens
    ).flatMap(deserialize);

    if (children.length === 0) {
        children = [
            {
                type: paragraph,
                children: [
                    {
                        text:
                            tokens.type === "codeBlock"
                                ? `\`\`\`${tokens.language}\n${tokens.content}\n\`\`\``
                                : tokens.content,
                    },
                ],
            },
        ];
    }

    if (tokens.type === "text") {
        return jsx("text", {}, tokens.content);
    }

    if (tokens.type === "blockQuote") {
        return jsx(
            "element",
            { type: "blockquote" },
            tokens.content.map(deserialize)
        );
    }

    if (TAGS[tokens.type]) {
        return jsx("element", TAGS[tokens.type](tokens), children);
    }

    return children;
};
