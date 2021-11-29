import { BaseEditor } from "slate";
import { ReactEditor } from "slate-react";
import { HistoryEditor } from "slate-history";
import { MentionTypes } from "./types/mentions";

type CustomElement = ParagraphElement | EmojiElement | MentionsElement;

type ParagraphElement = {
    type: "paragraph";
    children: CustomText[];
};

type MentionsElement = {
    type: "mentions";
    mentionType: MentionTypes;
    name: string;
    id: string;
    children: CustomText[];
};

type EmojiElement = {
    type: "emoji";
    id: string;
    name: string;
    children: CustomText[];
};

type CustomText = {
    text: string;
    strong?: boolean;
    em?: boolean;
    code?: boolean;
    underline?: boolean;
    link?: boolean;
    blockquote?: boolean;
    del?: boolean;
    spoiler?: boolean;
};

declare module "slate" {
    interface CustomTypes {
        Editor: BaseEditor & ReactEditor & HistoryEditor;
        Element: CustomElement;
        Text: CustomText;
    }
}
