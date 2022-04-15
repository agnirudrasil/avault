import {
    AddCircle,
    Code,
    EmojiEmotions,
    FormatAlignCenter,
    FormatAlignJustify,
    FormatAlignLeft,
    FormatAlignRight,
    FormatBold,
    FormatItalic,
    FormatListBulleted,
    FormatListNumbered,
    FormatQuote,
    FormatUnderlined,
    Gif,
    LooksOne,
    LooksTwo,
    Send,
} from "@mui/icons-material";
import {
    Paper,
    IconButton,
    List,
    ListItemText,
    ListItemButton,
    useTheme,
    Typography,
    Box,
    Stack,
    ToggleButton,
    Divider,
} from "@mui/material";
import produce from "immer";
import isHotkey from "is-hotkey";
import { useRouter } from "next/router";
import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import {
    createEditor,
    Descendant,
    Editor,
    Transforms,
    Range,
    Element as SlateElement,
    Node,
} from "slate";
import { withHistory } from "slate-history";
import {
    Editable,
    ReactEditor,
    RenderElementProps,
    RenderLeafProps,
    Slate,
    useSlate,
    withReact,
} from "slate-react";
import { useGuildsStore } from "../../../../stores/useGuildsStore";
import { Channel } from "../../../../types/channels";
import { ImagePreview } from "./ImagePreview";
import { useMessageCreate } from "../../../../hooks/requests/useMessageCreate";
import { useUserStore } from "../../../../stores/useUserStore";
import { Attachment } from "./attachment";

const Leaf = ({
    leaf,
    children,
    attributes,
}: RenderLeafProps & { leaf: any }) => {
    if (leaf.bold) {
        children = <strong>{children}</strong>;
    }

    if (leaf.code) {
        children = <code>{children}</code>;
    }

    if (leaf.italic) {
        children = <em>{children}</em>;
    }

    if (leaf.underline) {
        children = <u>{children}</u>;
    }

    return <span {...attributes}>{children}</span>;
};

const withMentions = (editor: Editor) => {
    const { isInline, isVoid } = editor;

    editor.isInline = element => {
        return (element as any).type === "mention" ? true : isInline(element);
    };

    editor.isVoid = element => {
        return (element as any).type === "mention" ? true : isVoid(element);
    };

    return editor;
};

const withRichText = (editor: Editor) => {
    return editor;
};

const insertMention = (editor: Editor, character: any) => {
    const mention: any = {
        type: "mention",
        character,
        children: [{ text: "" }],
    };
    Transforms.insertNodes(editor, mention);
    Transforms.move(editor);
};

const HOTKEYS = {
    "mod+b": "bold",
    "mod+i": "italic",
    "mod+u": "underline",
    "mod+`": "code",
};

const LIST_TYPES = ["numbered-list", "bulleted-list"];
const TEXT_ALIGN_TYPES = ["left", "center", "right", "justify"];

const Element = ({
    attributes,
    children,
    element,
}: RenderElementProps & { element: any }) => {
    const theme = useTheme();

    const style = { textAlign: element.align };

    switch (element.type) {
        case "block-quote":
            return (
                <blockquote
                    style={{
                        ...style,
                        borderLeft: `2px solid ${theme.palette.primary.dark}`,
                        marginLeft: 0,
                        paddingLeft: theme.spacing(2),
                    }}
                    {...attributes}
                >
                    {children}
                </blockquote>
            );
        case "bulleted-list":
            return (
                <ul style={style} {...attributes}>
                    {children}
                </ul>
            );
        case "heading-one":
            return (
                <h1 style={style} {...attributes}>
                    {children}
                </h1>
            );
        case "heading-two":
            return (
                <h2 style={style} {...attributes}>
                    {children}
                </h2>
            );
        case "list-item":
            return (
                <li style={style} {...attributes}>
                    {children}
                </li>
            );
        case "numbered-list":
            return (
                <ol style={style} {...attributes}>
                    {children}
                </ol>
            );
        case "mention":
            return (
                <span
                    {...attributes}
                    contentEditable={false}
                    style={{
                        padding: "3px 3px 2px",
                        margin: "0 1px",
                        verticalAlign: "baseline",
                        display: "inline-block",
                        borderRadius: "4px",
                        backgroundColor: theme.palette.primary.dark,
                        cursor: "default",
                    }}
                >
                    <Typography>@{(element as any).character}</Typography>
                    {children}
                </span>
            );
        default:
            return (
                <Typography sx={{ ...style, m: 0, p: 0 }} {...attributes}>
                    {children}
                </Typography>
            );
    }
};

