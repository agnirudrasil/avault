import { SingleASTNode } from "simple-markdown";
import { NodeEntry, BaseRange, Text, Node } from "slate";
import {
    syntaxTree,
    extraSpaces,
} from "../../../markdown/parsers/parseMessageContent";

export const decorate: (node: NodeEntry<Node>) => BaseRange[] = ([
    node,
    path,
]) => {
    const ranges: BaseRange[] = [];

    if (!Text.isText(node)) {
        return ranges;
    }

    const getLength = (token: SingleASTNode) => {
        if (typeof token.content === "string") {
            return token.content.length;
        } else if (token.type === "text") {
            return token.content.length;
        } else {
            return token.content.reduce(
                (l: any, t: any) => l + getLength(t),
                0
            );
        }
    };

    let start = 0;

    const tokens = syntaxTree(node.text);

    for (const token of tokens) {
        const length = getLength(token);
        const syntaxBefore =
            start +
            extraSpaces[token.type as keyof typeof extraSpaces].syntaxBefore;
        const end = syntaxBefore + length;
        const syntaxAfter =
            end +
            extraSpaces[token.type as keyof typeof extraSpaces].syntaxAfter;
        if (token.type !== "text") {
            ranges.push({
                punctuation: true,
                anchor: { path, offset: start },
                focus: {
                    path,
                    offset: syntaxBefore,
                },
            } as any);
            ranges.push({
                [token.type]: true,
                anchor: {
                    path,
                    offset: syntaxBefore,
                },
                focus: { path, offset: end },
            });
            ranges.push({
                punctuation: true,
                anchor: { path, offset: end },
                focus: {
                    path,
                    offset: syntaxAfter,
                },
            } as any);
        }
        start = syntaxAfter;
    }

    return ranges;
};
