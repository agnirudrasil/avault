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
        syntaxBefore: "> ",
        syntaxAfter: "",
        length: 2,
    },
    codeBlock: {
        length: 2,
        syntaxBefore: "```",
        syntaxAfter: "```",
    },
    emphasis: {
        syntaxBefore: "*",
        syntaxAfter: "*",
        length: 2,
    },
    escape: {
        syntaxBefore: "\\",
        syntaxAfter: "",
        length: 1,
    },
    inlineCode: {
        syntaxBefore: "`",
        syntaxAfter: "`",
        length: 2,
    },
    emoji: {
        syntaxBefore: "",
        syntaxAfter: "",
        length: 0,
    },
    link: {
        syntaxBefore: "",
        syntaxAfter: "",
        length: 4,
    },
    mention: {
        syntaxBefore: "<@",
        syntaxAfter: ">",
        length: 3,
    },
    newline: {
        syntaxBefore: "",
        syntaxAfter: "",
        length: 2,
    },
    spoiler: {
        syntaxBefore: "||",
        syntaxAfter: "||",
        length: 4,
    },
    strikethrough: {
        syntaxBefore: "~~",
        syntaxAfter: "~~",
        length: 4,
    },
    strong: {
        syntaxBefore: "**",
        syntaxAfter: "**",
        length: 4,
    },
    underline: {
        syntaxBefore: "__",
        syntaxAfter: "__",
        length: 4,
    },
    url: {
        syntaxBefore: "",
        syntaxAfter: "",
        length: 0,
    },
    text: {
        syntaxBefore: "",
        syntaxAfter: "",
        length: 0,
    },
};

const AST_PARSERS = {
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
};

export const deserializeSyntaxTree = createASTParser({
    ...AST_PARSERS,
    blockQuote,
});

export const syntaxTree = createASTParser(AST_PARSERS);

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
