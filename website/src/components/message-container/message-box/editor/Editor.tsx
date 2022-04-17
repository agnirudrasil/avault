import { AddCircle, EmojiEmotions, Gif, Send } from "@mui/icons-material";
import {
    Divider,
    IconButton,
    List,
    ListItemButton,
    ListItemText,
    ListSubheader,
    Paper,
    Popover,
    Stack,
    ToggleButton,
} from "@mui/material";
import produce from "immer";
import React, { Fragment, useCallback, useRef, useState } from "react";
import {
    createEditor,
    Editor,
    NodeEntry,
    Node,
    Descendant,
    Transforms,
    Range,
} from "slate";
import { withHistory } from "slate-history";
import { Editable, Slate, withReact } from "slate-react";
import { serialize } from "./serialize";
import { useMessageCreate } from "../../../../../hooks/requests/useMessageCreate";
import { useUserStore } from "../../../../../stores/useUserStore";
import { Channel } from "../../../../../types/channels";
import { Attachment } from "../attachment";
import { ImagePreview } from "../ImagePreview";
import { decorate as decorateFn } from "./decorate";
import { Element } from "./Element";
import { Leaf } from "./Leaf";
import { withShortcuts } from "./plugins/withShortcuts";
import {
    getBlock,
    insertMention,
    isBlockActive,
    reset,
    toggleBlock,
} from "./utils";
import { StyledToggleButtonGroup } from "../../../StyledToggleButtonGroup";
import { Picker } from "emoji-mart";
import { GifPicker } from "../../../GifPicker/GifPicker";
import { withMentions } from "./plugins/withMentions";
import { useGuildsStore } from "../../../../../stores/useGuildsStore";
import { useRouter } from "next/router";
import { useChannelsStore } from "../../../../../stores/useChannelsStore";
import { withEmoji } from "./plugins/withEmoji";
import { Roles, useRolesStore } from "../../../../../stores/useRolesStore";

