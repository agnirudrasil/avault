import { PersonAdd, Settings } from "@mui/icons-material";
import {
    IconButton,
    ListItemButton,
    ListItemIcon,
    ListItemSecondaryAction,
    ListItemText,
    SvgIcon,
} from "@mui/material";
import Head from "next/head";
import { useRouter } from "next/router";
import { useMemo } from "react";
import { useCreateInvite } from "../../../hooks/useCreateInvite";
import { usePermssions } from "../../../hooks/usePermissions";
import { useRoutesStore } from "../../../stores/useRoutesStore";
import { Channel, Overwrites } from "../../../types/channels";
import { checkPermissions } from "../../compute-permissions";
import { hasUnread } from "../../has-unread";
import { Permissions } from "../../permissions";
import {
    ChannelIcon,
    PrivateChannelIcon,
} from "../../../src/components/ChannelIcon";

export const TextChannel: React.FC<{
    name: string;
    id: string;
    index: number;
    channel: Channel;
    overwrites: Overwrites[];
}> = ({ name, id, overwrites, channel }) => {
    const router = useRouter();
    const setRoute = useRoutesStore(s => s.setRoute);
    const { createInvite } = useCreateInvite();
    const { permissions } = usePermssions(router.query.server_id as string, id);
    const isChannelPrivate = useMemo(() => {
        const overwrite = overwrites.find(
            o => o.id === (router.query.server_id as string)
        );
        if (
            overwrite &&
            checkPermissions(BigInt(overwrite.deny), Permissions.VIEW_CHANNEL)
        ) {
            return true;
        }
    }, [overwrites]);

    return checkPermissions(permissions, Permissions.VIEW_CHANNEL) ? (
        <ListItemButton
            onClick={() =>
                router.replace(`/channels/${router.query.server_id}/${id}`)
            }
            sx={{
                borderRadius: "7px",
                maxWidth: "100%",
                textOverflow: "ellipsis",
                position: "relative",
                marginLeft: "0.5rem",
                marginRight: "0.5rem",
                "::before": {
                    content: "''",
                    position: "absolute",
                    top: "50%",
                    left: "-0.8rem",
                    width: "7px",
                    height: "10px",
                    borderRadius: "0 100px 100px 0",
                    backgroundColor: "black",
                    transform: `translateY(-50%) scaleY(${
                        hasUnread(channel.last_read, channel.last_message_id)
                            ? 1
                            : 0
                    })`,
                },
            }}
            selected={router.query.channel === id}
        >
            {router.query.channel === id && (
                <Head>
                    <title>{name}</title>
                </Head>
            )}
            <ListItemIcon sx={{ minWidth: "30px" }}>
                <SvgIcon>
                    {isChannelPrivate ? (
                        <PrivateChannelIcon />
                    ) : (
                        <ChannelIcon />
                    )}
                </SvgIcon>
            </ListItemIcon>
            <ListItemText primary={name} />
            <ListItemSecondaryAction>
                {checkPermissions(
                    permissions,
                    Permissions.CREATE_INSTANT_INVITE
                ) && (
                    <IconButton
                        onClick={() =>
                            createInvite({
                                channel_id: id,
                            })
                        }
                        size="small"
                    >
                        <PersonAdd fontSize="small" />
                    </IconButton>
                )}
                {checkPermissions(permissions, Permissions.MANAGE_CHANNELS) && (
                    <IconButton
                        onClick={() => {
                            setRoute(`/channel-settings`);
                        }}
                        size="small"
                    >
                        <Settings fontSize="small" />
                    </IconButton>
                )}
            </ListItemSecondaryAction>
        </ListItemButton>
    ) : null;
};
