import { defaultRules } from "simple-markdown";
import type { MarkdownRule } from "../parsers/MarkdownRule";

export const escape: MarkdownRule = {
    ...defaultRules.escape,
    parse: capture => {
        return {
            raw: capture[0],
            content: capture[1],
            type: "escape",
        };
    },
};
