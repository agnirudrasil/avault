import { Node } from "slate";
export const serialize = (node: any[]) => {
    return node
        .map(n => {
            if (n.type === "paragraph") {
                return n.children
                    .map((n: any) =>
                        n.type === "emoji"
                            ? n.emoji + n.children[0].text
                            : n.type === "mention"
                            ? n.character.type === "user"
                                ? `<@${n.character.id}>`
                                : n.character.type === "channel"
                                ? `<#${n.character.id}>`
                                : n.character.type === "role"
                                ? `<@&${n.character.id}>`
                                : n.character.type === "everyone"
                                ? `@everyone`
                                : n.children[0].text
                            : Node.string(n)
                    )
                    .join("");
            } else {
                return n.children
                    ?.map(
                        (n: any) =>
                            `> ${n.children
                                .map((n: any) =>
                                    n.type === "emoji"
                                        ? n.emoji + n.children[0].text
                                        : n.type === "mention"
                                        ? n.character.type === "user"
                                            ? `<@${n.character.id}>`
                                            : n.character.type === "channel"
                                            ? `<#${n.character.id}>`
                                            : n.character.type === "role"
                                            ? `<@&${n.character.id}>`
                                            : n.character.type === "everyone"
                                            ? `@everyone`
                                            : n.children[0].text
                                        : Node.string(n)
                                )
                                .join("")}\n`
                    )
                    .join("");
            }
        })
        .join("\n");
};

[
    {
        type: "paragraph",
        children: [
            {
                text: "",
            },
            {
                type: "emoji",
                emoji: "🥰",
                src: "https://twemoji.maxcdn.com/v/13.0.1/svg/1f970.svg",
                children: [
                    {
                        text: " ",
                    },
                ],
            },
            {
                text: " ",
            },
            {
                type: "emoji",
                emoji: "🤪",
                src: "https://twemoji.maxcdn.com/v/13.0.1/svg/1f92a.svg",
                children: [
                    {
                        text: " ",
                    },
                ],
            },
            {
                text: " Hey there",
            },
        ],
    },
    {
        type: "bulleted-list",
        children: [
            {
                type: "list-item",
                children: [
                    {
                        text: "Block quote ",
                    },
                    {
                        type: "emoji",
                        emoji: "🤨",
                        src: "https://twemoji.maxcdn.com/v/13.0.1/svg/1f928.svg",
                        children: [
                            {
                                text: " ",
                            },
                        ],
                    },
                    {
                        text: " hey there",
                    },
                ],
            },
            {
                type: "list-item",
                children: [
                    {
                        text: "nice hello",
                    },
                ],
            },
        ],
    },
    {
        type: "paragraph",
        children: [
            {
                text: "paragraph **block** *italics*",
            },
        ],
    },
];
