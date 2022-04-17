import { defaultRules } from "simple-markdown";
import type { MarkdownRule } from "../parsers/MarkdownRule";

export const paragraph: MarkdownRule = {
    ...defaultRules.paragraph,
    react: (node, output, state) => (
        <p key={state.key}>{output(node.content, state)}</p>
    ),
};
