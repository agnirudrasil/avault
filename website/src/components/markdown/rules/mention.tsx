import React from "react";
import { defaultRules, inlineRegex } from "simple-markdown";
import type { MarkdownRule } from "../parsers/MarkdownRule";
import { Mentions } from "../../mentions";

const MENTION_RE = /^<(@!?|@&|#)(\d+)>|^(@(?:everyone))/;

const MENTION_TYPES = new Map(
    Object.entries({
        "@": "user",
        "@!": "user",
        "@&": "role",
        "#": "channel",
    })
);

export const mention: MarkdownRule = {
    order: defaultRules.text.order,
    match: inlineRegex(MENTION_RE),
    parse: capture => {
        const [, type, digits, everyoneOrHere] = capture;

        if (everyoneOrHere) {
            return {
                content: { id: "", type: "everyone" },
            };
        }

        return {
            content: {
                id: digits,
                type: MENTION_TYPES.get(type),
            },
        };
    },
    react: (node, _, state) => (
        <Mentions
            key={state.key}
            id={node.content.id}
            type={node.content.type}
        />
    ),
};
