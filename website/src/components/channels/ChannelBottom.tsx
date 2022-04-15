import {
    MicOff,
    Mic,
    HeadsetOff,
    Headphones,
    Logout,
} from "@mui/icons-material";
import {
    ListItem,
    ListItemAvatar,
    Avatar,
    ListItemText,
    Typography,
    ToggleButton,
} from "@mui/material";
import { useState } from "react";
import { useUserStore } from "../../../stores/useUserStore";
import { copyToClipboard } from "../../copy";
import { DefaultProfilePic } from "../DefaultProfilePic";
import { LightTooltip } from "../LightTooltip";
import { StyledToggleButtonGroup } from "../StyledToggleButtonGroup";

export const ChannelBottom = () => {
    const [alignment, setAlignment] = useState(() => ["mic", "deafen"]);
    const user = useUserStore(state => state.user);

    const handleAlignment = (
        _: React.MouseEvent<HTMLElement>,
        newAlignment: string[]
    ) => {
        setAlignment(newAlignment);
    };

    return (
        <ListItem
            sx={{
                marginTop: "auto",
                borderTop: "1px solid",
                borderColor: "background.paper",
                bgcolor: "common.black",
                p: 1,
                pr: 0,
            }}
        >
            <ListItemAvatar sx={{ minWidth: 40 }}>
                <Avatar sx={{ width: 32, height: 32 }}>
                    <DefaultProfilePic tag={user.tag} />
                </Avatar>
            </ListItemAvatar>
            <LightTooltip title="Click to copy username">
                <ListItemText
                    sx={{ cursor: "pointer", maxWidth: "100%" }}
                    onClick={() => {
                        copyToClipboard(`${user.username}${user.tag}`);
                    }}
                    primary={
                        <Typography
                            component="p"
                            sx={{
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                maxWidth: "100%",
                                overflow: "hidden",
                            }}
                            variant="body2"
                        >
                            {user.username}
                        </Typography>
                    }
                    secondary={
                        <Typography color="GrayText" variant="caption">
                            {user.tag}
                        </Typography>
                    }
                />
            </LightTooltip>
            <StyledToggleButtonGroup
                size="small"
                sx={{ ml: 1 }}
                value={alignment}
                onChange={handleAlignment}
            >
                <ToggleButton value="mic">
                    <LightTooltip
                        title={alignment.includes("mic") ? "Unmute" : "Mute"}
                    >
                        {alignment.includes("mic") ? <MicOff /> : <Mic />}
                    </LightTooltip>
                </ToggleButton>
                <ToggleButton value="deafen">
                    <LightTooltip
                        title={
                            alignment.includes("deafen") ? "Undeafen" : "Deafen"
                        }
                    >
                        {alignment.includes("deafen") ? (
                            <HeadsetOff />
                        ) : (
                            <Headphones />
                        )}
                    </LightTooltip>
                </ToggleButton>
                <ToggleButton color="error" value="logout">
                    <LightTooltip title="Logout">
                        <Logout />
                    </LightTooltip>
                </ToggleButton>
            </StyledToggleButtonGroup>
        </ListItem>
    );
};
