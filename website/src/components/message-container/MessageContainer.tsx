import {
    AlternateEmail,
    Call,
    Group,
    PersonAddAlt1,
    Videocam,
} from "@mui/icons-material";
import {
    Divider,
    IconButton,
    List,
    ListItem,
    ListItemIcon,
    ListItemSecondaryAction,
    ListItemText,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import { ChannelIcon } from "../ChannelIcon";
import { useChannelsStore } from "../../../stores/useChannelsStore";
import { useRouter } from "next/router";
import { Messages } from "./Messages";
import { MarkAsRead } from "./MarkAsRead";
import MessageBox from "./message-box";
import { getGroupDMName } from "../../getGroupDmName";
import { Form, Formik } from "formik";
import { useChannelUpdate } from "../../../hooks/requests/useUpdateChannel";
import { CreateDMPicker } from "../CreateDmPicker";
import { LightTooltip } from "../LightTooltip";
import { ChannelPins } from "./ChannelPins";

export const MessageContainer: React.FC = () => {
    const router = useRouter();
    const channel = useChannelsStore(state =>
        router.query.guild
            ? state.channels[router.query.guild as string]?.[
                  router.query.channel as string
              ]
            : state.privateChannels[router.query.channel as string]
    );
    const { mutateAsync } = useChannelUpdate();

    return (
        <List
            disablePadding
            sx={{
                width: "100%",
                maxWidth: "100%",
                height: "100%",
                maxHeight: "100%",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
            }}
        >
            {channel && (
                <Stack sx={{ width: "100%" }}>
                    <ListItem
                        sx={{
                            maxWidth: "100%",
                            width: "100%",
                            bgcolor: "grey.800",
                        }}
                    >
                        <ListItemIcon sx={{ minWidth: "32px" }}>
                            {channel.type === "DM" ? (
                                <AlternateEmail />
                            ) : channel.type === "GROUP_DM" ? (
                                <Group />
                            ) : (
                                <ChannelIcon />
                            )}
                        </ListItemIcon>
                        <ListItemText
                            sx={{ maxWidth: "100%" }}
                            primary={
                                <Stack
                                    spacing={1}
                                    direction="row"
                                    divider={
                                        <Divider
                                            flexItem
                                            orientation="vertical"
                                        />
                                    }
                                >
                                    <Typography>
                                        {channel.type === "DM" ? (
                                            channel.recipients[0].username
                                        ) : channel.type === "GROUP_DM" ? (
                                            <Formik
                                                enableReinitialize
                                                initialValues={{
                                                    name: getGroupDMName(
                                                        channel
                                                    ),
                                                }}
                                                onSubmit={async values => {
                                                    if (values.name) {
                                                        await mutateAsync({
                                                            channelId:
                                                                channel.id,
                                                            data: {
                                                                name: values.name,
                                                            },
                                                        });
                                                    }
                                                }}
                                            >
                                                {({
                                                    values,
                                                    setFieldValue,
                                                    initialValues,
                                                    submitForm,
                                                    resetForm,
                                                }) => (
                                                    <Form>
                                                        <TextField
                                                            onBlur={async () => {
                                                                if (
                                                                    initialValues.name !==
                                                                    values.name
                                                                ) {
                                                                    await submitForm();
                                                                }
                                                                resetForm();
                                                            }}
                                                            size="small"
                                                            onChange={e =>
                                                                setFieldValue(
                                                                    "name",
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                            value={values.name}
                                                        />
                                                    </Form>
                                                )}
                                            </Formik>
                                        ) : (
                                            channel.name
                                        )}
                                    </Typography>
                                    {channel.topic && (
                                        <Typography
                                            sx={{
                                                maxWidth: "100%",
                                                whiteSpace: "nowrap",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                userSelect: "none",
                                                cursor: "pointer",
                                            }}
                                        >
                                            {channel.topic}
                                        </Typography>
                                    )}
                                </Stack>
                            }
                        />
                        <ListItemSecondaryAction>
                            {(channel.type === "DM" ||
                                channel.type === "GROUP_DM") && (
                                <>
                                    <IconButton>
                                        <Call />
                                    </IconButton>
                                    <IconButton>
                                        <Videocam />
                                    </IconButton>
                                </>
                            )}
                            {channel.type === "GROUP_DM" && (
                                <CreateDMPicker
                                    anchorOrigin={{
                                        vertical: "bottom",
                                        horizontal: "center",
                                    }}
                                    transformOrigin={{
                                        vertical: "top",
                                        horizontal: "right",
                                    }}
                                    filter={channel.recipients.map(r => r.id)}
                                    context="add"
                                >
                                    {handleOpen => (
                                        <LightTooltip title="Add Friends to DM">
                                            <IconButton onClick={handleOpen}>
                                                <PersonAddAlt1 />
                                            </IconButton>
                                        </LightTooltip>
                                    )}
                                </CreateDMPicker>
                            )}
                            <ChannelPins
                                channelId={router.query.channel as string}
                            />
                        </ListItemSecondaryAction>
                    </ListItem>
                    <MarkAsRead channelId={router.query.channel as string} />
                </Stack>
            )}
            <div style={{ marginBottom: "auto" }} />
            {channel && <Messages channel={channel} />}
            <MessageBox channel={channel} />
        </List>
    );
};
