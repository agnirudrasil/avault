import { PersonAdd, Settings, VolumeOff, VolumeUp } from "@mui/icons-material";
import {
    IconButton,
    ListItemButton,
    ListItemIcon,
    ListItemSecondaryAction,
    ListItemText,
} from "@mui/material";
import Head from "next/head";
import { useRouter } from "next/router";
import { useMemo } from "react";
import { useCreateInvite } from "../../../hooks/useCreateInvite";
import { usePermssions } from "../../../hooks/usePermissions";
import { useRoutesStore } from "../../../stores/useRoutesStore";
import { Overwrites } from "../../../types/channels";
import { checkPermissions } from "../../compute-permissions";
import { Permissions } from "../../permissions";

export const VoiceChannel: React.FC<{
    name: string;
    id: string;
    overwrites: Overwrites[];
}> = ({ name, id, overwrites }) => {
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
            checkPermissions(
                BigInt(overwrite.deny),
                Permissions.VIEW_CHANNEL
            ) &&
            checkPermissions(BigInt(overwrite.deny), Permissions.CONNECT)
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
            }}
            selected={router.query.channel === id}
        >
            {router.query.channel === id && (
                <Head>
                    <title>{name}</title>
                </Head>
            )}
            <ListItemIcon sx={{ minWidth: "30px" }}>
                {isChannelPrivate ? <VolumeOff /> : <VolumeUp />}
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
