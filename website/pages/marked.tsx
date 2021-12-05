import styled from "@emotion/styled";
import { Emoji } from "emoji-mart";
import { NextPage } from "next";
import React, { useEffect, useRef, useState } from "react";
import SimpleMarkdown from "simple-markdown";
import twemoji from "twemoji";
import { useGetUser } from "../hooks/requests/useGetUserName";
import { MentionIcon, MentionTypes } from "../types/mentions";

const MentionsSpan = styled.span`
    padding: 3px 3px 2px;
    margin: 0 1px;
    vertical-align: middle;
    display: inline-block;
    border-radius: 4px;
    background-color: #eee;
    background: #7e7eff;
    color: white;
    cursor: pointer;
    &:hover {
        background: #6d6dff;
        text-decoration: underline;
    }
`;

const Mentions: React.FC<{ id: string; type: MentionTypes }> = ({
    id,
    type,
}) => {
    const { data } = useGetUser(id);
    return (
        <MentionsSpan>
            {MentionIcon[type]}
            {data?.username}
        </MentionsSpan>
    );
};

const MentionsEveryone: React.FC = () => {
    return <MentionsSpan>@everyone</MentionsSpan>;
};

const Spoiler: React.FC<{ children: string }> = ({ children }) => {
    const [selected, setSelected] = React.useState(true);
    return (
        <span
            style={{
                display: "inline-block",
                verticalAlign: "middle",
                position: "relative",
                padding: "2px",
            }}
            onClick={() => setSelected(p => !p)}
        >
            <span
                style={{
                    position: "absolute",
                    backgroundColor: "black",
                    opacity: selected ? 1 : 0.15,
                    cursor: "pointer",
                    borderRadius: "4px",
                    transition: "all 0.2s ease",
                    zIndex: 2,
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                }}
            />
            {children}
        </span>
    );
};

const rules: SimpleMarkdown.ParserRules = {
    ...SimpleMarkdown.defaultRules,
    paragraph: {
        ...SimpleMarkdown.defaultRules.paragraph,
        react: (node: any, output, state) => {
            return <p key={state.key}>{output(node.content, state)}</p>;
        },
    },
    spoiler: {
        order: SimpleMarkdown.defaultRules.em.order - 0.5,
        match: (source: any) => /^\|\|([\s\S]+?)\|\|/.exec(source),
        parse: (capture: any, parse: any, state: any) => {
            return {
                content: parse(capture[1], state),
            };
        },
        react: (node: any, output: any, state: SimpleMarkdown.State) => {
            return (
                <Spoiler key={state.key}>{output(node.content, state)}</Spoiler>
            );
        },
    },
    strong: {
        ...SimpleMarkdown.defaultRules.strong,
        react: (node: any, output, state) => {
            return (
                <strong key={state.key}>{output(node.content, state)}</strong>
            );
        },
    },
    mentionsUser: {
        order: SimpleMarkdown.defaultRules.em.order - 0.5,
        match: (source: any) => {
            return /^<@(\d+)>/.exec(source);
        },
        parse: (capture: any) => {
            return {
                content: capture[1],
            };
        },
        react: (node: any, _: any, state: SimpleMarkdown.State) => {
            return (
                <Mentions type="user" key={state.key} id={node.content}>
                    {node.content}
                </Mentions>
            );
        },
    },
    mentionsRole: {
        order: SimpleMarkdown.defaultRules.em.order - 0.5,
        match: (source: any) => {
            return /^<@&(\d+)>/.exec(source);
        },
        parse: (capture: any) => {
            return {
                content: capture[1],
            };
        },
        react: (node: any, _: any, state: SimpleMarkdown.State) => {
            return (
                <Mentions type="role" key={state.key} id={node.content}>
                    {node.content}
                </Mentions>
            );
        },
    },
    mentionsChannel: {
        order: SimpleMarkdown.defaultRules.em.order - 0.5,
        match: (source: any) => {
            return /^<#(\d+)>/.exec(source);
        },
        parse: (capture: any) => {
            return {
                content: capture[1],
            };
        },
        react: (node: any, _: any, state: SimpleMarkdown.State) => {
            return (
                <Mentions type="channel" key={state.key} id={node.content}>
                    {node.content}
                </Mentions>
            );
        },
    },
    mentionsEveryone: {
        order: SimpleMarkdown.defaultRules.em.order - 0.5,
        match: (source: any) => {
            return /^@everyone/.exec(source);
        },
        parse: (capture: any) => {
            return {
                content: capture[1],
            };
        },
        react: (node: any, _: any, state: SimpleMarkdown.State) => {
            return (
                <MentionsEveryone key={state.key}>
                    {node.content}
                </MentionsEveryone>
            );
        },
    },
    text: {
        ...SimpleMarkdown.defaultRules.text,
        react: (node: any, _: any, state) => {
            return <span key={state.key}>{node.content}</span>;
        },
    },
    emojiCustom: {
        order: SimpleMarkdown.defaultRules.em.order - 0.5,
        match: (source: any) => {
            return /^<a?:([^:]+):(\d+)>/.exec(source);
        },
        parse: (capture: any) => {
            return {
                content: capture[1],
                id: capture[2],
            };
        },
        react: (node: any, _: any, state: SimpleMarkdown.State) => {
            return (
                <Emoji
                    key={state.key}
                    emoji={node.id}
                    size={24}
                    set="twitter"
                />
            );
        },
    },
};

const parser = SimpleMarkdown.parserFor(rules);
const reactOutput = SimpleMarkdown.outputFor(rules, "react" as any);

const blockParseAndOutput = (source: string) => {
    const blockSource = source + "\n\n";
    const parseTree = parser(blockSource, { inline: false });

    const outputResult = reactOutput(parseTree);
    return outputResult;
};

const MarkedTest: NextPage = () => {
    const [content, setContent] = useState("**h** 🔥 ");
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (ref.current) twemoji.parse(document.body);
    }, [content]);

    return (
        <div ref={ref}>
            {blockParseAndOutput(content)}
            <button
                onClick={() => {
                    setContent(p => {
                        const ch = Math.random();
                        return p + (ch > 0.5 ? "h 🥰 " : "**h** 🔥 ");
                    });
                }}
            >
                Change Text
            </button>
        </div>
    );
};

export default MarkedTest;
