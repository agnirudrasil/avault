import React from "react";
import {
    IconButton,
    Paper,
    ToggleButtonGroup,
    ToggleButton,
    Tooltip,
    styled,
    Popover,
} from "@mui/material";
import { AddCircle, EmojiEmotions, Send, Gif } from "@mui/icons-material";
import { useRouter } from "next/router";
import { Field, Form, Formik } from "formik";
import { MessageField } from "./CustomTextField";
import { useMessageCreate } from "../../hooks/requests/useMessageCreate";
import { useChannelsStore } from "../../stores/useChannelsStore";
import { Picker } from "emoji-mart";
import { GifPicker } from "./GifPicker/GifPicker";
import { usePermssions } from "../../hooks/usePermissions";
import { checkPermissions } from "../compute-permissions";
import { Permissions } from "../permissions";

const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
    "& .MuiToggleButtonGroup-grouped": {
        margin: theme.spacing(0.5),
        border: 0,
        "&.Mui-disabled": {
            border: 0,
        },
        "&:not(:first-of-type)": {
            borderRadius: theme.shape.borderRadius,
        },
        "&:first-of-type": {
            borderRadius: theme.shape.borderRadius,
        },
    },
}));

export const MessageBox: React.FC = () => {
    const router = useRouter();
    const channel = useChannelsStore(
        state => state[router.query.server_id as string]
    );
    const [open, setOpen] = React?.useState<{
        type: "emoji" | "gif";
        anchorEl?: HTMLElement;
    } | null>({ type: "emoji" });
    const currentChannel = channel?.find(c => c.id === router.query.channel);
    const { mutateAsync } = useMessageCreate(router.query.channel as string);
    const { permissions } = usePermssions(
        router.query.server_id as string,
        currentChannel?.id || ""
    );

    const handleChange = (
        event: React.MouseEvent<HTMLElement>,
        newPick: string[] | null
    ) => {
        if (!newPick) {
            setOpen(null);
        } else {
            setOpen({
                type: newPick[0] as "emoji" | "gif",
                anchorEl: event.currentTarget,
            });
        }
    };

    return (
        <Formik
            initialValues={{
                content: "",
            }}
            onSubmit={async ({ content }, { setSubmitting, setValues }) => {
                content = content.trim();
                if (!content) return;
                await mutateAsync(content);
                setValues({ content: "" });
                setSubmitting(false);
            }}
        >
            {({ submitForm, setFieldValue, values }) => (
                <Form
                    onKeyDown={async e => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            await submitForm();
                        }
                    }}
                    style={{ width: "100%" }}
                >
                    {open && (
                        <Popover
                            open={Boolean(open.anchorEl)}
                            anchorOrigin={{
                                vertical: "top",
                                horizontal: "center",
                            }}
                            transformOrigin={{
                                vertical: "bottom",
                                horizontal: "center",
                            }}
                            onClose={() => setOpen(null)}
                            anchorEl={open.anchorEl}
                        >
                            {open.type === "emoji" ? (
                                <Paper>
                                    <Picker
                                        onSelect={emoji => {
                                            setFieldValue(
                                                "content",
                                                `${values.content}${
                                                    (emoji as any).native
                                                }`
                                            );
                                        }}
                                    />
                                </Paper>
                            ) : (
                                <GifPicker
                                    onShare={async url => {
                                        setFieldValue("content", url);
                                        await submitForm();
                                        setOpen(null);
                                    }}
                                />
                            )}
                        </Popover>
                    )}
                    <Paper
                        variant={
                            checkPermissions(
                                permissions,
                                Permissions.SEND_MESSAGES
                            )
                                ? "elevation"
                                : "outlined"
                        }
                        component="div"
                        sx={{
                            p: "2px 4px",
                            display: "flex",
                            alignItems: "center",
                            width: "100%",
                            marginTop: "2rem",
                            position: "sticky",
                            left: "0",
                            bottom: "0",
                        }}
                    >
                        {checkPermissions(
                            permissions,
                            Permissions.ATTACH_FILES
                        ) && (
                            <Tooltip title="Attachments Coming Soon">
                                <IconButton
                                    sx={{ p: "10px" }}
                                    aria-label="menu"
                                >
                                    <AddCircle />
                                </IconButton>
                            </Tooltip>
                        )}
                        <Field
                            component={MessageField}
                            name="content"
                            type="text"
                            disabled={
                                !checkPermissions(
                                    permissions,
                                    Permissions.SEND_MESSAGES
                                )
                            }
                            placeholder={
                                checkPermissions(
                                    permissions,
                                    Permissions.SEND_MESSAGES
                                )
                                    ? `Message #${currentChannel?.name ?? ""}`
                                    : "You don't have permission to send messages in this channel"
                            }
                        />
                        <StyledToggleButtonGroup onChange={handleChange}>
                            {checkPermissions(
                                permissions,
                                Permissions.EMBED_LINKS
                            ) &&
                                checkPermissions(
                                    permissions,
                                    Permissions.SEND_MESSAGES
                                ) && (
                                    <ToggleButton
                                        value="gif"
                                        sx={{ p: "10px" }}
                                        aria-label="search"
                                    >
                                        <Gif />
                                    </ToggleButton>
                                )}
                            {checkPermissions(
                                permissions,
                                Permissions.SEND_MESSAGES
                            ) && (
                                <ToggleButton
                                    value="emoji"
                                    sx={{ p: "10px" }}
                                    aria-label="search"
                                >
                                    <EmojiEmotions />
                                </ToggleButton>
                            )}
                        </StyledToggleButtonGroup>
                        {checkPermissions(
                            permissions,
                            Permissions.SEND_MESSAGES
                        ) && (
                            <IconButton
                                color="primary"
                                sx={{ p: "10px" }}
                                aria-label="directions"
                                type="submit"
                            >
                                <Send />
                            </IconButton>
                        )}
                    </Paper>
                </Form>
            )}
        </Formik>
    );
};
