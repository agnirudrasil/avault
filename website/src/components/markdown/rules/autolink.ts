import { defaultRules } from "simple-markdown";
import { parseUrl } from "../helpers/parseUrl";
import type { MarkdownRule } from "../parsers/MarkdownRule";
import { link } from "./link";

export const autolink: MarkdownRule = {
    ...defaultRules.autolink,
    match: (s, state, p) => {
        const capture = defaultRules.autolink.match(s, state, p);
        if (!capture) {
            return null;
        }
        if (!s.endsWith("/")) {
            capture[1] = capture[1].slice(0, capture[1].length - 1);
        }
        return capture;
    },
    parse: parseUrl,
    react: link.react,
};