export const MessageEditor: React.FC<{ channel: Channel }> = ({ channel }) => {
    const router = useRouter();
    const [files, setFiles] = useState<Attachment[]>([]);
    const [picker, setPicker] = useState<string | null>(null);

    const [value, setValue] = useState<Descendant[]>([
        {
            type: "paragraph",
            children: [{ text: "" }],
        },
    ] as any);

    const [target, setTarget] = useState<Range | null>();
    const [index, setIndex] = useState(0);
    const [search, setSearch] = useState<{
        search: string;
        type: "channel" | "user";
    }>({ search: "", type: "user" });

    const editorRef = useRef<Editor | null>(null);
    const pickerRef = useRef(null);

    const user = useUserStore(state => state.user);
    const members = useGuildsStore(
        state => state.guilds[router.query.guild as string]?.members
    );
    const channels = useChannelsStore(
        state => state.channels[router.query.guild as string]
    );

    const roles = useRolesStore(state => state[router.query.guild as string]);

    const { mutate } = useMessageCreate(channel?.id || "", user);

    const handleFileUpload = useCallback(
        (file: File) => {
            setFiles(
                produce(draft => {
                    draft.push({
                        file,
                    });
                })
            );
        },
        [files]
    );

    if (!editorRef.current) {
        editorRef.current = withEmoji(handleFileUpload)(
            withMentions(withShortcuts(withHistory(withReact(createEditor()))))
        );
    }

    const editor = editorRef.current;
    const chars =
        search.type === "user"
            ? [
                  ...Object.keys(members ?? {})
                      .filter(k =>
                          `${members[k].user.username} ${members[k].nick || ""}`
                              .trim()
                              .toLowerCase()
                              .includes(search.search.trim().toLowerCase())
                      )
                      .slice(0, 10),
                  ...(roles ?? []).filter(
                      r =>
                          r.name
                              .toLowerCase()
                              .includes(search.search.trim().toLowerCase()) &&
                          r.mentionable
                  ),
              ]
            : Object.keys(channels ?? {})
                  .filter(
                      k =>
                          `${channels[k]?.name}`
                              .trim()
                              .toLowerCase()
                              .includes(search.search.trim().toLowerCase()) &&
                          channels[k].type === "GUILD_TEXT"
                  )
                  .slice(0, 10);

    const handleSubmit = useCallback(
        (content?: string) => {
            if (!content) {
                content = serialize(value).trim();
            }

            const isValid = [content, files.length > 0 ? files : null].some(
                e => e
            );
            if (!isValid) return;
            mutate({
                content,
                channelId: channel.id,
                attachments: files.map(({ file, description, filename }) => ({
                    file,
                    description,
                    filename: filename || file.name,
                    content_type: file.type,
                    size: file.size,
                    processing: true,
                })),
            });
            setFiles([]);
            reset(editor);
        },
        [value, files, editor]
    );

    const decorate = useCallback(decorateFn, []);
    const renderLeaf = useCallback(props => <Leaf {...props} />, []);
    const renderElement = useCallback(props => <Element {...props} />, []);
    const onKeydown = useCallback(
        (event: React.KeyboardEvent<HTMLDivElement>) => {
            if (event.key === "Enter" && event.shiftKey) {
                event.preventDefault();
                handleSubmit();
            }
            if (event.key === "Enter") {
                if (isBlockActive(editor, "list-item")) {
                    if (
                        !Node.string(
                            (
                                getBlock(editor, "list-item") as NodeEntry<Node>
                            )[0]
                        )
                    ) {
                        event.preventDefault();
                        toggleBlock(editor, "list-item");
                    }
                }
            }
            if (target) {
                switch (event.key) {
                    case "ArrowDown":
                        event.preventDefault();
                        const prevIndex =
                            index >= chars.length - 1 ? 0 : index + 1;
                        setIndex(prevIndex);
                        break;
                    case "ArrowUp":
                        event.preventDefault();
                        const nextIndex =
                            index <= 0 ? chars.length - 1 : index - 1;
                        setIndex(nextIndex);
                        break;
                    case "Tab":
                    case "Enter":
                        event.preventDefault();
                        Transforms.select(editor, target);

                        insertMention(editor, {
                            id:
                                typeof chars[index] === "string"
                                    ? (chars[index] as string)
                                    : (chars[index] as Roles).id,
                            name:
                                search.type === "channel"
                                    ? channels[chars[index] as string]?.name
                                    : typeof chars[index] === "string"
                                    ? members[chars[index] as string].user
                                          .username
                                    : (chars[index] as Roles).name,
                            type:
                                search.type === "channel"
                                    ? "channel"
                                    : typeof chars[index] === "string"
                                    ? "user"
                                    : "role",
                            color:
                                typeof chars[index] === "object"
                                    ? (chars[index] as Roles).color
                                    : undefined,
                        });
                        setTarget(null);
                        break;
                    case "Escape":
                        event.preventDefault();
                        setTarget(null);
                }
            }
        },
        [index, search, target, handleSubmit]
    );

    return (
        <Slate
            onChange={value => {
                const { selection } = editor;

                if (selection && Range.isCollapsed(selection)) {
                    const [start] = Range.edges(selection);
                    const wordBefore = Editor.before(editor, start, {
                        unit: "word",
                    });
                    const before =
                        wordBefore && Editor.before(editor, wordBefore);
                    const beforeRange =
                        before && Editor.range(editor, before, start);
                    const beforeText =
                        beforeRange && Editor.string(editor, beforeRange);
                    const beforeEveryoneMatch =
                        beforeText && beforeText.match(/@everyone/);
                    if (beforeEveryoneMatch) {
                        Transforms.select(editor, beforeRange);
                        insertMention(editor, {
                            id: "everyone",
                            name: "everyone",
                            type: "everyone",
                        });
                        return;
                    }
                    const beforeUserMatch =
                        beforeText && beforeText.match(/^@(\w+)$/);
                    const beforeChannelMatch =
                        beforeText && beforeText.match(/^#(\w+)$/);
                    const beforeMatch = beforeUserMatch || beforeChannelMatch;
                    const after = Editor.after(editor, start);
                    const afterRange = Editor.range(editor, start, after);
                    const afterText = Editor.string(editor, afterRange);
                    const afterMatch = afterText.match(/^(\s|$)/);

                    if (beforeMatch && afterMatch) {
                        setTarget(beforeRange);
                        setSearch({
                            search: beforeMatch[1],
                            type: beforeUserMatch ? "user" : "channel",
                        });
                        setIndex(0);
                        return;
                    }
                }

                setTarget(null);
                setValue(value);
            }}
            value={value}
            editor={editor}
        >
            <Paper
                sx={{
                    m: 2,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    position: "relative",
                }}
            >
                {target && chars.length > 0 && (
                    <List
                        sx={{
                            position: "absolute",
                            bottom: "calc(100% + 16px)",
                            left: 0,
                            right: 0,
                            bgcolor: "grey.900",
                            p: 1,
                            borderRadius: 1,
                        }}
                        dense
                    >
                        {chars.map((char, i, array) => (
                            <Fragment
                                key={typeof char === "string" ? char : char.id}
                            >
                                <ListItemButton
                                    onClick={() => {
                                        Transforms.select(editor, target);
                                        insertMention(editor, {
                                            id:
                                                typeof char === "string"
                                                    ? char
                                                    : char.id,
                                            name:
                                                search.type === "channel"
                                                    ? channels[char as string]
                                                          ?.name
                                                    : typeof char === "string"
                                                    ? members[char].user
                                                          .username
                                                    : char.name,
                                            type:
                                                search.type === "channel"
                                                    ? "channel"
                                                    : typeof char === "string"
                                                    ? "user"
                                                    : "role",
                                            color:
                                                typeof char === "object"
                                                    ? char.color
                                                    : undefined,
                                        });
                                        setTarget(null);
                                    }}
                                    selected={i === index}
                                    key={
                                        typeof char === "string"
                                            ? char
                                            : char.id
                                    }
                                >
                                    <ListItemText
                                        sx={{
                                            color:
                                                typeof char === "string"
                                                    ? undefined
                                                    : `#${char.color.toString(
                                                          16
                                                      )}`,
                                        }}
                                        primary={
                                            search.type === "channel"
                                                ? channels[char as string]?.name
                                                : typeof char === "string"
                                                ? members[char].user.username
                                                : char.name
                                        }
                                    />
                                </ListItemButton>
                                {typeof char === "string" &&
                                    typeof array[i + 1] === "object" && (
                                        <>
                                            <Divider />
                                            <ListSubheader disableSticky>
                                                ROLES
                                            </ListSubheader>
                                        </>
                                    )}
                            </Fragment>
                        ))}
                    </List>
                )}
                {files.length > 0 && (
                    <Stack
                        spacing={1}
                        direction="row"
                        alignItems="center"
                        sx={{
                            width: "100%",
                            maxWidth: "100%",
                            overflowX: "auto",
                            p: 1,
                            borderBottomWidth: `1px`,
                            borderBottomStyle: "solid",
                            borderBottomColor: "divider",
                        }}
                    >
                        {files.map((file, index) => (
                            <ImagePreview
                                onEdit={() => {}}
                                key={index}
                                file={file}
                                onDelete={() =>
                                    setFiles(prev =>
                                        prev.filter((_, i) => i !== index)
                                    )
                                }
                            />
                        ))}
                    </Stack>
                )}
                <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="center"
                    sx={{ width: "100%", m: 0.5, ml: 1, mr: 1 }}
                >
                    <label htmlFor="file-upload">
                        <input
                            type="file"
                            multiple
                            value={[]}
                            id="file-upload"
                            style={{ display: "none" }}
                            onChange={e => {
                                if (
                                    e.target.files &&
                                    e.target.files.length > 0
                                ) {
                                    for (const file of e.target.files) {
                                        handleFileUpload(file);
                                    }
                                }
                            }}
                        />
                        <IconButton component="span" disabled={!channel}>
                            <AddCircle />
                        </IconButton>
                    </label>
                    <Editable
                        readOnly={!channel}
                        autoFocus
                        onKeyDown={onKeydown}
                        decorate={decorate}
                        renderLeaf={renderLeaf}
                        renderElement={renderElement}
                        placeholder={
                            channel
                                ? `Message ${channel.name}`
                                : "Select a channel to get started"
                        }
                        style={{
                            width: "100%",
                            height: "min-content",
                            maxHeight: "140px",
                            overflowY: "auto",
                        }}
                    />
                    <StyledToggleButtonGroup
                        size="small"
                        ref={pickerRef}
                        value={picker}
                        exclusive
                        onChange={(_, value) => {
                            setPicker(value);
                        }}
                        disabled={!channel}
                    >
                        <ToggleButton value="emoji">
                            <EmojiEmotions />
                        </ToggleButton>
                        <ToggleButton value="gif">
                            <Gif />
                        </ToggleButton>
                    </StyledToggleButtonGroup>
                    <IconButton
                        onClick={() => handleSubmit()}
                        disabled={!channel}
                    >
                        <Send />
                    </IconButton>
                </Stack>
            </Paper>
            <Popover
                onClose={() => {
                    setPicker(null);
                }}
                anchorOrigin={{
                    vertical: "top",
                    horizontal: "right",
                }}
                transformOrigin={{
                    vertical: "bottom",
                    horizontal: "right",
                }}
                anchorEl={pickerRef.current}
                open={picker === "emoji"}
            >
                <Picker
                    set="twitter"
                    theme="dark"
                    onSelect={emoji => {
                        const data = new DataTransfer();
                        data.setData("text/plain", (emoji as any).native);
                        editor.insertData(data);
                    }}
                />
            </Popover>
            <Popover
                onClose={() => {
                    setPicker(null);
                }}
                anchorOrigin={{
                    vertical: "top",
                    horizontal: "right",
                }}
                transformOrigin={{
                    vertical: "bottom",
                    horizontal: "right",
                }}
                anchorEl={pickerRef.current}
                open={picker === "gif"}
            >
                <GifPicker
                    onShare={gif => {
                        handleSubmit(gif.src);
                    }}
                />
            </Popover>
        </Slate>
    );
};
