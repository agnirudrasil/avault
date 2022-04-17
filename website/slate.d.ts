import { BaseEditor } from "slate";
import { ReactEditor } from "slate-react";
import { HistoryEditor } from "slate-history";
import { MentionTypes } from "./types/mentions";
import { EmojiData } from "emoji-mart";

export type BlockQuoteElement = {
    type: "block-quote";
    align?: string;
    children: Descendant[];
};

export type BulletedListElement = {
    type: "bulleted-list";
    align?: string;
    children: Descendant[];
};

export type CheckListItemElement = {
    type: "check-list-item";
    checked: boolean;
    children: Descendant[];
};

export type EditableVoidElement = {
    type: "editable-void";
    children: EmptyText[];
};

export type HeadingElement = {
    type: "heading";
    align?: string;
    children: Descendant[];
};

export type HeadingTwoElement = {
    type: "heading-two";
    align?: string;
    children: Descendant[];
};

export type ImageElement = {
    type: "image";
    url: string;
    children: EmptyText[];
};

type CustomElement =
    | BlockQuoteElement
    | BulletedListElement
    | CheckListItemElement
    | EditableVoidElement
    | HeadingElement
    | HeadingTwoElement
    | ImageElement
    | LinkElement
    | ButtonElement
    | ListItemElement
    | MentionElement
    | ParagraphElement
    | TableElement
    | TableRowElement
    | TableCellElement
    | TitleElement
    | VideoElement;

export type CustomText = {
    punctuation?: boolean;
    strong?: boolean;
    emphasis?: boolean;
    inlineCode?: boolean;
    strikethrough?: boolean;
    url?: boolean;
    underline?: boolean;
    text: string;
};

declare module "slate" {
    interface CustomTypes {
        Editor: BaseEditor & ReactEditor & HistoryEditor;
        Element: CustomElement;
        Text: CustomText;
    }
}