export const MessageBox: React.FC<{
    channel: Channel;
}> = ({ channel }) => {
    const router = useRouter();
    const user = useUserStore(state => state.user);
    const { mutate } = useMessageCreate(channel?.id || "", user);
    const [upload, setUpload] = useState<Attachment[]>([]);
    const ref = useRef<HTMLDivElement | null>(null);
    const [initialValue, setValue] = useState<Descendant[]>([
        {
            children: [{ text: "" }],
        },
    ]);

    const members = useGuildsStore(
        state => state.guilds[router.query.guild as string]?.members
    );

    const chars: any[] = useMemo(
        () => Object.keys(members || {}).map(k => members[k].user.username),
        [members]
    );

    const editorRef = useRef<Editor | null>(null);

    const [target, setTarget] = useState<Range | null>(null);
    const [index, setIndex] = useState(0);
    const [search, setSearch] = useState("");

    if (!editorRef.current)
        editorRef.current = withMentions(
            withRichText(withHistory(withReact(createEditor())))
        );

    const editor = editorRef.current;

    const renderElement = useCallback(
        (props: RenderElementProps) => <Element {...props} />,
        []
    );

    const renderLeaf = useCallback(props => {
        return <Leaf {...props} />;
    }, []);

    useEffect(() => {
        if (target && chars.length > 0) {
            if (ref.current) {
                const el = ref.current;
                const domRange = ReactEditor.toDOMRange(editor, target);
                const rect = domRange.getBoundingClientRect();
                el.style.top = `${rect.top + window.pageYOffset + 24}px`;
                el.style.left = `${rect.left + window.pageXOffset}px`;
            }
        }
    }, [chars.length, editor, index, search, target]);

    const onKeyDown = useCallback(
        (event: React.KeyboardEvent<HTMLDivElement>) => {
            for (const hotkey in HOTKEYS) {
                if (isHotkey(hotkey, event)) {
                    event.preventDefault();
                    const mark = HOTKEYS[hotkey as keyof typeof HOTKEYS];
                    toggleMark(editor, mark);
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
                        insertMention(editor, chars[index]);
                        setTarget(null);
                        break;
                    case "Escape":
                        event.preventDefault();
                        setTarget(null);
                        break;
                }
            }
        },
        [index, search, target]
    );

    return (
        <Box sx={{ position: "relative" }}>
            {target && (
                <List
                    sx={{
                        position: "absolute",
                        zIndex: 1000,
                        bgcolor: "grey.900",
                        top: "calc(-50% - 16px)",
                        left: "16px",
                        right: "16px",
                        borderRadius: 2,
                        pl: 1,
                        pr: 1,
                    }}
                >
                    {chars.map((chan, i) => (
                        <ListItemButton
                            key={chan}
                            selected={i === index}
                            sx={{ borderRadius: 2 }}
                        >
                            <ListItemText primary={chan} />
                        </ListItemButton>
                    ))}
                </List>
            )}
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
                        const beforeMatch =
                            beforeText && beforeText.match(/^@(\w+)$/);
                        const after = Editor.after(editor, start);
                        const afterRange = Editor.range(editor, start, after);
                        const afterText = Editor.string(editor, afterRange);
                        const afterMatch = afterText.match(/^(\s|$)/);

                        if (beforeMatch && afterMatch) {
                            setTarget(beforeRange);
                            setSearch(beforeMatch[1]);
                            setIndex(0);
                            return;
                        }
                    }

                    setTarget(null);
                    setValue(value);
                }}
                value={initialValue}
                editor={editor}
            >
                <Paper
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        m: 2,
                        mt: "auto",
                        flexDirection: "column",
                        overflow: "hidden",
                        maxWidth: "100%",
                    }}
                    variant="outlined"
                >
                    <Paper
                        direction="row"
                        spacing={1}
                        sx={{ width: "100%", p: upload.length === 0 ? 0 : 2 }}
                        component={Stack}
                    >
                        {upload.map((file, index) => (
                            <ImagePreview
                                onEdit={name => {
                                    setUpload(
                                        produce(draft => {
                                            draft[index].filename = name;
                                        })
                                    );
                                }}
                                onDelete={() => {
                                    setUpload(upload =>
                                        upload.filter((_, i) => i !== index)
                                    );
                                }}
                                key={index}
                                file={file}
                            />
                        ))}
                    </Paper>
                    <Paper
                        component={Stack}
                        direction="row"
                        spacing={1}
                        sx={{
                            p: 0.5,
                            display: "flex",
                            alignItems: "center",
                            width: "100%",
                            border: "none",
                        }}
                    >
                        <MarkButton
                            channel={!channel}
                            format="bold"
                            Icon={<FormatBold />}
                        />
                        <MarkButton
                            channel={!channel}
                            format="italic"
                            Icon={<FormatItalic />}
                        />
                        <MarkButton
                            channel={!channel}
                            format="underline"
                            Icon={<FormatUnderlined />}
                        />
                        <MarkButton
                            channel={!channel}
                            format="code"
                            Icon={<Code />}
                        />
                        <Divider flexItem orientation="vertical" />
                        <BlockButton
                            channel={!channel}
                            format="heading-one"
                            Icon={<LooksOne />}
                        />
                        <BlockButton
                            channel={!channel}
                            format="heading-two"
                            Icon={<LooksTwo />}
                        />
                        <Divider flexItem orientation="vertical" />
                        <BlockButton
                            channel={!channel}
                            format="block-quote"
                            Icon={<FormatQuote />}
                        />
                        <BlockButton
                            channel={!channel}
                            format="numbered-list"
                            Icon={<FormatListNumbered />}
                        />
                        <BlockButton
                            channel={!channel}
                            format="bulleted-list"
                            Icon={<FormatListBulleted />}
                        />
                        <Divider flexItem orientation="vertical" />
                        <BlockButton
                            channel={!channel}
                            format="left"
                            Icon={<FormatAlignLeft />}
                        />
                        <BlockButton
                            channel={!channel}
                            format="center"
                            Icon={<FormatAlignCenter />}
                        />
                        <BlockButton
                            channel={!channel}
                            format="right"
                            Icon={<FormatAlignRight />}
                        />
                        <BlockButton
                            channel={!channel}
                            format="justify"
                            Icon={<FormatAlignJustify />}
                        />
                    </Paper>
                    <Stack width="100%">
                        <Editable
                            onKeyDown={onKeyDown}
                            renderLeaf={renderLeaf}
                            readOnly={!channel}
                            style={{ width: "100%", margin: "16px" }}
                            renderElement={renderElement}
                            spellCheck
                            autoFocus
                            placeholder={
                                channel
                                    ? `Message #${channel.name}`
                                    : "Select a channel to get started"
                            }
                        />
                    </Stack>
                    <Stack
                        sx={{ width: "100%" }}
                        direction="row"
                        justifyContent="flex-start"
                    >
                        <label htmlFor="icon-button-file">
                            <input
                                disabled={!channel}
                                id="icon-button-file"
                                type="file"
                                multiple
                                value={[]}
                                style={{ display: "none" }}
                                onChange={e => {
                                    setUpload(
                                        produce(draft => {
                                            if (e.target.files) {
                                                for (const file of e.target
                                                    .files) {
                                                    draft.push({ file });
                                                }
                                            }
                                        })
                                    );
                                }}
                            />
                            <IconButton
                                disabled={!channel}
                                aria-label="Attachments"
                                component="span"
                            >
                                <AddCircle />
                            </IconButton>
                        </label>
                        <IconButton
                            disabled={!channel}
                            sx={{ p: "10px" }}
                            aria-label="Emojis"
                        >
                            <EmojiEmotions />
                        </IconButton>
                        <IconButton
                            disabled={!channel}
                            sx={{ p: "10px" }}
                            aria-label="GIFs"
                        >
                            <Gif />
                        </IconButton>
                        <IconButton
                            disabled={!channel}
                            color="primary"
                            sx={{ p: "10px", ml: "auto" }}
                            aria-label="send"
                            onClick={async () => {
                                setUpload([]);
                                mutate({
                                    channelId: channel.id,
                                    content: initialValue
                                        .map(v => Node.string(v))
                                        .join("\n"),
                                    attachments: upload.map(file => ({
                                        file: file.file,
                                        filename:
                                            file.filename || file.file.name,
                                        description: file.description,
                                        processing: true,
                                    })),
                                });
                                setValue([
                                    {
                                        children: [{ text: "" }],
                                    },
                                ]);
                            }}
                        >
                            <Send />
                        </IconButton>
                    </Stack>
                </Paper>
            </Slate>
        </Box>
    );
};

