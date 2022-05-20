import { Clear, Group } from "@mui/icons-material";
import {
    ListItemButton,
    ListItemAvatar,
    Avatar,
    Link as MuiLink,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
} from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/router";
import { useDeleteChannel } from "../../../../hooks/requests/useDeleteChannel";
import { Channel } from "../../../../types/channels";
import { getGroupDMName } from "../../../getGroupDmName";

export const GroupDMChannel: React.FC<{ channel: Channel }> = ({ channel }) => {
    const router = useRouter();
    const { mutateAsync } = useDeleteChannel();

    return (
        <Link href={`/channels/@me/${channel.id}`}>
            <MuiLink sx={{ color: "white" }} underline="none">
                <ListItemButton
                    selected={router.query.channel === channel.id}
                    sx={{
                        borderRadius: "4px",
                        m: 1,
                        "&:hover .hidden": {
                            visibility: "visible",
                        },
                    }}
                >
                    <ListItemAvatar>
                        <Avatar
                            sx={{ bgcolor: "success.dark", color: "white" }}
                            src={
                                channel.icon
                                    ? `${process.env.NEXT_PUBLIC_CDN_URL}channel-icons/${channel.id}/${channel.icon}`
                                    : undefined
                            }
                        >
                            <Group />
                        </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                        sx={{
                            textOverflow: "ellipsis",
                            overflow: "hidden",
                            whiteSpace: "nowrap",
                        }}
                        primary={getGroupDMName(channel)}
                    />
                    <ListItemSecondaryAction
                        sx={{ visibility: "hidden" }}
                        className="hidden"
                    >
                        <IconButton
                            onClick={async () => {
                                await mutateAsync(channel.id);
                                router.replace("/channels/@me");
                            }}
                        >
                            <Clear />
                        </IconButton>
                    </ListItemSecondaryAction>
                </ListItemButton>
            </MuiLink>
        </Link>
    );
};
