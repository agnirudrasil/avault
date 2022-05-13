import {
    Avatar,
    Box,
    Divider,
    Paper,
    PaperProps,
    Stack,
    Typography,
} from "@mui/material";
import { User } from "../../stores/useUserStore";
import { DefaultProfilePic } from "./DefaultProfilePic";
import { Markdown } from "./markdown/Markdown";

interface Props {
    PaperProps?: Partial<PaperProps<"div", {}>>;
    user: Omit<User, "accent_color"> & { accent_color?: string };
}

export const ProfileCard: React.FC<Props> = ({ PaperProps, user }) => {
    return (
        <Paper {...PaperProps}>
            <Stack sx={{ width: "100%", position: "relative" }}>
                <Box
                    sx={{
                        bgcolor: user.accent_color || "primary.dark",
                        backgroundImage: user.banner
                            ? `url(${user.banner})`
                            : undefined,
                        backgroundSize: "contain",
                        backgroundRepeat: "no-repeat",
                        width: "100%",
                        height: user.banner ? "120px" : "60px",
                        borderRadius: "4px 4px 0 0",
                    }}
                />
                <Avatar
                    sx={{
                        width: "80px",
                        height: "80px",
                        position: "absolute",
                        left: "16px",
                        top: user.banner ? "70px" : "28px",
                        border: "7px solid",
                        borderColor: "grey.900",
                        boxSizing: "content-box",
                    }}
                    src={user.avatar}
                >
                    <DefaultProfilePic width={80} height={80} tag={user.tag} />
                </Avatar>
                <Box sx={{ width: "100%", padding: "54px 16px 0px 16px" }}>
                    <Typography variant="h6">
                        {user.username}
                        <Typography
                            variant="h6"
                            component="span"
                            color="GrayText"
                        >
                            {user.tag}
                        </Typography>
                    </Typography>
                </Box>
                {user.bio && (
                    <Stack spacing={2} sx={{ p: 2 }}>
                        <Divider flexItem />
                        <Stack spacing={1}>
                            <Typography variant="subtitle2">
                                ABOUT ME
                            </Typography>
                            <Typography>
                                <Markdown content={user.bio} />
                            </Typography>
                        </Stack>
                    </Stack>
                )}
            </Stack>
        </Paper>
    );
};
