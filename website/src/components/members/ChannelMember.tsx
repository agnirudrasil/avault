import {
    ListItemButton,
    ListItemAvatar,
    Avatar,
    ListItemText,
    Typography,
} from "@mui/material";
import { User } from "../../../stores/useUserStore";
import { DefaultProfilePic } from "../DefaultProfilePic";

export const ChannelMember: React.FC<{ member: User }> = ({ member }) => {
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
            <ListItemText
                primary={<Typography>{member.username}</Typography>}
            />
        </ListItemButton>
    );
};