const toggleBlock = (editor: Editor, format: string) => {
    const isActive = isBlockActive(
        editor,
        format,
        TEXT_ALIGN_TYPES.includes(format) ? "align" : "type"
    );

    const isList = LIST_TYPES.includes(format);

    Transforms.unwrapNodes(editor, {
        match: n =>
            !Editor.isEditor(n) &&
            SlateElement.isElement(n) &&
            LIST_TYPES.includes((n as any).type) &&
            !TEXT_ALIGN_TYPES.includes(format),
        split: true,
    });

    let newProperties: any;
    if (TEXT_ALIGN_TYPES.includes(format)) {
        newProperties = {
            align: (isActive ? undefined : format) as any,
        };
    } else {
        newProperties = {
            type: (isActive
                ? "paragraph"
                : isList
                ? "list-item"
                : format) as any,
        };
    }
    Transforms.setNodes<SlateElement>(editor, newProperties);

    if (!isActive && isList) {
        const block = { type: format, children: [] };
        Transforms.wrapNodes(editor, block);
    }
};

const toggleMark = (editor: Editor, format: string) => {
    const isActive = isMarkActive(editor, format);

    if (isActive) {
        Editor.removeMark(editor, format);
    } else {
        Editor.addMark(editor, format, true);
    }
};

