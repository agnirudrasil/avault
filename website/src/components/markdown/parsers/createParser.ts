import { outputFor, parserFor, SingleASTNode } from "simple-markdown";
import type { MarkdownRule } from "./MarkdownRule";

export const createParser = (
    rules: Record<string, MarkdownRule>,
    transform?: (ast: SingleASTNode[]) => SingleASTNode[]
) => {
    const parse = parserFor(rules, { inline: true });
    const output = outputFor(rules, "react");

    return (content: string) => {
        let ast = parse(content);

        if (transform) {
            ast = transform(ast);
        }

        return output(ast);
    };
};

export const createASTParser = (rules: Record<string, MarkdownRule>) => {
    const parse = parserFor(rules, { inline: true });

    return (content: string) => parse(content);
};
