import { Lock } from "@mui/icons-material";
import {
    List,
    Stack,
    Typography,
    ListItemText,
    Box,
    Avatar,
    Button,
    ListItem,
    ListItemSecondaryAction,
    Divider,
} from "@mui/material";
import { useRoutesStore } from "../../../../stores/useRoutesStore";
import { useUserStore } from "../../../../stores/useUserStore";
import { DefaultProfilePic } from "../../DefaultProfilePic";
import { ChangePassword } from "../../dialogs/ChangePassword";
import { MFAAuthFlowDialog } from "../../dialogs/MFAuthFlowDialog";
import { Remove2FA } from "../../dialogs/Remove2FA";
import { UpdateUsernameDialog } from "../../dialogs/UpdateUsernameDialog";
import { UserSettings } from "../../layouts/routes/UserSettings";

export const UserSettingsIndex = () => {
    const user = useUserStore(state => state.user);
    const setRoute = useRoutesStore(state => state.setRoute);

    return (
        <UserSettings>
            <Stack sx={{ width: "600px", height: "max-content" }} spacing={3}>
                <Typography variant="h5" fontWeight="bold">
                    My Account
                </Typography>
                <Stack sx={{ height: "max-content" }}>
                    <Box
                        sx={{
                            bgcolor: user.banner_color ?? "primary.dark",
                            width: "100%",
                            height: user.banner ? "240px" : "100px",
                            borderRadius: "10px 10px 0 0",
                            backgroundSize: "cover",
                            backgroundImage: user.banner
                                ? `url(${process.env.NEXT_PUBLIC_CDN_URL}banners/${user.id}/${user.banner})`
                                : undefined,
                        }}
                    />
                    <Box
                        sx={{
                            width: "100%",
                            height: "70px",
                            bgcolor: "grey.900",
                            position: "relative",
                        }}
                    >
                        <Avatar
                            sx={{
                                width: "80px",
                                height: "80px",
                                position: "absolute",
                                left: "16px",
                                transform: "translateY(-30%)",
                                border: "7px solid",
                                borderColor: "grey.900",
                                boxSizing: "content-box",
                            }}
                            src={
                                user.avatar
                                    ? `${process.env.NEXT_PUBLIC_CDN_URL}avatars/${user.id}/${user.avatar}`
                                    : undefined
                            }
                        >
                            <DefaultProfilePic
                                width={80}
                                height={80}
                                tag={user.tag}
                            />
                        </Avatar>
                        <Stack
                            direction="row"
                            justifyContent="space-between"
                            sx={{
                                width: "100%",
                                padding: "16px 16px 0 120px",
                            }}
                        >
                            <Typography variant="h6">
                                {user.username}
                                <Typography
                                    variant="h6"
                                    color="GrayText"
                                    component="span"
                                >
                                    {user.tag}
                                </Typography>
                            </Typography>
                            <Button
                                disableElevation
                                size="small"
                                variant="contained"
                                onClick={() => {
                                    setRoute("/user-settings/profile");
                                }}
                            >
                                Edit User Profile
                            </Button>
                        </Stack>
                    </Box>
                    <Box
                        sx={{
                            borderRadius: "0 0 10px 10px",
                            width: "100%",
                            bgcolor: "grey.900",
                            p: 2,
                        }}
                    >
                        <List
                            sx={{
                                width: "100%",
                                bgcolor: "grey.800",
                                borderRadius: "10px",
                            }}
                            dense
                        >
                            <ListItem
                                secondaryAction={
                                    <ListItemSecondaryAction>
                                        <UpdateUsernameDialog user={user} />
                                    </ListItemSecondaryAction>
                                }
                            >
                                <ListItemText
                                    secondary={
                                        <Typography>
                                            {user.username}
                                            <Typography
                                                color="GrayText"
                                                component="span"
                                            >
                                                {user.tag}
                                            </Typography>
                                        </Typography>
                                    }
                                    primary={
                                        <Typography
                                            color="GrayText"
                                            variant="button"
                                        >
                                            username
                                        </Typography>
                                    }
                                />
                            </ListItem>
                        </List>
                    </Box>
                </Stack>
                <Divider flexItem />
                <Typography variant="h5" fontWeight="bold">
                    Password and Authentication
                </Typography>
                <ChangePassword />
                <Typography
                    sx={{ display: "flex" }}
                    variant="button"
                    color={user.mfa_enabled ? "success.dark" : "undefined"}
                >
                    {user.mfa_enabled && (
                        <span
                            style={{
                                verticalAlign: "center",
                                display: "inline-block",
                            }}
                        >
                            <Lock fontSize="small" />
                        </span>
                    )}
                    <span>
                        two-factor authentication{" "}
                        {user.mfa_enabled ? "enabled" : ""}
                    </span>
                </Typography>
                {user.mfa_enabled ? (
                    <Remove2FA />
                ) : (
                    <MFAAuthFlowDialog user={user} />
                )}
                <Divider flexItem />
                <Typography variant="button">account removal</Typography>
                <Stack direction="row" spacing={1}>
                    <Button disableElevation variant="contained" color="error">
                        Disable Account
                    </Button>
                    <Button disableElevation variant="outlined" color="error">
                        Delete Account
                    </Button>
                </Stack>
            </Stack>
        </UserSettings>
    );
};
