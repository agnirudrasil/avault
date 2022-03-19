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
import { link } from "../rules/link";
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
    blockQuote: 2,
    codeBlock: 6,
    emphasis: 2,
    escape: 1,
    inlineCode: 2,
    emoji: 0,
    link: 4,
    mention: 3,
    newline: 2,
    spoiler: 4,
    strikethrough: 4,
    strong: 4,
    underline: 4,
    url: 0,
};

export const syntaxTree = createASTParser({
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
    link,
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
        link,
        mention,
        newline,
        paragraph,
        spoiler,
        strikethrough,
        strong,
        text,
        underline,
        url,
    },
    jumbosizeEmojis
);
