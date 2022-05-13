import { jsx } from "slate-hyperscript";

const TAGS: Record<string, Function> = {
    emoji: (token: any) => ({ ...token }),
    emote: (token: any) => ({ ...token }),
    blockQuote: () => ({
        type: "blockquote",
    }),
    mention: (token: any) => ({ type: "mention", character: token.content }),
};

export const deserialize = (token: any): any => {
    if (token.type === "text") {
        return jsx("text", {}, token.content);
    }

    let newToken = token;
    if (token.type === "blockQuote") {
        newToken = token.content;
    }

    let children: any[] = Array.from(newToken).map(deserialize).flat();

    if (children.length === 0) {
        children = [{ text: "" }];
    }

    if (TAGS[token.type]) {
        return jsx("element", TAGS[token.type](token), children);
    }

    return children;
};
