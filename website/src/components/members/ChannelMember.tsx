import { AcUnit } from "@mui/icons-material";
import {
    ListItemButton,
    ListItemAvatar,
    Avatar,
    ListItemText,
    Typography,
    ListItemIcon,
} from "@mui/material";
import { User } from "../../../stores/useUserStore";
import { DefaultProfilePic } from "../DefaultProfilePic";
import { LightTooltip } from "../LightTooltip";

export const ChannelMember: React.FC<{ member: User; owner: boolean }> = ({
    member,
    owner,
}) => {
    return (
        <ListItemButton sx={{ borderRadius: 2 }}>
            <ListItemAvatar>
                <Avatar
                    src={
                        member.avatar
                            ? `${process.env.NEXT_PUBLIC_CDN_URL}avatars/${member.id}/${member.avatar}`
                            : undefined
                    }
                >
                    <DefaultProfilePic tag={member.tag} />
                </Avatar>
            </ListItemAvatar>
            {owner && (
                <LightTooltip title="Owner">
                    <ListItemIcon sx={{ minWidth: 0 }}>
                        <AcUnit color="warning" />
                    </ListItemIcon>
                </LightTooltip>
            )}
            <ListItemText
                sx={{ width: "100%", whiteSpace: "nowrap" }}
                primary={<Typography>{member.username}</Typography>}
            />
        </ListItemButton>
    );
};
