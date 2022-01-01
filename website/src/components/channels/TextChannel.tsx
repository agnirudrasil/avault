import { PersonAdd, Settings } from "@mui/icons-material";
import {
    IconButton,
    ListItemButton,
    ListItemIcon,
    ListItemSecondaryAction,
    ListItemText,
    SvgIcon,
} from "@mui/material";
import { useRouter } from "next/router";
import { useMemo } from "react";
import { Draggable } from "react-beautiful-dnd";
import { useCreateInvite } from "../../../hooks/useCreateInvite";
import { usePermssions } from "../../../hooks/usePermissions";
import { useRoutesStore } from "../../../stores/useRoutesStore";
import { Overwrites } from "../../../types/channels";
import { checkPermissions } from "../../compute-permissions";
import { Permissions } from "../../permissions";
import { ChannelIcon, PrivateChannelIcon } from "../ChannelIcon";

export const TextChannel: React.FC<{
    name: string;
    id: string;
    index: number;
    overwrites: Overwrites[];
}> = ({ name, id, index, overwrites }) => {
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
        <Draggable draggableId={id} index={index}>
            {provided => (
                <ListItemButton
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    onClick={() =>
                        router.replace(
                            `/channels/${router.query.server_id}/${id}`
                        )
                    }
                    sx={{
                        borderRadius: "7px",
                        maxWidth: "100%",
                        textOverflow: "ellipsis",
                    }}
                    selected={router.query.channel === id}
                >
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
                        {checkPermissions(
                            permissions,
                            Permissions.MANAGE_CHANNELS
                        ) && (
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
            )}
        </Draggable>
    ) : null;
};
