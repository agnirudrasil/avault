import { jumbosizeEmojis } from "../emoji/jumbosizeEmojis";
import { autolink } from "../rules/autolink";
import { blockQuote } from "../rules/blockQuote";
import { codeBlock } from "../rules/codeBlock";
import { customEmoji } from "../rules/customEmoji";
import { emoji } from "../rules/emoji";
import { emote } from "../rules/emote";
import { emphasis } from "../rules/emphasis";
import { escape } from "../rules/escape";
import { inlineCode } from "../rules/inlineCode";
import { lineBreak } from "../rules/lineBreak";
import { mention } from "../rules/mention";
import { newline } from "../rules/newline";
import { paragraph } from "../rules/paragraph";
import { spoiler } from "../rules/spoiler";
import { strikethrough } from "../rules/strikethrough";
import { strong } from "../rules/strong";
import { text } from "../rules/text";
import { underline } from "../rules/underline";
import { url } from "../rules/url";
import { createASTParser, createParser } from "./createParser";

export const extraSpaces = {
    blockQuote: {
        syntaxBefore: 2,
        syntaxAfter: 0,
        length: 2,
    },
    codeBlock: {
        length: 2,
        syntaxBefore: 3,
        syntaxAfter: 3,
    },
    emphasis: {
        syntaxBefore: 1,
        syntaxAfter: 1,
        length: 2,
    },
    escape: {
        syntaxBefore: 1,
        syntaxAfter: 0,
        length: 1,
    },
    inlineCode: {
        syntaxBefore: 1,
        syntaxAfter: 1,
        length: 2,
    },
    emoji: {
        syntaxBefore: 0,
        syntaxAfter: 0,
        length: 0,
    },
    link: {
        syntaxBefore: 0,
        syntaxAfter: 0,
        length: 4,
    },
    mention: {
        syntaxBefore: 2,
        syntaxAfter: 1,
        length: 3,
    },
    newline: {
        syntaxBefore: 0,
        syntaxAfter: 0,
        length: 2,
    },
    spoiler: {
        syntaxBefore: 2,
        syntaxAfter: 2,
        length: 4,
    },
    strikethrough: {
        syntaxBefore: 2,
        syntaxAfter: 2,
        length: 4,
    },
    strong: {
        syntaxBefore: 2,
        syntaxAfter: 2,
        length: 4,
    },
    underline: {
        syntaxBefore: 2,
        syntaxAfter: 2,
        length: 4,
    },
    url: {
        syntaxBefore: 0,
        syntaxAfter: 0,
        length: 0,
    },
    text: {
        syntaxBefore: 0,
        syntaxAfter: 0,
        length: 0,
    },
};

export const syntaxTree = createASTParser({
    autolink,
    codeBlock,
    customEmoji,
    emoji,
    emote,
    emphasis,
    escape,
    inlineCode,
    lineBreak,
    mention,
    newline,
    paragraph,
    spoiler,
    strikethrough,
    strong,
    text,
    underline,
    url,
});

export const parseEmoji = createASTParser({
    emoji,
});

export const parseMessageContent = createParser(
    {
        autolink,
        blockQuote,
        codeBlock,
        customEmoji,
        emoji,
        emote,
        emphasis,
        escape,
        inlineCode,
        lineBreak,
        mention,
        newline,
        paragraph,
        spoiler,
        strikethrough,
        strong,
        text,
        underline,
    },
    jumbosizeEmojis
);