const isBlockActive = (editor: Editor, format: string, blockType = "type") => {
    const { selection } = editor;
    if (!selection) return false;

    const [match] = Array.from(
        Editor.nodes(editor, {
            at: Editor.unhangRange(editor, selection),
            match: n =>
                !Editor.isEditor(n) &&
                SlateElement.isElement(n) &&
                (n[blockType as keyof typeof n] as any) === format,
        })
    );

    return !!match;
};

const isMarkActive = (editor: Editor, format: string) => {
    const marks = Editor.marks(editor);
    return marks ? marks[format as keyof typeof marks] === true : false;
};

const BlockButton: React.FC<{
    format: string;
    Icon: React.ReactNode;
    channel: boolean;
}> = ({ format, Icon, channel }) => {
    const editor = useSlate();
    return (
        <ToggleButton
            disabled={channel}
            value={format}
            selected={isBlockActive(
                editor,
                format,
                TEXT_ALIGN_TYPES.includes(format) ? "align" : "type"
            )}
            onClick={event => {
                event.preventDefault();
                toggleBlock(editor, format);
            }}
            disableRipple
            size="small"
            sx={{ maxWidth: "min-content", minWidth: 0, border: "none" }}
        >
            {Icon}
        </ToggleButton>
    );
};

const MarkButton: React.FC<{
    format: string;
    Icon: React.ReactNode;
    channel: boolean;
}> = ({ format, Icon, channel }) => {
    const editor = useSlate();
    return (
        <ToggleButton
            value={format}
            selected={isMarkActive(editor, format)}
            onClick={event => {
                event.preventDefault();
                toggleMark(editor, format);
            }}
            disabled={channel}
            size="small"
            disableRipple
            sx={{ maxWidth: "min-content", minWidth: 0, border: "none" }}
        >
            {Icon}
        </ToggleButton>
    );
};
